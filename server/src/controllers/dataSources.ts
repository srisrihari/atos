import { Request, Response, NextFunction } from 'express';
import { DataSourceService } from '../services/dataSource.js';
import { dbAdmin } from '../services/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Validation schemas
const createDataSourceSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['csv', 'excel', 'googleSheets']),
  config: z.object({
    spreadsheetId: z.string().optional(),
    credentials: z.record(z.unknown()).optional()
  }).optional()
});

export const dataSourceController = {
  uploadMiddleware: upload.single('file'),

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.auth?.userId;
      if (!userId) throw new AppError('User not authenticated', 401);

      const validatedData = createDataSourceSchema.parse(req.body);
      const file = req.file;

      let parsedData;
      let dataTypes;

      switch (validatedData.type) {
        case 'csv':
          if (!file) throw new AppError('CSV file is required', 400);
          parsedData = await DataSourceService.parseCSV(file.path);
          break;

        case 'excel':
          if (!file) throw new AppError('Excel file is required', 400);
          parsedData = await DataSourceService.parseExcel(file.path);
          break;

        case 'googleSheets':
          if (!validatedData.config?.spreadsheetId || !validatedData.config?.credentials) {
            throw new AppError('Google Sheets configuration is required', 400);
          }
          parsedData = await DataSourceService.parseGoogleSheet(
            validatedData.config.spreadsheetId,
            validatedData.config.credentials
          );
          break;

        default:
          throw new AppError('Unsupported data source type', 400);
      }

      // Validate data structure
      DataSourceService.validateData(parsedData);

      // Infer data types
      dataTypes = DataSourceService.inferDataTypes(parsedData);

      // Store in database
      const { data, error } = await dbAdmin.supabase
        .from('data_sources')
        .insert({
          name: validatedData.name,
          type: validatedData.type,
          config: {
            ...validatedData.config,
            headers: parsedData.headers,
            dataTypes,
            rowCount: parsedData.rows.length
          },
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;

      // Clean up uploaded file if necessary
      if (file) {
        await fs.unlink(file.path).catch(console.error);
      }

      res.status(201).json(data);
    } catch (error) {
      // Clean up uploaded file in case of error
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.auth?.userId;
      if (!userId) throw new AppError('User not authenticated', 401);

      const { data, error } = await dbAdmin.supabase
        .from('data_sources')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  async getPreview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.auth?.userId;
      if (!userId) throw new AppError('User not authenticated', 401);

      const dataSourceId = req.params.id;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);

      const { data: dataSource, error: dataSourceError } = await dbAdmin.supabase
        .from('data_sources')
        .select('*')
        .eq('id', dataSourceId)
        .eq('user_id', userId)
        .single();

      if (dataSourceError) throw dataSourceError;
      if (!dataSource) throw new AppError('Data source not found', 404);

      // For this example, we'll return mock preview data
      // In a real implementation, you would fetch actual data from the source
      const previewData = {
        headers: dataSource.config.headers,
        dataTypes: dataSource.config.dataTypes,
        rows: [] // Would contain actual preview rows
      };

      res.json(previewData);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.auth?.userId;
      if (!userId) throw new AppError('User not authenticated', 401);

      const dataSourceId = req.params.id;

      const { error } = await dbAdmin.supabase
        .from('data_sources')
        .delete()
        .eq('id', dataSourceId)
        .eq('user_id', userId);

      if (error) throw error;

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};

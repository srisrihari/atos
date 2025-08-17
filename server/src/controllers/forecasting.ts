import { Request, Response, NextFunction } from 'express';
import { ForecastingService } from '../services/forecasting.js';
import { dbAdmin } from '../services/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { z } from 'zod';

const generateForecastSchema = z.object({
  dataSourceId: z.string().uuid(),
  targetColumn: z.string(),
  timeColumn: z.string(),
  horizon: z.number().int().positive(),
  features: z.array(z.string()).optional()
});

export const forecastingController = {
  async generateForecast(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.auth?.userId;
      if (!userId) throw new AppError('User not authenticated', 401);

      const validatedData = generateForecastSchema.parse(req.body);

      // Get data from data source
      const { data: dataSource } = await dbAdmin.supabase
        .from('data_sources')
        .select('*')
        .eq('id', validatedData.dataSourceId)
        .eq('user_id', userId)
        .single();

      if (!dataSource) {
        throw new AppError('Data source not found', 404);
      }

      // Validate columns exist in data source
      const headers = dataSource.config.headers;
      if (!headers.includes(validatedData.targetColumn)) {
        throw new AppError('Target column not found in data source', 400);
      }
      if (!headers.includes(validatedData.timeColumn)) {
        throw new AppError('Time column not found in data source', 400);
      }
      if (validatedData.features) {
        validatedData.features.forEach(feature => {
          if (!headers.includes(feature)) {
            throw new AppError(`Feature column "${feature}" not found in data source`, 400);
          }
        });
      }

      // Get the data
      const { data: timeSeriesData, error: dataError } = await dbAdmin.supabase
        .from(dataSource.config.tableName)
        .select(headers.join(','))
        .order(validatedData.timeColumn, { ascending: true });

      if (dataError) throw dataError;

      // Generate forecast
      const forecast = await ForecastingService.generateForecast({
        data: timeSeriesData,
        targetColumn: validatedData.targetColumn,
        timeColumn: validatedData.timeColumn,
        horizon: validatedData.horizon,
        features: validatedData.features
      });

      // Store forecast results
      const { data: storedForecast, error: storageError } = await dbAdmin.supabase
        .from('forecasts')
        .insert({
          user_id: userId,
          data_source_id: validatedData.dataSourceId,
          target_column: validatedData.targetColumn,
          time_column: validatedData.timeColumn,
          horizon: validatedData.horizon,
          features: validatedData.features,
          results: forecast
        })
        .select()
        .single();

      if (storageError) throw storageError;

      res.json(storedForecast);
    } catch (error) {
      next(error);
    }
  },

  async detectAnomalies(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.auth?.userId;
      if (!userId) throw new AppError('User not authenticated', 401);

      const { dataSourceId, targetColumn, timeColumn } = req.body;

      // Get data from data source
      const { data: dataSource } = await dbAdmin.supabase
        .from('data_sources')
        .select('*')
        .eq('id', dataSourceId)
        .eq('user_id', userId)
        .single();

      if (!dataSource) {
        throw new AppError('Data source not found', 404);
      }

      // Get the data
      const { data: timeSeriesData, error: dataError } = await dbAdmin.supabase
        .from(dataSource.config.tableName)
        .select(`${timeColumn},${targetColumn}`)
        .order(timeColumn, { ascending: true });

      if (dataError) throw dataError;

      const anomalies = await ForecastingService.detectAnomalies(
        timeSeriesData,
        targetColumn,
        timeColumn
      );

      res.json(anomalies);
    } catch (error) {
      next(error);
    }
  },

  async analyzeSeasonality(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.auth?.userId;
      if (!userId) throw new AppError('User not authenticated', 401);

      const { dataSourceId, targetColumn, timeColumn } = req.body;

      // Get data from data source
      const { data: dataSource } = await dbAdmin.supabase
        .from('data_sources')
        .select('*')
        .eq('id', dataSourceId)
        .eq('user_id', userId)
        .single();

      if (!dataSource) {
        throw new AppError('Data source not found', 404);
      }

      // Get the data
      const { data: timeSeriesData, error: dataError } = await dbAdmin.supabase
        .from(dataSource.config.tableName)
        .select(`${timeColumn},${targetColumn}`)
        .order(timeColumn, { ascending: true });

      if (dataError) throw dataError;

      const seasonality = await ForecastingService.analyzeSeasonality(
        timeSeriesData,
        targetColumn,
        timeColumn
      );

      res.json(seasonality);
    } catch (error) {
      next(error);
    }
  }
};

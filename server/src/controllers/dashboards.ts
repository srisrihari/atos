import { Request, Response, NextFunction } from 'express';
import { dbAdmin } from '../services/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { z } from 'zod';

// Validation schemas
const createDashboardSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  layout: z.object({
    columns: z.number().int().positive(),
    rows: z.number().int().positive(),
    gridGap: z.number().int().nonnegative()
  }).optional(),
  widgets: z.array(z.object({
    id: z.string().uuid(),
    type: z.string(),
    title: z.string(),
    position: z.object({
      x: z.number().int().nonnegative(),
      y: z.number().int().nonnegative()
    }),
    size: z.object({
      width: z.number().int().positive(),
      height: z.number().int().positive()
    }),
    dataSource: z.string().uuid(),
    settings: z.record(z.unknown())
  })).optional()
});

export const dashboardController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.auth?.userId;
      if (!userId) throw new AppError('User not authenticated', 401);

      const validatedData = createDashboardSchema.parse(req.body);

      const { data, error } = await dbAdmin.supabase
        .from('dashboards')
        .insert({
          ...validatedData,
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.auth?.userId;
      if (!userId) throw new AppError('User not authenticated', 401);

      const { data, error } = await dbAdmin.supabase
        .from('dashboards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.auth?.userId;
      if (!userId) throw new AppError('User not authenticated', 401);

      const dashboardId = req.params.id;
      const dashboard = await dbAdmin.getDashboardWithInsights(dashboardId);

      if (!dashboard) {
        throw new AppError('Dashboard not found', 404);
      }

      if (dashboard.user_id !== userId) {
        throw new AppError('Unauthorized', 403);
      }

      res.json(dashboard);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.auth?.userId;
      if (!userId) throw new AppError('User not authenticated', 401);

      const dashboardId = req.params.id;
      const updates = req.body;

      const { data: existingDashboard } = await dbAdmin.supabase
        .from('dashboards')
        .select('user_id')
        .eq('id', dashboardId)
        .single();

      if (!existingDashboard) {
        throw new AppError('Dashboard not found', 404);
      }

      if (existingDashboard.user_id !== userId) {
        throw new AppError('Unauthorized', 403);
      }

      const { data, error } = await dbAdmin.supabase
        .from('dashboards')
        .update(updates)
        .eq('id', dashboardId)
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.auth?.userId;
      if (!userId) throw new AppError('User not authenticated', 401);

      const dashboardId = req.params.id;

      const { data: existingDashboard } = await dbAdmin.supabase
        .from('dashboards')
        .select('user_id')
        .eq('id', dashboardId)
        .single();

      if (!existingDashboard) {
        throw new AppError('Dashboard not found', 404);
      }

      if (existingDashboard.user_id !== userId) {
        throw new AppError('Unauthorized', 403);
      }

      const { error } = await dbAdmin.supabase
        .from('dashboards')
        .delete()
        .eq('id', dashboardId);

      if (error) throw error;

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};

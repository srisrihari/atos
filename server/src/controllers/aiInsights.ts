import { Request, Response, NextFunction } from 'express';
import { AIInsightService } from '../services/aiInsights.js';
import { AppError } from '../middleware/errorHandler.js';
import { z } from 'zod';

const generateInsightsSchema = z.object({
  dataSourceId: z.string().uuid()
});

export const aiInsightsController = {
  async generateInsights(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.auth?.userId;
      if (!userId) throw new AppError('User not authenticated', 401);

      const validatedData = generateInsightsSchema.parse(req.body);
      
      const insights = await AIInsightService.generateInsights(
        validatedData.dataSourceId,
        userId
      );

      res.json(insights);
    } catch (error) {
      next(error);
    }
  },

  async getInsights(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.auth?.userId;
      if (!userId) throw new AppError('User not authenticated', 401);

      const dataSourceId = req.params.dataSourceId;

      const { data, error } = await dbAdmin.supabase
        .from('ai_insights')
        .select('*')
        .eq('data_source_id', dataSourceId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  async suggestVisualizations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.auth?.userId;
      if (!userId) throw new AppError('User not authenticated', 401);

      const { columns, dataTypes } = req.body;
      
      const suggestions = await AIInsightService.suggestVisualizations(
        columns,
        dataTypes
      );

      res.json({ suggestions });
    } catch (error) {
      next(error);
    }
  }
};

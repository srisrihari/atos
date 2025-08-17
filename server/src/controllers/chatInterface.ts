import { Request, Response, NextFunction } from 'express';
import { ChatInterfaceService } from '../services/chatInterface.js';
import { dbAdmin } from '../services/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { z } from 'zod';

const askQuestionSchema = z.object({
  question: z.string().min(1),
  dataSourceId: z.string().uuid(),
  context: z.object({
    previousQuestions: z.array(z.string()).optional(),
    currentResults: z.any().optional()
  }).optional()
});

export const chatInterfaceController = {
  async askQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.auth?.userId;
      if (!userId) throw new AppError('User not authenticated', 401);

      const validatedData = askQuestionSchema.parse(req.body);

      // Get data source structure
      const { data: dataSource } = await dbAdmin.supabase
        .from('data_sources')
        .select('*')
        .eq('id', validatedData.dataSourceId)
        .eq('user_id', userId)
        .single();

      if (!dataSource) {
        throw new AppError('Data source not found', 404);
      }

      // Generate SQL query
      const query = await ChatInterfaceService.generateSQLQuery(
        validatedData.question,
        {
          headers: dataSource.config.headers,
          dataTypes: dataSource.config.dataTypes
        }
      );

      // Execute query and get results
      const { data: queryResults, error: queryError } = await dbAdmin.supabase
        .from(dataSource.config.tableName)
        .select()
        .filter(query);

      if (queryError) {
        throw new AppError(`Query execution failed: ${queryError.message}`, 400);
      }

      // Generate natural language response
      const explanation = await ChatInterfaceService.generateNaturalLanguageResponse(
        queryResults,
        validatedData.question
      );

      // Generate follow-up questions if context is provided
      let followUpQuestions;
      if (validatedData.context) {
        followUpQuestions = await ChatInterfaceService.suggestFollowUpQuestions({
          previousQuestions: validatedData.context.previousQuestions || [],
          dataStructure: {
            headers: dataSource.config.headers,
            dataTypes: dataSource.config.dataTypes
          },
          currentResults: queryResults
        });
      }

      // Store the interaction
      await dbAdmin.supabase
        .from('chat_interactions')
        .insert({
          user_id: userId,
          data_source_id: validatedData.dataSourceId,
          question: validatedData.question,
          query,
          response: explanation,
          results: queryResults
        });

      res.json({
        query,
        results: queryResults,
        explanation,
        followUpQuestions
      });
    } catch (error) {
      next(error);
    }
  },

  async getQueryExplanation(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req.body;
      
      const explanation = await ChatInterfaceService.explainQuery(query);
      
      res.json({ explanation });
    } catch (error) {
      next(error);
    }
  },

  async getChatHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.auth?.userId;
      if (!userId) throw new AppError('User not authenticated', 401);

      const { data, error } = await dbAdmin.supabase
        .from('chat_interactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      res.json(data);
    } catch (error) {
      next(error);
    }
  }
};

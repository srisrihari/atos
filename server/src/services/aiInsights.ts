import OpenAI from 'openai';
import { dbAdmin } from './supabase.js';
import { AppError } from '../middleware/errorHandler.js';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export class AIInsightService {
  static async generateInsights(dataSourceId: string, userId: string) {
    // Fetch data source
    const { data: dataSource } = await dbAdmin.supabase
      .from('data_sources')
      .select('*')
      .eq('id', dataSourceId)
      .eq('user_id', userId)
      .single();

    if (!dataSource) {
      throw new AppError('Data source not found', 404);
    }

    // Analyze data structure
    const dataStructure = {
      columns: dataSource.config.headers,
      types: dataSource.config.dataTypes,
      rowCount: dataSource.config.rowCount
    };

    // Generate insights using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a data analyst AI that provides insights about datasets. Focus on identifying patterns, trends, and anomalies."
        },
        {
          role: "user",
          content: `Analyze this dataset structure and provide key insights:
            Columns: ${JSON.stringify(dataStructure.columns)}
            Data Types: ${JSON.stringify(dataStructure.types)}
            Row Count: ${dataStructure.rowCount}
            
            Provide 5 specific insights about what kind of analysis would be valuable for this data structure.`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const insights = response.choices[0].message.content;

    // Store insights in database
    const { data: storedInsight, error } = await dbAdmin.supabase
      .from('ai_insights')
      .insert({
        data_source_id: dataSourceId,
        content: { insights },
        type: 'structural_analysis',
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;

    return storedInsight;
  }

  static async generateDataSummary(data: any[], columns: string[]) {
    const prompt = `Analyze this dataset and provide a summary:
      Columns: ${columns.join(', ')}
      Sample Data: ${JSON.stringify(data.slice(0, 5))}
      
      Provide:
      1. Key trends
      2. Notable patterns
      3. Potential anomalies
      4. Recommendations for further analysis`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a data analyst AI that provides clear, actionable insights from data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0].message.content;
  }

  static async suggestVisualizations(columns: string[], dataTypes: Record<string, string>) {
    const prompt = `Suggest appropriate visualizations for this dataset:
      Columns and their types: ${JSON.stringify(dataTypes)}
      
      Provide:
      1. Recommended chart types
      2. Which columns to use for each chart
      3. Why each visualization would be useful`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a data visualization expert AI that suggests the most effective ways to visualize data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0].message.content;
  }
}

import OpenAI from 'openai';
import { dbAdmin } from './supabase.js';
import { AppError } from '../middleware/errorHandler.js';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export class ChatInterfaceService {
  static async generateSQLQuery(question: string, dataStructure: any) {
    const prompt = `Given this data structure:
      Tables and Columns: ${JSON.stringify(dataStructure)}
      
      Generate a SQL query to answer this question: "${question}"
      
      The query should be:
      1. Efficient and optimized
      2. Include proper joins if needed
      3. Handle edge cases
      4. Include appropriate aggregations if needed`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert SQL query generator. Generate only the SQL query without any explanation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 300
    });

    return response.choices[0].message.content;
  }

  static async explainQuery(query: string) {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert at explaining SQL queries in simple terms."
        },
        {
          role: "user",
          content: `Explain this SQL query in simple terms: ${query}`
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    return response.choices[0].message.content;
  }

  static async suggestFollowUpQuestions(context: {
    previousQuestions: string[];
    dataStructure: any;
    currentResults: any;
  }) {
    const prompt = `Based on:
      Previous questions: ${JSON.stringify(context.previousQuestions)}
      Data structure: ${JSON.stringify(context.dataStructure)}
      Current results: ${JSON.stringify(context.currentResults)}
      
      Suggest 3 relevant follow-up questions that would provide additional insights.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an AI that suggests relevant follow-up questions for data analysis."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    return response.choices[0].message.content?.split('\n').filter(q => q.trim());
  }

  static async generateNaturalLanguageResponse(data: any, question: string) {
    const prompt = `Given this data result: ${JSON.stringify(data)}
      And the original question: "${question}"
      
      Provide a clear, natural language response that:
      1. Directly answers the question
      2. Highlights key insights
      3. Uses appropriate numerical formatting
      4. Maintains a professional tone`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an AI that explains data analysis results in clear, natural language."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    return response.choices[0].message.content;
  }
}

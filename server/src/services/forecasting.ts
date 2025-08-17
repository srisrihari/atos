import OpenAI from 'openai';
import { dbAdmin } from './supabase.js';
import { AppError } from '../middleware/errorHandler.js';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export class ForecastingService {
  static async generateForecast(params: {
    data: any[];
    targetColumn: string;
    timeColumn: string;
    horizon: number;
    features?: string[];
  }) {
    const { data, targetColumn, timeColumn, horizon, features } = params;

    // Prepare data for analysis
    const timeSeriesData = data.map(row => ({
      time: row[timeColumn],
      value: row[targetColumn],
      ...(features && features.reduce((acc, feature) => ({
        ...acc,
        [feature]: row[feature]
      }), {}))
    }));

    // Generate forecast analysis using GPT-4
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert time series forecasting AI. Analyze the data and provide detailed forecasting insights."
        },
        {
          role: "user",
          content: `Analyze this time series data and provide forecasting insights:
            Time Series Data: ${JSON.stringify(timeSeriesData)}
            Target Column: ${targetColumn}
            Forecast Horizon: ${horizon} periods
            Additional Features: ${features?.join(', ') || 'none'}
            
            Provide:
            1. Trend analysis
            2. Seasonality patterns
            3. Key factors influencing the target variable
            4. Confidence intervals for the forecast
            5. Potential risks and limitations`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return {
      analysis: response.choices[0].message.content,
      forecast: this.calculateForecast(timeSeriesData, horizon)
    };
  }

  private static calculateForecast(timeSeriesData: any[], horizon: number) {
    // Simple exponential smoothing implementation
    const alpha = 0.3; // smoothing factor
    const values = timeSeriesData.map(d => d.value);
    
    let lastValue = values[values.length - 1];
    let lastSmoothed = values[values.length - 1];
    
    const forecast = [];
    const confidenceIntervals = [];
    
    // Calculate standard deviation for confidence intervals
    const std = this.calculateStandardDeviation(values);
    
    for (let i = 0; i < horizon; i++) {
      // Generate forecast
      lastSmoothed = alpha * lastValue + (1 - alpha) * lastSmoothed;
      forecast.push(lastSmoothed);
      
      // Calculate confidence intervals (95%)
      const interval = 1.96 * std * Math.sqrt(i + 1);
      confidenceIntervals.push({
        upper: lastSmoothed + interval,
        lower: lastSmoothed - interval
      });
      
      lastValue = lastSmoothed;
    }
    
    return {
      values: forecast,
      confidenceIntervals
    };
  }

  private static calculateStandardDeviation(values: number[]) {
    const mean = values.reduce((a, b) => a + b) / values.length;
    const squareDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
  }

  static async detectAnomalies(data: any[], targetColumn: string, timeColumn: string) {
    const values = data.map(row => ({
      time: row[timeColumn],
      value: row[targetColumn]
    }));

    // Calculate basic statistics
    const mean = values.reduce((sum, v) => sum + v.value, 0) / values.length;
    const std = this.calculateStandardDeviation(values.map(v => v.value));

    // Detect anomalies (points outside 3 standard deviations)
    const anomalies = values.filter(v => 
      Math.abs(v.value - mean) > 3 * std
    );

    // Get AI analysis of anomalies
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing time series anomalies. Provide insights about detected anomalies."
        },
        {
          role: "user",
          content: `Analyze these anomalies in the time series:
            Time Series: ${JSON.stringify(values)}
            Detected Anomalies: ${JSON.stringify(anomalies)}
            
            Provide:
            1. Analysis of each anomaly
            2. Potential causes
            3. Recommendations for handling these anomalies
            4. Impact on forecasting`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return {
      anomalies,
      analysis: response.choices[0].message.content
    };
  }

  static async analyzeSeasonality(data: any[], targetColumn: string, timeColumn: string) {
    const values = data.map(row => ({
      time: new Date(row[timeColumn]),
      value: row[targetColumn]
    }));

    // Group by different time periods
    const byMonth = this.groupByTimePeriod(values, 'month');
    const byWeekday = this.groupByTimePeriod(values, 'weekday');
    const byQuarter = this.groupByTimePeriod(values, 'quarter');

    // Get AI analysis of seasonality patterns
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing seasonality patterns in time series data."
        },
        {
          role: "user",
          content: `Analyze these seasonality patterns:
            Monthly Patterns: ${JSON.stringify(byMonth)}
            Weekly Patterns: ${JSON.stringify(byWeekday)}
            Quarterly Patterns: ${JSON.stringify(byQuarter)}
            
            Provide:
            1. Key seasonal patterns
            2. Strength of seasonality
            3. Recommendations for handling seasonality
            4. Impact on forecasting`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return {
      patterns: {
        monthly: byMonth,
        weekly: byWeekday,
        quarterly: byQuarter
      },
      analysis: response.choices[0].message.content
    };
  }

  private static groupByTimePeriod(values: any[], period: 'month' | 'weekday' | 'quarter') {
    const groups: Record<string, number[]> = {};
    
    values.forEach(({ time, value }) => {
      let key;
      switch (period) {
        case 'month':
          key = time.getMonth();
          break;
        case 'weekday':
          key = time.getDay();
          break;
        case 'quarter':
          key = Math.floor(time.getMonth() / 3);
          break;
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(value);
    });

    // Calculate averages for each group
    return Object.entries(groups).reduce((acc, [key, values]) => ({
      ...acc,
      [key]: values.reduce((sum, v) => sum + v, 0) / values.length
    }), {});
  }
}

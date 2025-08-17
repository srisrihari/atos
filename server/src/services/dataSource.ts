import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import xlsx from 'xlsx';
import { google } from 'googleapis';
import { AppError } from '../middleware/errorHandler.js';

interface ParsedData {
  headers: string[];
  rows: Record<string, any>[];
}

export class DataSourceService {
  // CSV Parser
  static async parseCSV(filePath: string): Promise<ParsedData> {
    return new Promise((resolve, reject) => {
      const rows: any[] = [];
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        trim: true
      });

      createReadStream(filePath)
        .pipe(parser)
        .on('data', (row) => rows.push(row))
        .on('end', () => {
          if (rows.length === 0) {
            reject(new AppError('CSV file is empty', 400));
            return;
          }

          const headers = Object.keys(rows[0]);
          resolve({ headers, rows });
        })
        .on('error', (error) => {
          reject(new AppError(`Failed to parse CSV: ${error.message}`, 400));
        });
    });
  }

  // Excel Parser
  static async parseExcel(filePath: string): Promise<ParsedData> {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const rows = xlsx.utils.sheet_to_json(worksheet);
      
      if (rows.length === 0) {
        throw new AppError('Excel file is empty', 400);
      }

      const headers = Object.keys(rows[0]);
      
      return { headers, rows };
    } catch (error: any) {
      throw new AppError(`Failed to parse Excel file: ${error.message}`, 400);
    }
  }

  // Google Sheets Parser
  static async parseGoogleSheet(spreadsheetId: string, credentials: any): Promise<ParsedData> {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
      });

      const sheets = google.sheets({ version: 'v4', auth });
      
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'A1:ZZ'  // Adjust range as needed
      });

      const values = response.data.values;
      
      if (!values || values.length < 2) {
        throw new AppError('Google Sheet is empty or has insufficient data', 400);
      }

      const headers = values[0];
      const rows = values.slice(1).map(row => {
        const rowData: Record<string, any> = {};
        headers.forEach((header: string, index: number) => {
          rowData[header] = row[index];
        });
        return rowData;
      });

      return { headers: headers as string[], rows };
    } catch (error: any) {
      throw new AppError(`Failed to parse Google Sheet: ${error.message}`, 400);
    }
  }

  // Data type inference
  static inferDataTypes(data: ParsedData): Record<string, string> {
    const types: Record<string, string> = {};
    
    data.headers.forEach(header => {
      const values = data.rows.map(row => row[header]);
      types[header] = this.inferColumnType(values);
    });

    return types;
  }

  private static inferColumnType(values: any[]): string {
    const nonNullValues = values.filter(v => v != null && v !== '');
    
    if (nonNullValues.length === 0) return 'string';

    const allNumbers = nonNullValues.every(v => !isNaN(Number(v)));
    if (allNumbers) return 'number';

    const allDates = nonNullValues.every(v => !isNaN(Date.parse(v)));
    if (allDates) return 'date';

    const allBooleans = nonNullValues.every(v => 
      typeof v === 'boolean' || ['true', 'false'].includes(v.toLowerCase())
    );
    if (allBooleans) return 'boolean';

    return 'string';
  }

  // Data validation
  static validateData(data: ParsedData): void {
    if (!data.headers || data.headers.length === 0) {
      throw new AppError('Data must have at least one column', 400);
    }

    if (!data.rows || data.rows.length === 0) {
      throw new AppError('Data must have at least one row', 400);
    }

    // Check for duplicate headers
    const uniqueHeaders = new Set(data.headers);
    if (uniqueHeaders.size !== data.headers.length) {
      throw new AppError('Duplicate column names are not allowed', 400);
    }

    // Validate each row has all headers
    data.rows.forEach((row, index) => {
      data.headers.forEach(header => {
        if (!Object.prototype.hasOwnProperty.call(row, header)) {
          throw new AppError(`Row ${index + 1} is missing value for column "${header}"`, 400);
        }
      });
    });
  }
}

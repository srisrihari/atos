import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ColumnStats {
  type: 'numeric' | 'categorical' | 'date';
  missingValues: number;
  uniqueValues?: number;
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  mode?: string | number;
}

interface DataSourcePreviewProps {
  dataSourceId: string;
  onClose: () => void;
}

export function DataSourcePreview({ dataSourceId, onClose }: DataSourcePreviewProps) {
  const [activeTab, setActiveTab] = useState<'table' | 'summary'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [columns, setColumns] = useState<{ name: string; type: string }[]>([]);
  const [summary, setSummary] = useState<Record<string, ColumnStats>>({});
  
  const itemsPerPage = 10;

  useEffect(() => {
    // In a real app, this would be an API call to fetch data source details
    // For now, we'll simulate loading with sample data
    setLoading(true);
    
    setTimeout(() => {
      // Generate sample data
      const sampleData = [];
      const sampleColumns = [
        { name: 'Date', type: 'date' },
        { name: 'Region', type: 'categorical' },
        { name: 'Product', type: 'categorical' },
        { name: 'Sales', type: 'numeric' },
        { name: 'Units', type: 'numeric' }
      ];
      
      // Generate 50 rows of sample data
      for (let i = 0; i < 50; i++) {
        const row: Record<string, any> = {
          Date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
          Region: ['North', 'South', 'East', 'West'][Math.floor(Math.random() * 4)],
          Product: ['Product A', 'Product B', 'Product C'][Math.floor(Math.random() * 3)],
          Sales: Math.floor(Math.random() * 10000) + 1000,
          Units: Math.floor(Math.random() * 100) + 10
        };
        sampleData.push(row);
      }
      
      // Generate sample summary
      const sampleSummary: Record<string, ColumnStats> = {
        Date: {
          type: 'date',
          missingValues: 0,
          uniqueValues: 50
        },
        Region: {
          type: 'categorical',
          missingValues: 0,
          uniqueValues: 4,
          mode: 'North'
        },
        Product: {
          type: 'categorical',
          missingValues: 0,
          uniqueValues: 3,
          mode: 'Product A'
        },
        Sales: {
          type: 'numeric',
          missingValues: 0,
          min: 1000,
          max: 11000,
          mean: 5500,
          median: 5500
        },
        Units: {
          type: 'numeric',
          missingValues: 0,
          min: 10,
          max: 110,
          mean: 55,
          median: 55
        }
      };
      
      setData(sampleData);
      setColumns(sampleColumns);
      setSummary(sampleSummary);
      setLoading(false);
    }, 1000);
  }, [dataSourceId]);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderPagination = () => (
    <div className="flex justify-between items-center mt-4">
      <button
        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <span className="text-sm text-gray-700 dark:text-gray-300">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Data Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mb-2"></div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Loading data preview...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Data Preview</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('table')}
          className={`py-2 px-4 text-sm font-medium ${activeTab === 'table' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
        >
          Table View
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`py-2 px-4 text-sm font-medium ${activeTab === 'summary' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
        >
          Data Summary
        </button>
      </div>

      <div className="p-4">
        {activeTab === 'table' && (
          <div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {columns.map((col, index) => (
                      <th
                        key={index}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        {col.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {columns.map((col, colIndex) => (
                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                          {String(row[col.name])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPagination()}
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(summary).map(([columnName, stats]) => (
              <div key={columnName} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-2">{columnName}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Type: {stats.type}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Missing Values: {stats.missingValues}</p>
                {stats.type === 'categorical' && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">Unique Values: {stats.uniqueValues}</p>
                )}
                {stats.type === 'numeric' && (
                  <>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Min: {stats.min?.toFixed(2)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Max: {stats.max?.toFixed(2)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Mean: {stats.mean?.toFixed(2)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Median: {stats.median?.toFixed(2)}</p>
                  </>
                )}
                {stats.mode && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">Mode: {stats.mode}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
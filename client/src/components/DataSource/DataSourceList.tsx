import { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  TrashIcon, 
  ChartBarIcon,
  ChatBubbleLeftIcon,
  ArrowPathIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

interface DataSource {
  id: string;
  name: string;
  created_at: string;
  size: number;
  rows: number;
  columns: number;
  file_type: 'csv' | 'excel' | 'api';
  status: 'processing' | 'ready' | 'error';
}

interface DataSourceListProps {
  onPreview?: (id: string) => void;
}

// Sample data for demonstration
const SAMPLE_DATA: DataSource[] = [
  {
    id: '1',
    name: 'sales_data_2023.csv',
    created_at: '2023-07-15T10:30:00Z',
    size: 2.4 * 1024 * 1024, // 2.4 MB
    rows: 5432,
    columns: 12,
    file_type: 'csv',
    status: 'ready'
  },
  {
    id: '2',
    name: 'customer_feedback.xlsx',
    created_at: '2023-07-10T14:20:00Z',
    size: 1.8 * 1024 * 1024, // 1.8 MB
    rows: 3210,
    columns: 8,
    file_type: 'excel',
    status: 'ready'
  },
  {
    id: '3',
    name: 'marketing_campaign.csv',
    created_at: '2023-07-05T09:15:00Z',
    size: 3.2 * 1024 * 1024, // 3.2 MB
    rows: 7890,
    columns: 15,
    file_type: 'csv',
    status: 'processing'
  }
];

export function DataSourceList({ onPreview }: DataSourceListProps) {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ready' | 'processing' | 'error'>('all');

  useEffect(() => {
    fetchDataSources();
  }, [userId, sortBy, filterStatus]);

  const fetchDataSources = async () => {
    setLoading(true);
    
    try {
      // In a real app, this would be an API call
      // const response = await axios.get('/api/data-sources');
      // setDataSources(response.data);
      
      // Using sample data for demonstration
      setTimeout(() => {
        let filteredData = [...SAMPLE_DATA];
        
        // Apply status filter
        if (filterStatus !== 'all') {
          filteredData = filteredData.filter(ds => ds.status === filterStatus);
        }
        
        // Apply sorting
        filteredData.sort((a, b) => {
          if (sortBy === 'date') {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          } else if (sortBy === 'name') {
            return a.name.localeCompare(b.name);
          } else if (sortBy === 'size') {
            return b.size - a.size;
          }
          return 0;
        });
        
        setDataSources(filteredData);
        setLoading(false);
      }, 800);
    } catch (err) {
      setError('Failed to load data sources');
      console.error('Fetch error:', err);
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // In a real app, this would be an API call
      // await axios.delete(`/api/data-sources/${id}`);
      
      // For demonstration, just remove from state
      setDataSources(dataSources.filter(ds => ds.id !== id));
    } catch (err) {
      setError('Failed to delete data source');
      console.error('Delete error:', err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFileIcon = (fileType: string) => {
    return <DocumentTextIcon className="h-10 w-10 text-primary-500" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mb-2"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading data sources...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4 text-red-700 dark:text-red-300">
        {error}
      </div>
    );
  }

  if (dataSources.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-8 text-center">
        <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No data sources found</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Upload your first file to get started</p>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
          Upload Data
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1.5 text-sm"
          >
            <option value="all">All Status</option>
            <option value="ready">Ready</option>
            <option value="processing">Processing</option>
            <option value="error">Error</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1.5 text-sm"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
          </select>
        </div>
        <button 
          onClick={() => fetchDataSources()}
          className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        >
          <ArrowPathIcon className="h-4 w-4 mr-1" />
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {dataSources.map((dataSource) => (
          <div
            key={dataSource.id}
            className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                {getFileIcon(dataSource.file_type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                    {dataSource.name}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      dataSource.status === 'ready'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : dataSource.status === 'processing'
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}
                  >
                    {dataSource.status}
                  </span>
                </div>
                
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                  <span>Uploaded {formatDate(dataSource.created_at)}</span>
                  <span>{formatFileSize(dataSource.size)}</span>
                  <span>{dataSource.rows.toLocaleString()} rows</span>
                  <span>{dataSource.columns} columns</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {onPreview && (
                    <button 
                      onClick={() => onPreview(dataSource.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Preview
                    </button>
                  )}
                  <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
                    <ChartBarIcon className="h-4 w-4 mr-1" />
                    Analyze
                  </button>
                  <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
                    <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                    Ask AI
                  </button>
                  <button 
                    onClick={() => handleDelete(dataSource.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <TrashIcon className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
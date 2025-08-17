import { useState } from 'react';
import { DataSourceUploader } from '../components/DataSource/DataSourceUploader';
import { DataSourceList } from '../components/DataSource/DataSourceList';
import { 
  CloudArrowUpIcon, 
  TableCellsIcon, 
  ChartBarIcon, 
  CodeBracketIcon 
} from '@heroicons/react/24/outline';

export function DataSourcePage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'sources'>('upload');

  const tabs = [
    { id: 'upload', name: 'Upload Data', icon: CloudArrowUpIcon },
    { id: 'sources', name: 'My Data Sources', icon: TableCellsIcon },
  ];

  const supportedFormats = [
    { 
      name: 'CSV Files', 
      icon: TableCellsIcon, 
      description: 'Upload comma-separated values files (.csv)' 
    },
    { 
      name: 'Excel Files', 
      icon: TableCellsIcon, 
      description: 'Upload Excel spreadsheets (.xlsx, .xls)' 
    },
    { 
      name: 'Connect API', 
      icon: CodeBracketIcon, 
      description: 'Connect to external APIs or databases' 
    },
    { 
      name: 'Sample Data', 
      icon: ChartBarIcon, 
      description: 'Use our sample datasets to explore features' 
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Data Sources</h1>
        <p className="mt-2 text-gray-600">
          Upload your data files for AI-powered analysis and insights
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'upload' | 'sources')}
              className={`
                flex items-center py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'upload' ? (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Upload New Data
            </h2>
            <DataSourceUploader />
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Supported Data Formats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {supportedFormats.map((format) => (
                <div key={format.name} className="flex items-start p-4 border border-gray-200 rounded-lg">
                  <format.icon className="h-6 w-6 text-primary-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900">{format.name}</h3>
                    <p className="text-sm text-gray-500">{format.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              What Happens After Upload?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary-100 rounded-full p-3 mb-4">
                  <CloudArrowUpIcon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="font-medium text-gray-900">1. Upload</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Upload your data file or connect to your data source
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary-100 rounded-full p-3 mb-4">
                  <TableCellsIcon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="font-medium text-gray-900">2. AI Processing</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Our AI analyzes your data and identifies patterns
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary-100 rounded-full p-3 mb-4">
                  <ChartBarIcon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="font-medium text-gray-900">3. Insights</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Get automatic visualizations and actionable insights
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Your Data Sources
          </h2>
          <DataSourceList />
        </div>
      )}
    </div>
  );
}
import { useState } from 'react';
import { 
  CloudArrowUpIcon, 
  TableCellsIcon, 
  ChartBarIcon, 
  CodeBracketIcon,
  ArrowPathIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { DataSourceUploader } from '../components/DataSource/DataSourceUploader';
import { DataSourceList } from '../components/DataSource/DataSourceList';

export function DataUploadPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'sources'>('upload');

  const tabs = [
    { id: 'upload', name: 'Upload & Analyze', icon: CloudArrowUpIcon },
    { id: 'sources', name: 'My Data Sources', icon: TableCellsIcon },
  ];

  const aiFeatures = [
    { 
      name: 'Smart Data Analysis', 
      icon: ChartBarIcon, 
      description: 'Our AI automatically identifies patterns, trends, and anomalies in your data.',
      color: 'bg-blue-500'
    },
    { 
      name: 'Natural Language Insights', 
      icon: LightBulbIcon, 
      description: 'Get plain-English explanations of what your data means for your business.',
      color: 'bg-purple-500'
    },
    { 
      name: 'Ask Questions About Your Data', 
      icon: ChatBubbleLeftRightIcon, 
      description: 'Chat with our AI to get answers about your data without writing complex queries.',
      color: 'bg-green-500'
    },
    { 
      name: 'Predictive Forecasting', 
      icon: ArrowPathIcon, 
      description: 'Let our AI predict future trends based on your historical data.',
      color: 'bg-amber-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Data Analysis</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Upload your data for AI-powered analysis and insights
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'upload' | 'sources')}
              className={`
                flex items-center py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}
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
          <DataSourceUploader />
          
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
              How InsightIQ AI Works With Your Data
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aiFeatures.map((feature) => (
                <div key={feature.name} className="flex">
                  <div className={`flex-shrink-0 h-12 w-12 rounded-md flex items-center justify-center ${feature.color}`}>
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {feature.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                Supported Data Formats
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-start p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <TableCellsIcon className="h-5 w-5 text-primary-500 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">CSV Files</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Comma-separated values (.csv)
                    </p>
                  </div>
                </div>
                <div className="flex items-start p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <TableCellsIcon className="h-5 w-5 text-primary-500 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Excel Files</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Microsoft Excel (.xlsx, .xls)
                    </p>
                  </div>
                </div>
                <div className="flex items-start p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <CodeBracketIcon className="h-5 w-5 text-primary-500 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">API Connections</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Coming soon
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Data Privacy & Security
            </h2>
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <p>
                Your data security is our top priority. Here's how we protect your information:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>All data is encrypted in transit and at rest</li>
                <li>Your data is processed in isolated environments</li>
                <li>We don't share your data with third parties</li>
                <li>You can delete your data at any time</li>
                <li>We comply with GDPR, CCPA, and other privacy regulations</li>
              </ul>
              <p>
                <a href="#" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                  Learn more about our data security practices →
                </a>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Your Data Sources
          </h2>
          <DataSourceList onPreview={() => {}} />
        </div>
      )}
    </div>
  );
}
import { useState } from 'react';
import { 
  DocumentTextIcon,
  PlusIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  ChartBarIcon,
  TableCellsIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface Report {
  id: string;
  name: string;
  description: string;
  created: string;
  updated: string;
  status: 'draft' | 'published';
  type: 'sales' | 'marketing' | 'customer' | 'custom';
}

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'my-reports' | 'templates'>('my-reports');
  
  // Sample reports data
  const reports: Report[] = [
    {
      id: '1',
      name: 'Q2 2023 Sales Report',
      description: 'Quarterly sales performance across all regions',
      created: '2023-07-15T10:30:00Z',
      updated: '2023-07-18T14:45:00Z',
      status: 'published',
      type: 'sales'
    },
    {
      id: '2',
      name: 'Customer Retention Analysis',
      description: 'Analysis of customer retention rates and churn factors',
      created: '2023-07-10T09:15:00Z',
      updated: '2023-07-12T16:20:00Z',
      status: 'published',
      type: 'customer'
    },
    {
      id: '3',
      name: 'Marketing Campaign Effectiveness',
      description: 'Evaluation of recent marketing campaigns and ROI',
      created: '2023-07-05T11:45:00Z',
      updated: '2023-07-05T11:45:00Z',
      status: 'draft',
      type: 'marketing'
    }
  ];
  
  // Sample report templates
  const templates = [
    {
      id: '1',
      name: 'Executive Dashboard',
      description: 'High-level overview of key business metrics',
      icon: ChartBarIcon
    },
    {
      id: '2',
      name: 'Sales Performance',
      description: 'Detailed analysis of sales data and trends',
      icon: ChartBarIcon
    },
    {
      id: '3',
      name: 'Customer Analysis',
      description: 'Insights into customer behavior and segments',
      icon: TableCellsIcon
    },
    {
      id: '4',
      name: 'Marketing ROI',
      description: 'Evaluation of marketing campaign effectiveness',
      icon: ChartBarIcon
    },
    {
      id: '5',
      name: 'AI-Generated Summary',
      description: 'Let AI analyze your data and create a report',
      icon: ChatBubbleLeftRightIcon
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Reports</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create, manage, and share reports
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Report
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('my-reports')}
            className={`
              flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'my-reports'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}
            `}
          >
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            My Reports
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`
              flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'templates'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}
            `}
          >
            <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
            Templates
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'my-reports' ? (
        <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Report Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {report.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {report.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(report.updated)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        report.status === 'published'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                          <ArrowDownTrayIcon className="h-5 w-5" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                          <ShareIcon className="h-5 w-5" />
                        </button>
                        <button className="text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div 
              key={template.id}
              className="bg-white dark:bg-gray-900 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <template.icon className="h-8 w-8 text-primary-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {template.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {template.description}
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                    Use Template
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

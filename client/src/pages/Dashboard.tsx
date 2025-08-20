import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpTrayIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';

// Sample data for demonstration
const recentFiles = [
  { id: '1', name: 'Q2_Sales_Report.csv', date: '2023-07-15T10:30:00Z', size: '2.4 MB' },
  { id: '2', name: 'Customer_Feedback.xlsx', date: '2023-07-10T14:20:00Z', size: '1.8 MB' },
  { id: '3', name: 'Marketing_Campaign.csv', date: '2023-07-05T09:15:00Z', size: '3.2 MB' }
];

const savedReports = [
  { id: '1', name: 'Monthly Sales Summary', date: '2023-07-20T16:45:00Z' },
  { id: '2', name: 'Customer Retention Analysis', date: '2023-07-18T11:30:00Z' },
  { id: '3', name: 'Product Performance Q2', date: '2023-07-12T09:15:00Z' }
];

const quickInsights = [
  { 
    id: '1', 
    title: 'Sales Anomaly Detected', 
    description: 'Sales dropped by 23% in the Western region during June.',
    type: 'warning',
    icon: ExclamationTriangleIcon
  },
  { 
    id: '2', 
    title: 'Customer Satisfaction Trend', 
    description: 'Customer satisfaction scores increased by 12% this quarter.',
    type: 'success',
    icon: ArrowTrendingUpIcon
  },
  { 
    id: '3', 
    title: 'Inventory Forecast', 
    description: 'Product A will need restocking in approximately 2 weeks.',
    type: 'info',
    icon: PresentationChartLineIcon
  }
];

const kpis = [
  { id: '1', name: 'Revenue', value: '$1.2M', change: '+8%', status: 'positive' },
  { id: '2', name: 'Customers', value: '12,543', change: '+5%', status: 'positive' },
  { id: '3', name: 'Churn Rate', value: '3.2%', change: '-0.5%', status: 'positive' },
  { id: '4', name: 'Avg. Order', value: '$95.40', change: '-2%', status: 'negative' }
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'reports'>('overview');

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'files', name: 'Recent Files' },
    { id: 'reports', name: 'Saved Reports' }
  ];

  const quickActions = [
    { name: 'Upload Data', href: '/upload', icon: ArrowUpTrayIcon, color: 'bg-blue-500' },
    { name: 'Ask AI', href: '/ask-ai', icon: ChatBubbleLeftRightIcon, color: 'bg-purple-500' },
    { name: 'Create Report', href: '/reports', icon: DocumentTextIcon, color: 'bg-green-500' },
    { name: 'Forecast', href: '/forecast', icon: ChartBarIcon, color: 'bg-amber-500' }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
  <div className="space-y-6 px-2 sm:px-4 md:px-8">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Welcome to InsightIQ</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your AI-powered business intelligence platform
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/upload"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowUpTrayIcon className="mr-2 h-4 w-4" />
            Upload New Data
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
  <div className="grid grid-cols-1 gap-5 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div 
            key={kpi.id}
            className="bg-white dark:bg-gray-900 overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`h-10 w-10 rounded-md flex items-center justify-center ${
                    kpi.status === 'positive' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                  }`}>
                    <ArrowTrendingUpIcon className={`h-6 w-6 ${
                      kpi.status === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {kpi.name}
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900 dark:text-white">
                        {kpi.value}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className={`bg-gray-50 dark:bg-gray-800 px-5 py-3 ${
              kpi.status === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              <div className="text-sm">
                {kpi.change} from last period
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
  <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-4 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h2>
  <div className="grid grid-cols-2 gap-4 xs:grid-cols-3 sm:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className="relative rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 dark:hover:border-gray-600 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
            >
              <div className={`flex-shrink-0 h-10 w-10 rounded-md flex items-center justify-center ${action.color}`}>
                <action.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {action.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Tabbed Content */}
  <div className="bg-white dark:bg-gray-900 shadow rounded-lg mt-4">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'files' | 'reports')}
                className={`
                  w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}
                `}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
  <div className="p-2 sm:p-4 md:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Quick Insights</h3>
              <div className="space-y-4">
                {quickInsights.map((insight) => (
                  <div 
                    key={insight.id}
                    className={`rounded-md p-4 ${
                      insight.type === 'warning'
                        ? 'bg-yellow-50 dark:bg-yellow-900/30'
                        : insight.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900/30'
                        : 'bg-blue-50 dark:bg-blue-900/30'
                    }`}
                  >
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <insight.icon 
                          className={`h-5 w-5 ${
                            insight.type === 'warning'
                              ? 'text-yellow-400'
                              : insight.type === 'success'
                              ? 'text-green-400'
                              : 'text-blue-400'
                          }`} 
                        />
                      </div>
                      <div className="ml-3">
                        <h3 className={`text-sm font-medium ${
                          insight.type === 'warning'
                            ? 'text-yellow-800 dark:text-yellow-200'
                            : insight.type === 'success'
                            ? 'text-green-800 dark:text-green-200'
                            : 'text-blue-800 dark:text-blue-200'
                        }`}>
                          {insight.title}
                        </h3>
                        <div className={`mt-2 text-sm ${
                          insight.type === 'warning'
                            ? 'text-yellow-700 dark:text-yellow-300'
                            : insight.type === 'success'
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-blue-700 dark:text-blue-300'
                        }`}>
                          <p>{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Files</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Size
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {recentFiles.map((file) => (
                      <tr key={file.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {file.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(file.date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {file.size}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link to={`/insights/${file.id}`} className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Saved Reports</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {savedReports.map((report) => (
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
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(report.date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link to={`/reports/${report.id}`} className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

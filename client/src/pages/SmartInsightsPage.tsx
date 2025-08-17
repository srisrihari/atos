import { useParams } from 'react-router-dom';
import { 
  ChartBarIcon,
  TableCellsIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export function SmartInsightsPage() {
  const { dataSourceId } = useParams<{ dataSourceId: string }>();
  
  // In a real app, you would fetch the data source and insights from an API
  const dataSource = {
    id: dataSourceId,
    name: 'sales_data_2023.csv',
    rows: 5432,
    columns: 12
  };
  
  const insights = [
    {
      id: '1',
      title: 'Sales Trend Analysis',
      description: 'Sales have increased by 15% over the last quarter, primarily driven by the Eastern region.',
      type: 'trend',
      icon: ArrowTrendingUpIcon
    },
    {
      id: '2',
      title: 'Anomaly Detected',
      description: 'Unusual spike in returns for Product X in June - 43% higher than the average.',
      type: 'anomaly',
      icon: ExclamationTriangleIcon
    },
    {
      id: '3',
      title: 'Key Correlations',
      description: 'Strong correlation (0.87) found between marketing spend and sales with a 2-week lag.',
      type: 'correlation',
      icon: LightBulbIcon
    }
  ];
  
  const charts = [
    {
      id: '1',
      title: 'Monthly Sales by Region',
      type: 'bar',
      description: 'Comparison of sales performance across regions'
    },
    {
      id: '2',
      title: 'Product Category Distribution',
      type: 'pie',
      description: 'Breakdown of sales by product category'
    },
    {
      id: '3',
      title: 'Customer Satisfaction Trend',
      type: 'line',
      description: 'Tracking satisfaction scores over time'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Smart Insights</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          AI-generated insights for {dataSource.name}
        </p>
      </div>

      {/* Data Source Summary */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Data Source Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center">
              <TableCellsIcon className="h-8 w-8 text-primary-500 mr-3" />
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Rows</div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white">{dataSource.rows.toLocaleString()}</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center">
              <TableCellsIcon className="h-8 w-8 text-primary-500 mr-3" />
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Columns</div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white">{dataSource.columns}</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-primary-500 mr-3" />
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Charts Generated</div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white">{charts.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Key Insights</h2>
        <div className="space-y-4">
          {insights.map((insight) => (
            <div 
              key={insight.id}
              className={`rounded-md p-4 ${
                insight.type === 'anomaly'
                  ? 'bg-yellow-50 dark:bg-yellow-900/30'
                  : insight.type === 'trend'
                  ? 'bg-green-50 dark:bg-green-900/30'
                  : 'bg-blue-50 dark:bg-blue-900/30'
              }`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <insight.icon 
                    className={`h-5 w-5 ${
                      insight.type === 'anomaly'
                        ? 'text-yellow-400'
                        : insight.type === 'trend'
                        ? 'text-green-400'
                        : 'text-blue-400'
                    }`} 
                  />
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${
                    insight.type === 'anomaly'
                      ? 'text-yellow-800 dark:text-yellow-200'
                      : insight.type === 'trend'
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-blue-800 dark:text-blue-200'
                  }`}>
                    {insight.title}
                  </h3>
                  <div className={`mt-2 text-sm ${
                    insight.type === 'anomaly'
                      ? 'text-yellow-700 dark:text-yellow-300'
                      : insight.type === 'trend'
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

      {/* Charts */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Visualizations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {charts.map((chart) => (
            <div key={chart.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-100 dark:bg-gray-800 h-40 flex items-center justify-center">
                <ChartBarIcon className="h-12 w-12 text-gray-400" />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">{chart.title}</h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{chart.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
          <ChartBarIcon className="h-4 w-4 mr-2" />
          Export Report
        </button>
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
          <LightBulbIcon className="h-4 w-4 mr-2" />
          Ask AI
        </button>
      </div>
    </div>
  );
}

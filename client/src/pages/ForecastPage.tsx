import { useState } from 'react';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export function ForecastPage() {
  const [forecastPeriod, setForecastPeriod] = useState('3months');
  const [selectedDataSource, setSelectedDataSource] = useState('1');
  const [confidenceInterval, setConfidenceInterval] = useState(80);
  const [marketingBudget, setMarketingBudget] = useState(50);
  const [priceChange, setPriceChange] = useState(0);
  
  // Sample data sources
  const dataSources = [
    { id: '1', name: 'Sales Data 2023' },
    { id: '2', name: 'Customer Feedback' },
    { id: '3', name: 'Marketing Campaign' }
  ];
  
  // Sample forecast scenarios
  const scenarios = [
    { id: '1', name: 'Baseline Forecast', description: 'Projection based on current trends' },
    { id: '2', name: 'Optimistic Scenario', description: 'Assuming positive market conditions' },
    { id: '3', name: 'Conservative Scenario', description: 'Assuming challenging market conditions' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Forecast & Simulation</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Predict future trends and simulate different scenarios
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Configuration */}
        <div className="lg:col-span-1 space-y-6">
          {/* Data Source Selection */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Data Source</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="data-source" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select data source
                </label>
                <select
                  id="data-source"
                  value={selectedDataSource}
                  onChange={(e) => setSelectedDataSource(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-800 dark:text-white"
                >
                  {dataSources.map((source) => (
                    <option key={source.id} value={source.id}>{source.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="forecast-period" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Forecast period
                </label>
                <select
                  id="forecast-period"
                  value={forecastPeriod}
                  onChange={(e) => setForecastPeriod(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-800 dark:text-white"
                >
                  <option value="1month">1 Month</option>
                  <option value="3months">3 Months</option>
                  <option value="6months">6 Months</option>
                  <option value="1year">1 Year</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="confidence" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confidence interval: {confidenceInterval}%
                </label>
                <input
                  id="confidence"
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={confidenceInterval}
                  onChange={(e) => setConfidenceInterval(parseInt(e.target.value))}
                  className="mt-1 block w-full"
                />
              </div>
            </div>
          </div>
          
          {/* Simulation Parameters */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Simulation Parameters</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="marketing" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Marketing Budget: {marketingBudget}% of current
                </label>
                <input
                  id="marketing"
                  type="range"
                  min="0"
                  max="200"
                  step="5"
                  value={marketingBudget}
                  onChange={(e) => setMarketingBudget(parseInt(e.target.value))}
                  className="mt-1 block w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                  <span>200%</span>
                </div>
              </div>
              
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Price Change: {priceChange > 0 ? '+' : ''}{priceChange}%
                </label>
                <input
                  id="price"
                  type="range"
                  min="-30"
                  max="30"
                  step="5"
                  value={priceChange}
                  onChange={(e) => setPriceChange(parseInt(e.target.value))}
                  className="mt-1 block w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>-30%</span>
                  <span>0%</span>
                  <span>+30%</span>
                </div>
              </div>
              
              <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
                Run Simulation
              </button>
            </div>
          </div>
        </div>
        
        {/* Right column - Forecast Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Forecast Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sales Forecast</h2>
            <div className="bg-gray-100 dark:bg-gray-800 h-64 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="h-12 w-12 text-gray-400" />
            </div>
            <div className="mt-4 flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Showing {forecastPeriod} forecast with {confidenceInterval}% confidence interval</span>
              <button className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                <DocumentTextIcon className="h-4 w-4 inline mr-1" />
                Export
              </button>
            </div>
          </div>
          
          {/* Scenarios */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Forecast Scenarios</h2>
            <div className="space-y-4">
              {scenarios.map((scenario) => (
                <div key={scenario.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <ArrowTrendingUpIcon className="h-6 w-6 text-primary-500" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">{scenario.name}</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{scenario.description}</p>
                      <div className="mt-2 flex items-center">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Projected Revenue:</div>
                        <div className="ml-2 text-sm text-green-600 dark:text-green-400">$1.2M - $1.5M</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Key Metrics */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Key Metrics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Projected Revenue</div>
                <div className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">$1.35M</div>
                <div className="mt-1 text-sm text-green-600 dark:text-green-400">+12% vs. previous period</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Projected Growth</div>
                <div className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">8.5%</div>
                <div className="mt-1 text-sm text-green-600 dark:text-green-400">+1.2% vs. previous period</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer Acquisition</div>
                <div className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">1,250</div>
                <div className="mt-1 text-sm text-green-600 dark:text-green-400">+5% vs. previous period</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Churn Rate</div>
                <div className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">3.2%</div>
                <div className="mt-1 text-sm text-red-600 dark:text-red-400">+0.3% vs. previous period</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

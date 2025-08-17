import { useState } from 'react';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';

interface KPI {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  status: 'on_track' | 'at_risk' | 'below_target';
  trend: 'up' | 'down' | 'flat';
  trendValue: number;
  alerts: boolean;
}

export function KPITrackerPage() {
  const [showAddKPI, setShowAddKPI] = useState(false);
  
  // Sample KPIs
  const kpis: KPI[] = [
    {
      id: '1',
      name: 'Monthly Revenue',
      description: 'Total monthly revenue across all products',
      target: 500000,
      current: 485000,
      unit: '$',
      status: 'on_track',
      trend: 'up',
      trendValue: 8.5,
      alerts: true
    },
    {
      id: '2',
      name: 'Customer Acquisition Cost',
      description: 'Average cost to acquire a new customer',
      target: 100,
      current: 105,
      unit: '$',
      status: 'at_risk',
      trend: 'up',
      trendValue: 3.2,
      alerts: true
    },
    {
      id: '3',
      name: 'Customer Retention Rate',
      description: 'Percentage of customers retained month-over-month',
      target: 90,
      current: 87,
      unit: '%',
      status: 'below_target',
      trend: 'down',
      trendValue: 2.1,
      alerts: true
    },
    {
      id: '4',
      name: 'Average Order Value',
      description: 'Average value of customer orders',
      target: 120,
      current: 132,
      unit: '$',
      status: 'on_track',
      trend: 'up',
      trendValue: 5.8,
      alerts: false
    }
  ];

  const formatValue = (value: number, unit: string) => {
    if (unit === '$') {
      return `$${value.toLocaleString()}`;
    } else if (unit === '%') {
      return `${value}%`;
    }
    return value.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'at_risk':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'below_target':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'on_track':
        return 'On Track';
      case 'at_risk':
        return 'At Risk';
      case 'below_target':
        return 'Below Target';
      default:
        return status;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getProgressColor = (kpi: KPI) => {
    const percentage = (kpi.current / kpi.target) * 100;
    if (percentage >= 100) {
      return 'bg-green-500';
    } else if (percentage >= 80) {
      return 'bg-green-500';
    } else if (percentage >= 60) {
      return 'bg-yellow-500';
    } else {
      return 'bg-red-500';
    }
  };

  const calculateProgress = (kpi: KPI) => {
    const percentage = (kpi.current / kpi.target) * 100;
    return Math.min(percentage, 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">KPI Tracker</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor and manage your key performance indicators
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={() => setShowAddKPI(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add KPI
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <div 
            key={kpi.id}
            className="bg-white dark:bg-gray-900 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    {kpi.name}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {kpi.description}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button className="text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatValue(kpi.current, kpi.unit)}
                  </div>
                  <div className="flex items-center">
                    {getTrendIcon(kpi.trend)}
                    <span className={`ml-1 text-sm ${kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                      {kpi.trendValue}%
                    </span>
                  </div>
                </div>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Target: {formatValue(kpi.target, kpi.unit)}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(kpi.status)}`}>
                    {getStatusText(kpi.status)}
                  </span>
                  {kpi.alerts && (
                    <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <BellAlertIcon className="h-4 w-4 mr-1" />
                      Alerts On
                    </span>
                  )}
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(kpi)}`}
                    style={{ width: `${calculateProgress(kpi)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add KPI Modal */}
      {showAddKPI && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Add New KPI
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="kpi-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          KPI Name
                        </label>
                        <input
                          type="text"
                          name="kpi-name"
                          id="kpi-name"
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                          placeholder="e.g., Monthly Revenue"
                        />
                      </div>
                      <div>
                        <label htmlFor="kpi-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Description
                        </label>
                        <textarea
                          name="kpi-description"
                          id="kpi-description"
                          rows={2}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                          placeholder="Brief description of this KPI"
                        ></textarea>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="kpi-target" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Target Value
                          </label>
                          <input
                            type="number"
                            name="kpi-target"
                            id="kpi-target"
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label htmlFor="kpi-unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Unit
                          </label>
                          <select
                            id="kpi-unit"
                            name="kpi-unit"
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                          >
                            <option value="$">$ (Dollar)</option>
                            <option value="%">% (Percentage)</option>
                            <option value="#"># (Count)</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="enable-alerts"
                          name="enable-alerts"
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                        />
                        <label htmlFor="enable-alerts" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Enable alerts for this KPI
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Save KPI
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddKPI(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import {
  CalendarIcon,
  ChartPieIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';

interface DataTrendCard {
  title: string;
  description: string;
  icon: any;
  progress: number;
  dueDate: string;
}

interface AIInsightCard {
  title: string;
  description: string;
  progress: number;
  dueDate: string;
}

export function DashboardOverview() {
  const [selectedDate, setSelectedDate] = useState('July 20 - July 31 2023');

  const dataTrends: DataTrendCard[] = [
    {
      title: 'Data Trends',
      description: 'Visualize your metrics',
      icon: ChartPieIcon,
      progress: 25,
      dueDate: 'Due today at 8 AM'
    },
    {
      title: 'Market Analysis',
      description: 'Current trends',
      icon: ArrowTrendingUpIcon,
      progress: 60,
      dueDate: 'Weekly Metrics Review'
    }
  ];

  const aiInsights: AIInsightCard[] = [
    {
      title: 'AI Insights',
      description: 'Explore data effectively',
      progress: 40,
      dueDate: 'Thursday 10/7: 3 PM Dashboard'
    },
    {
      title: 'Insight',
      description: 'Review with the analyst',
      progress: 75,
      dueDate: 'Monday 28/7: AI AM'
    }
  ];

  const metrics = [
    {
      label: 'Quarterly',
      value: '85%',
      icon: ChartPieIcon,
      description: 'Q3 Analytics'
    },
    {
      label: 'Customer',
      value: '90%',
      icon: UserGroupIcon,
      description: 'Satisfaction'
    },
    {
      label: 'Churn Rate',
      value: '12%',
      icon: ArrowTrendingUpIcon,
      description: 'Q3 2023/24'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-gray-600 dark:text-gray-300 focus:outline-none"
          >
            <option value="July 20 - July 31 2023">July 20 - July 31 2023</option>
            <option value="August 1 - August 15 2023">August 1 - August 15 2023</option>
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Data Trends Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Data Trends
          </h2>
          <div className="space-y-4">
            {dataTrends.map((card, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {card.title}
                    </h3>
                    <p className="text-sm text-gray-500">{card.description}</p>
                  </div>
                  <card.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{card.dueDate}</span>
                    <span className="text-gray-900 dark:text-white">
                      {card.progress}% complete
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                      className="h-2 bg-primary-500 rounded-full"
                      style={{ width: `${card.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            AI Insights
          </h2>
          <div className="space-y-4">
            {aiInsights.map((card, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {card.title}
                    </h3>
                    <p className="text-sm text-gray-500">{card.description}</p>
                  </div>
                  <LightBulbIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{card.dueDate}</span>
                    <span className="text-gray-900 dark:text-white">
                      {card.progress}% complete
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                      className="h-2 bg-primary-500 rounded-full"
                      style={{ width: `${card.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Metrics Overview
        </h2>
        <div className="grid grid-cols-3 gap-6">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {metric.label}
                  </h3>
                  <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {metric.description}
                  </p>
                </div>
                <metric.icon className="h-12 w-12 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Notifications
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Your analysis report is ready!
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                For detailed insights, contact our analytics team.
              </p>
            </div>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
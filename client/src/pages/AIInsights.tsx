import { useState } from 'react';
import {
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

export function AIInsights() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const recommendations = [
    {
      id: 1,
      title: 'Recommendation 1',
      description: 'Explore new market opportunities in emerging sectors to increase revenue potential.',
      image: '/recommendation1.svg'
    },
    {
      id: 2,
      title: 'Recommendation 2',
      description: 'Implement AI-driven customer service analysis to enhance user experience.',
      image: '/recommendation2.svg'
    }
  ];

  const analyticsCharts = [
    {
      id: 1,
      type: 'bar',
      title: 'Sales Performance',
      icon: ChartBarIcon
    },
    {
      id: 2,
      type: 'line',
      title: 'Revenue Trends',
      icon: ArrowTrendingUpIcon
    },
    {
      id: 3,
      type: 'pie',
      title: 'Market Share',
      icon: ChartPieIcon
    }
  ];

  const chatMessages = [
    {
      id: 1,
      text: 'How can I improve my customer retention?',
      response: 'Based on the analysis, I recommend focusing on these key areas: 1. Enhanced customer support 2. Personalized marketing campaigns 3. Loyalty program optimization'
    },
    {
      id: 2,
      text: 'What would be the key areas to focus for next year?',
      response: 'According to the trends, prioritize: 1. Digital transformation 2. Customer experience enhancement 3. Market expansion in APAC region'
    }
  ];

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {['Dashboard', 'AI Insights', 'User Management'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '-'))}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.toLowerCase().replace(' ', '-')
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* AI Recommendations */}
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              AI Recommendations
            </h2>
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={rec.image}
                    alt={rec.title}
                    className="w-16 h-16"
                  />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {rec.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {rec.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Chat */}
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              AI Chat
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="p-4 space-y-4">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <div className="h-8 w-8 rounded-full bg-gray-200" />
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {msg.text}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 ml-10">
                      <div className="bg-primary-50 dark:bg-primary-900 rounded-lg p-3">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {msg.response}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Type your question..."
                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Analytics
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {analyticsCharts.map((chart) => (
              <div
                key={chart.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {chart.title}
                  </h3>
                  <chart.icon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="h-40 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  {/* Chart component will be rendered here */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

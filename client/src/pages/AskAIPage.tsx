import { useState, useRef, useEffect } from 'react';
import { 
  PaperAirplaneIcon, 
  ArrowPathIcon, 
  LightBulbIcon,
  ChartBarIcon,
  DocumentTextIcon,
  TableCellsIcon,
  ArrowTrendingUpIcon,
  CubeTransparentIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  chart?: string; // Base64 encoded chart image or chart component reference
  table?: {
    headers: string[];
    rows: any[][];
  };
}

interface DataSource {
  id: string;
  name: string;
  type: 'csv' | 'excel';
  lastUpdated: Date;
}

export function AskAIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI data analyst. Ask me anything about your data, and I'll help you analyze it. You can ask questions like 'Why did sales drop in June?' or 'Show me the trend of customer satisfaction over time.'",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sample data sources
  const dataSources: DataSource[] = [
    { id: '1', name: 'Sales Data 2023', type: 'csv', lastUpdated: new Date(2023, 6, 15) },
    { id: '2', name: 'Customer Feedback', type: 'excel', lastUpdated: new Date(2023, 6, 10) },
    { id: '3', name: 'Marketing Campaign', type: 'csv', lastUpdated: new Date(2023, 6, 5) }
  ];

  const suggestedQuestions = [
    { text: "What were the top-selling products last month?", icon: ChartBarIcon },
    { text: "Why did customer satisfaction drop in Q2?", icon: LightBulbIcon },
    { text: "Show me the sales trend for the past year", icon: ArrowTrendingUpIcon },
    { text: "Which regions have the highest churn rate?", icon: TableCellsIcon },
    { text: "Summarize our quarterly performance", icon: DocumentTextIcon },
    { text: "What factors are driving our revenue growth?", icon: CubeTransparentIcon }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    if (!selectedDataSource) {
      // If no data source is selected, prompt the user to select one
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Please select a data source first so I can answer questions about your data.",
        timestamp: new Date()
      }]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      // In a real app, this would be an API call to your AI service
      const aiResponse = generateMockResponse(input, selectedDataSource);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        chart: aiResponse.chart,
        table: aiResponse.table
      }]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  const generateMockResponse = (question: string, dataSourceId: string): { 
    content: string; 
    chart?: string; 
    table?: { headers: string[]; rows: any[][] }
  } => {
    // This is just a simple mock response generator
    // In a real app, this would be replaced by an actual AI service
    
    const dataSource = dataSources.find(ds => ds.id === dataSourceId);
    const dataSourceName = dataSource?.name || "your data";
    
    if (question.toLowerCase().includes('sales') && question.toLowerCase().includes('drop')) {
      return {
        content: `Based on ${dataSourceName}, sales dropped by 15% in June primarily due to supply chain issues affecting your top 3 products. The Western region was most affected with a 23% decrease, while the Eastern region only saw a 7% drop. I've created a chart showing the sales trend by region.`,
        chart: "sales_drop_chart" // In a real app, this would be a base64 image or chart component reference
      };
    }
    
    if (question.toLowerCase().includes('top-selling') && question.toLowerCase().includes('products')) {
      return {
        content: `According to ${dataSourceName}, your top-selling products last month were:`,
        table: {
          headers: ['Product', 'Revenue', '% of Total', 'MoM Change'],
          rows: [
            ['Product X', '$125,000', '23%', '+7%'],
            ['Product Y', '$98,500', '18%', '0%'],
            ['Product Z', '$76,200', '14%', '-2%'],
            ['Product A', '$54,300', '10%', '+15%'],
            ['Product B', '$43,700', '8%', '-5%']
          ]
        }
      };
    }
    
    if (question.toLowerCase().includes('customer satisfaction') || question.toLowerCase().includes('churn')) {
      return {
        content: `Analysis of ${dataSourceName} shows that customer satisfaction scores dropped from 4.6 to 4.2 in Q2. The main factors were shipping delays (mentioned in 45% of negative reviews) and product quality issues (mentioned in 30% of negative reviews). I recommend focusing on improving your logistics and quality control processes.`,
        chart: "satisfaction_chart"
      };
    }
    
    if (question.toLowerCase().includes('trend') || question.toLowerCase().includes('over time')) {
      return {
        content: `I've analyzed ${dataSourceName} over the past year and identified a clear seasonal pattern. Sales peak during November-December (holiday season) and May-June (summer season). There's also a consistent 8% year-over-year growth trend when accounting for seasonality.`,
        chart: "sales_trend_chart"
      };
    }
    
    if (question.toLowerCase().includes('regions') && question.toLowerCase().includes('churn')) {
      return {
        content: `Based on ${dataSourceName}, here are the churn rates by region:`,
        table: {
          headers: ['Region', 'Churn Rate', 'YoY Change', 'Risk Level'],
          rows: [
            ['West', '5.2%', '+0.8%', 'High'],
            ['Midwest', '3.7%', '-0.2%', 'Medium'],
            ['South', '4.1%', '+0.3%', 'Medium'],
            ['Northeast', '2.9%', '-0.5%', 'Low'],
            ['International', '6.3%', '+1.2%', 'Critical']
          ]
        }
      };
    }
    
    if (question.toLowerCase().includes('summarize') || question.toLowerCase().includes('performance')) {
      return {
        content: `Q2 2023 Performance Summary from ${dataSourceName}:\n\n• Revenue: $2.4M (↑12% YoY)\n• Profit Margin: 28% (↑3% YoY)\n• Customer Acquisition Cost: $105 (↓8% YoY)\n• Customer Retention Rate: 85% (↑2% YoY)\n\nStrengths: Product X launch exceeded expectations by 30%\nWeaknesses: Supply chain issues caused $120K in lost revenue\n\nWould you like me to generate a detailed report?`,
        chart: "performance_summary_chart"
      };
    }
    
    if (question.toLowerCase().includes('factors') && question.toLowerCase().includes('revenue')) {
      return {
        content: `Based on my analysis of ${dataSourceName}, the key factors driving your revenue growth are:\n\n1. New product launches (contributing 45% of growth)\n2. Expansion into new markets (contributing 30% of growth)\n3. Increased customer retention (contributing 15% of growth)\n4. Price optimization (contributing 10% of growth)\n\nThe most significant opportunity appears to be further market expansion, which shows the highest ROI among all growth strategies.`,
        chart: "revenue_factors_chart"
      };
    }
    
    return {
      content: `I've analyzed ${dataSourceName} regarding your question about "${question}". The key insights are that there's a strong correlation between the factors you mentioned, with a clear trend emerging over the past quarter. Would you like me to create a visualization or provide more detailed analysis?`
    };
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderChart = (chartId: string) => {
    // In a real app, this would render an actual chart component or image
    // For this demo, we'll just show a placeholder
    return (
      <div className="mt-3 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex items-center justify-center h-64">
        <div className="text-center">
          <ChartBarIcon className="h-12 w-12 text-primary-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            [Chart visualization would appear here]
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {chartId.replace(/_/g, ' ')}
          </p>
        </div>
      </div>
    );
  };

  const renderTable = (table: { headers: string[]; rows: any[][] }) => {
    return (
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {table.headers.map((header, index) => (
                <th 
                  key={index} 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {table.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td 
                    key={cellIndex} 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      {/* Data source selection */}
      <div className="flex-none mb-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center">
              <QuestionMarkCircleIcon className="h-5 w-5 text-primary-500 mr-2" />
              <h2 className="text-md font-medium text-gray-900 dark:text-white">Ask AI about your data</h2>
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-4">
              <label htmlFor="data-source" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select data source:
              </label>
              <select
                id="data-source"
                value={selectedDataSource || ''}
                onChange={(e) => setSelectedDataSource(e.target.value || null)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select a data source</option>
                {dataSources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name} ({source.type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-grow overflow-y-auto bg-white dark:bg-gray-900 rounded-t-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-3xl rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                
                {message.chart && renderChart(message.chart)}
                
                {message.table && renderTable(message.table)}
                
                <div
                  className={`text-xs mt-1 ${
                    message.role === 'user'
                      ? 'text-primary-200'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-lg rounded-lg px-4 py-2 bg-gray-100 dark:bg-gray-800">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse delay-100"></div>
                  <div className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested questions */}
      {messages.length < 3 && (
        <div className="flex-none py-3 px-4 bg-gray-50 dark:bg-gray-800 border-x border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Suggested questions
          </h3>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question.text)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <question.icon className="h-3.5 w-3.5 mr-1 text-gray-500 dark:text-gray-400" />
                {question.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="flex-none p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-b-lg">
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={selectedDataSource ? "Ask a question about your data..." : "Select a data source first..."}
            className="flex-grow rounded-l-md border-r-0 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-900 dark:text-white"
            disabled={!selectedDataSource}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading || !selectedDataSource}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white ${
              !input.trim() || isLoading || !selectedDataSource
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
            }`}
          >
            {isLoading ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <PaperAirplaneIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
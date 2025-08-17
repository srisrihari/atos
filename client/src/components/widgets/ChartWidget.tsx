import { BaseWidget, BaseWidgetProps } from './BaseWidget';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export function ChartWidget({ widget }: BaseWidgetProps) {
  const renderChart = () => {
    const chartType = widget.settings.chartType || 'line';
    const data = widget.settings.data || [];

    switch (chartType) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#0ea5e9"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#0ea5e9" />
          </BarChart>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            Unsupported chart type
          </div>
        );
    }
  };

  return (
    <BaseWidget widget={widget}>
      <div className="h-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </BaseWidget>
  );
}

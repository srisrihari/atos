import { BaseWidget, BaseWidgetProps } from './BaseWidget';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

export function KPIWidget({ widget }: BaseWidgetProps) {
  const value = widget.settings.value || 0;
  const previousValue = widget.settings.previousValue || 0;
  const format = widget.settings.format || 'number';
  const prefix = widget.settings.prefix || '';
  const suffix = widget.settings.suffix || '';

  const percentageChange = previousValue !== 0
    ? ((value - previousValue) / previousValue) * 100
    : 0;

  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(val);
      
      case 'percentage':
        return `${val.toFixed(1)}%`;
      
      case 'number':
      default:
        return new Intl.NumberFormat('en-US').format(val);
    }
  };

  return (
    <BaseWidget widget={widget}>
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {prefix}{formatValue(value)}{suffix}
        </div>
        
        {previousValue !== 0 && (
          <div className={`
            flex items-center mt-2 text-sm
            ${percentageChange > 0 ? 'text-green-600' : 'text-red-600'}
          `}>
            {percentageChange > 0 ? (
              <ArrowUpIcon className="w-4 h-4 mr-1" />
            ) : (
              <ArrowDownIcon className="w-4 h-4 mr-1" />
            )}
            <span>{Math.abs(percentageChange).toFixed(1)}%</span>
            <span className="ml-1 text-gray-500">vs previous</span>
          </div>
        )}
      </div>
    </BaseWidget>
  );
}

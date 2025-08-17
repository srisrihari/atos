import {
  ChartBarIcon,
  PresentationChartLineIcon,
  TableCellsIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface WidgetToolbarProps {
  onAddWidget: (type: string) => void;
}

const WIDGET_TYPES = [
  {
    type: 'chart',
    icon: ChartBarIcon,
    label: 'Chart'
  },
  {
    type: 'kpi',
    icon: PresentationChartLineIcon,
    label: 'KPI'
  },
  {
    type: 'table',
    icon: TableCellsIcon,
    label: 'Table'
  },
  {
    type: 'text',
    icon: DocumentTextIcon,
    label: 'Text'
  }
];

export function WidgetToolbar({ onAddWidget }: WidgetToolbarProps) {
  return (
    <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Add Widgets
      </h2>
      
      <div className="space-y-2">
        {WIDGET_TYPES.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => onAddWidget(type)}
            className="w-full flex items-center space-x-2 p-2 rounded-lg
              text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800
              transition-colors duration-150"
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

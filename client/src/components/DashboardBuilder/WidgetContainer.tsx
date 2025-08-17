import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Widget } from '../../types/supabase';
import { ChartWidget } from '../widgets/ChartWidget';
import { KPIWidget } from '../widgets/KPIWidget';
import { TableWidget } from '../widgets/TableWidget';
import { TextWidget } from '../widgets/TextWidget';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface WidgetContainerProps {
  widget: Widget;
  isActive: boolean;
  onRemove: () => void;
}

export function WidgetContainer({ widget, isActive, onRemove }: WidgetContainerProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${widget.size.width}`,
    gridRow: `span ${widget.size.height}`,
    opacity: isDragging ? 0.5 : 1,
  };

  const renderWidget = () => {
    switch (widget.type) {
      case 'chart':
        return <ChartWidget widget={widget} />;
      case 'kpi':
        return <KPIWidget widget={widget} />;
      case 'table':
        return <TableWidget widget={widget} />;
      case 'text':
        return <TextWidget widget={widget} />;
      default:
        return <div>Unsupported widget type</div>;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative rounded-lg border shadow-sm bg-white dark:bg-gray-800
        ${isActive ? 'ring-2 ring-primary-500' : ''}
      `}
      {...attributes}
    >
      <div
        className="p-4 cursor-move select-none"
        {...listeners}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {widget.title}
          </h3>
          <button
            onClick={onRemove}
            className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
        
        {renderWidget()}
      </div>
    </div>
  );
}

import { BaseWidget, BaseWidgetProps } from './BaseWidget';

export function TextWidget({ widget }: BaseWidgetProps) {
  const content = widget.settings.content || '';
  const align = widget.settings.align || 'left';
  const size = widget.settings.size || 'normal';

  const textSizeClasses = {
    small: 'text-sm',
    normal: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl'
  }[size];

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[align];

  return (
    <BaseWidget widget={widget}>
      <div className={`p-4 ${textSizeClasses} ${alignmentClasses} text-gray-900 dark:text-gray-100`}>
        {content}
      </div>
    </BaseWidget>
  );
}

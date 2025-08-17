import { Widget } from '../../types/supabase';

export interface BaseWidgetProps {
  widget: Widget;
}

export interface WidgetData {
  isLoading: boolean;
  error: Error | null;
  data: any;
}

export function useWidgetData(widget: Widget): WidgetData {
  // TODO: Implement data fetching based on widget.dataSource
  return {
    isLoading: false,
    error: null,
    data: null
  };
}

export function BaseWidget({ widget, children }: BaseWidgetProps & { children: React.ReactNode }) {
  const { isLoading, error, data } = useWidgetData(widget);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        <p>Error loading widget data</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      {children}
    </div>
  );
}

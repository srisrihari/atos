import { useState } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { Widget } from '../../types/supabase';
import { WidgetContainer } from './WidgetContainer';
import { WidgetToolbar } from './WidgetToolbar';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/supabase';

interface DashboardBuilderProps {
  dashboardId?: string;
  initialWidgets?: Widget[];
  onSave?: (widgets: Widget[]) => void;
}

export function DashboardBuilder({ dashboardId, initialWidgets = [], onSave }: DashboardBuilderProps) {
  const { userId } = useAuth();
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  // Handle widget addition
  const handleAddWidget = async (type: Widget['type']) => {
    if (!userId) return;

    const newWidget: Widget = {
      id: crypto.randomUUID(),
      type,
      title: `New ${type} widget`,
      position: { x: 0, y: widgets.length },
      size: { width: 2, height: 2 },
      dataSource: '',
      settings: {}
    };

    setWidgets([...widgets, newWidget]);

    if (dashboardId) {
      try {
        await db.dashboards.update(dashboardId, {
          widgets: [...widgets, newWidget]
        });
      } catch (error) {
        console.error('Failed to save widget:', error);
        // Revert the change if save failed
        setWidgets(widgets);
      }
    }
  };

  // Handle widget removal
  const handleRemoveWidget = async (widgetId: string) => {
    const updatedWidgets = widgets.filter(w => w.id !== widgetId);
    setWidgets(updatedWidgets);

    if (dashboardId) {
      try {
        await db.dashboards.update(dashboardId, {
          widgets: updatedWidgets
        });
      } catch (error) {
        console.error('Failed to remove widget:', error);
        // Revert the change if save failed
        setWidgets(widgets);
      }
    }
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const oldIndex = widgets.findIndex(w => w.id === active.id);
    const newIndex = widgets.findIndex(w => w.id === over.id);

    const updatedWidgets = [...widgets];
    const [movedWidget] = updatedWidgets.splice(oldIndex, 1);
    updatedWidgets.splice(newIndex, 0, movedWidget);

    // Update positions
    const finalWidgets = updatedWidgets.map((widget, index) => ({
      ...widget,
      position: { ...widget.position, y: index }
    }));

    setWidgets(finalWidgets);
    setActiveId(null);

    if (dashboardId) {
      try {
        await db.dashboards.update(dashboardId, {
          widgets: finalWidgets
        });
      } catch (error) {
        console.error('Failed to update widget positions:', error);
        // Revert the change if save failed
        setWidgets(widgets);
      }
    }

    onSave?.(finalWidgets);
  };

  return (
    <div className="flex h-full">
      <WidgetToolbar onAddWidget={handleAddWidget} />
      
      <div className="flex-1 p-4">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={widgets.map(w => w.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-12 gap-4">
              {widgets.map(widget => (
                <WidgetContainer
                  key={widget.id}
                  widget={widget}
                  isActive={widget.id === activeId}
                  onRemove={() => handleRemoveWidget(widget.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

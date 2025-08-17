import { BaseWidget, BaseWidgetProps } from './BaseWidget';

interface Column {
  key: string;
  label: string;
  format?: (value: any) => string;
}

export function TableWidget({ widget }: BaseWidgetProps) {
  const columns: Column[] = widget.settings.columns || [];
  const data: any[] = widget.settings.data || [];

  return (
    <BaseWidget widget={widget}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                  >
                    {column.format
                      ? column.format(row[column.key])
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {data.length === 0 && (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            No data available
          </div>
        )}
      </div>
    </BaseWidget>
  );
}

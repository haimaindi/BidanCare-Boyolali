import React, { ReactNode } from 'react';
import { cn } from '../../../logic/utils/cn';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T, index: number) => ReactNode);
  className?: string;
  headerClassName?: string;
}

interface TableModuleProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  className?: string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export function TableModule<T>({
  columns,
  data,
  keyExtractor,
  className,
  onRowClick,
  emptyMessage = 'Tidak ada data ditemukan',
}: TableModuleProps<T>) {
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-neutral-100">
            {columns.map((column, index) => (
              <th
                key={index}
                className={cn(
                  'px-4 py-3 text-center text-[0.75rem] font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap',
                  column.headerClassName
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {data.length > 0 ? (
            data.map((item, rowIndex) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  'transition-colors duration-200',
                  onRowClick ? 'cursor-pointer hover:bg-neutral-50' : 'hover:bg-neutral-50/50'
                )}
              >
                {columns.map((column, index) => (
                  <td
                    key={index}
                    className={cn(
                      'px-4 py-4 text-[0.875rem] text-neutral-700 whitespace-nowrap text-center',
                      column.className
                    )}
                  >
                    {typeof column.accessor === 'function'
                      ? column.accessor(item, rowIndex)
                      : (item[column.accessor] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-neutral-400 italic text-[0.875rem]"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

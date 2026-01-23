import type { ColumnType } from '../types';

/**
 * Column Styling Constants
 * Centralized styling for board columns based on their type
 * Prevents hard-coded style mappings and ensures consistency
 */

export const COLUMN_STYLES: Record<ColumnType, string> = {
  BACKLOG: 'border-gray-600',
  TO_DO: 'border-blue-600',
  IN_PROGRESS: 'border-yellow-600',
  DONE: 'border-green-600',
};

export const COLUMN_BG_COLORS: Record<ColumnType, string> = {
  BACKLOG: 'bg-gray-900',
  TO_DO: 'bg-gray-900',
  IN_PROGRESS: 'bg-gray-900',
  DONE: 'bg-gray-900',
};

export const COLUMN_HOVER_COLORS: Record<ColumnType, string> = {
  BACKLOG: 'ring-gray-500',
  TO_DO: 'ring-blue-500',
  IN_PROGRESS: 'ring-yellow-500',
  DONE: 'ring-green-500',
};

/**
 * Get column style by type with fallback
 * @param columnType - The column type
 * @returns CSS class string for the column border
 */
export const getColumnStyle = (columnType: ColumnType | string): string => {
  return COLUMN_STYLES[columnType as ColumnType] || COLUMN_STYLES.BACKLOG;
};

/**
 * Get column hover ring color by type with fallback
 * @param columnType - The column type
 * @returns CSS class string for the hover ring color
 */
export const getColumnHoverColor = (columnType: ColumnType | string): string => {
  return COLUMN_HOVER_COLORS[columnType as ColumnType] || COLUMN_HOVER_COLORS.BACKLOG;
};

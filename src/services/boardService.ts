import api from './api';
import type { BoardColumn } from '../types';

/**
 * Board Service
 * Handles all API calls related to board columns
 */

// ==========================================
// GET BOARD COLUMNS
// ==========================================
/**
 * Fetches all columns for a project's board
 * Endpoint: GET /api/projects/{projectId}/columns
 * @param projectId - Project ID
 * @returns Array of board columns (BACKLOG, TO_DO, IN_PROGRESS, DONE)
 */
export const getColumns = async (projectId: number): Promise<BoardColumn[]> => {
  const response = await api.get<BoardColumn[]>(
    `/api/projects/${projectId}/columns`
  );
  return response.data;
};

// ==========================================
// GET COLUMNS WITH NESTED TASKS
// ==========================================
/**
 * Fetches columns with tasks nested inside each column
 * Endpoint: GET /api/projects/{projectId}/columns
 * The backend should return columns with tasks[] populated
 * @param projectId - Project ID
 * @returns Array of columns with tasks included
 */
export const getColumnsWithTasks = async (
  projectId: number
): Promise<BoardColumn[]> => {
  const response = await api.get<BoardColumn[]>(
    `/api/projects/${projectId}/columns`
  );
  return response.data;
};

// ==========================================
// DEFAULT EXPORT
// ==========================================
export default {
  getColumns,
  getColumnsWithTasks,
};

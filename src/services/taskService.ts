import api from './api';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types';

/**
 * Task Service
 * Handles all API calls related to tasks
 */

// ==========================================
// GET ALL TASKS IN PROJECT
// ==========================================
/**
 * Fetches all tasks in a project
 * Endpoint: GET /api/projects/{projectId}/tasks
 * @param projectId - Project ID
 */
export const getTasks = async (projectId: number): Promise<Task[]> => {
  const response = await api.get<Task[]>(`/api/projects/${projectId}/tasks`);
  return response.data;
};

/**
 * Fetches all tasks in a project (workspace-scoped path)
 * Endpoint: GET /api/workspaces/{workspaceId}/projects/{projectId}/tasks
 * @param workspaceId - Workspace ID (must match project's workspace)
 * @param projectId - Project ID
 */
export const getTasksWithWorkspace = async (
  workspaceId: number,
  projectId: number
): Promise<Task[]> => {
  const response = await api.get<Task[]>(
    `/api/workspaces/${workspaceId}/projects/${projectId}/tasks`
  );
  return response.data;
};

// ==========================================
// GET TASKS BY COLUMN
// ==========================================
/**
 * Fetches tasks grouped by column
 * @param projectId - Project ID
 * @returns Object with columnId as key and tasks array as value
 */
export const getTasksByColumn = async (
  projectId: number
): Promise<Record<number, Task[]>> => {
  const tasks = await getTasks(projectId);
  
  // Group tasks by columnId
  const grouped = tasks.reduce((acc, task) => {
    if (!acc[task.columnId]) {
      acc[task.columnId] = [];
    }
    acc[task.columnId].push(task);
    return acc;
  }, {} as Record<number, Task[]>);
  
  return grouped;
};

// ==========================================
// CREATE TASK
// ==========================================
/**
 * Creates a new task in a project
 * Endpoint: POST /api/projects/{projectId}/tasks
 * @param projectId - Project ID
 * @param data - Task data (title, description, columnId, assignedTo, priority, dueDate)
 */
export const createTask = async (
  projectId: number,
  data: CreateTaskRequest
): Promise<Task> => {
  const response = await api.post<Task>(
    `/api/projects/${projectId}/tasks`,
    data
  );
  return response.data;
};

/**
 * Creates a new task in a project (workspace-scoped path)
 * Endpoint: POST /api/workspaces/{workspaceId}/projects/{projectId}/tasks
 * @param workspaceId - Workspace ID (must match project's workspace)
 * @param projectId - Project ID
 * @param data - Task data (title, description, columnId, assignedTo, priority, dueDate)
 */
export const createTaskWithWorkspace = async (
  workspaceId: number,
  projectId: number,
  data: CreateTaskRequest
): Promise<Task> => {
  const response = await api.post<Task>(
    `/api/workspaces/${workspaceId}/projects/${projectId}/tasks`,
    data
  );
  return response.data;
};

// ==========================================
// UPDATE TASK
// ==========================================
/**
 * Updates task details
 * Endpoint: PUT /api/tasks/{taskId}
 * @param taskId - Task ID
 * @param data - Updated task data
 */
export const updateTask = async (
  taskId: number,
  data: UpdateTaskRequest
): Promise<Task> => {
  const response = await api.put<Task>(`/api/tasks/${taskId}`, data);
  return response.data;
};

// ==========================================
// MOVE TASK TO DIFFERENT COLUMN
// ==========================================
/**
 * Moves a task to a different column
 * Endpoint: PATCH /api/tasks/{taskId}/column/{columnId}
 * @param taskId - Task ID
 * @param columnId - Target column ID
 */
export const moveTask = async (
  taskId: number,
  columnId: number
): Promise<Task> => {
  const response = await api.patch<Task>(`/api/tasks/${taskId}/column/${columnId}`);
  return response.data;
};

// ==========================================
// DELETE TASK
// ==========================================
/**
 * Deletes a task
 * Endpoint: DELETE /api/tasks/{taskId}
 * @param taskId - Task ID
 */
export const deleteTask = async (taskId: number): Promise<void> => {
  await api.delete(`/api/tasks/${taskId}`);
};

// ==========================================
// DEFAULT EXPORT
// ==========================================
export default {
  getTasks,
  getTasksWithWorkspace,
  getTasksByColumn,
  createTask,
  createTaskWithWorkspace,
  updateTask,
  moveTask,
  deleteTask,
};

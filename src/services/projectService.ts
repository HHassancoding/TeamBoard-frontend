import api from './api';
import type { Project } from '../types';

/**
 * Project Service
 * Handles all API calls related to projects
 */

// ==========================================
// REQUEST/RESPONSE TYPES
// ==========================================
export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name: string;
  description?: string;
}

// ==========================================
// GET ALL PROJECTS IN WORKSPACE
// ==========================================
/**
 * Fetches all projects in a workspace
 * Endpoint: GET /api/workspaces/{workspaceId}/projects
 * @param workspaceId - Workspace ID
 */
export const getProjects = async (workspaceId: number): Promise<Project[]> => {
  const response = await api.get<Project[]>(`/api/workspaces/${workspaceId}/projects`);
  return response.data;
};

// ==========================================
// GET SINGLE PROJECT
// ==========================================
/**
 * Fetches details of a specific project
 * Endpoint: GET /api/projects/{id}
 * @param projectId - Project ID
 */
export const getProject = async (projectId: number): Promise<Project> => {
  const response = await api.get<Project>(`/api/projects/${projectId}`);
  return response.data;
};

// ==========================================
// CREATE PROJECT
// ==========================================
/**
 * Creates a new project in a workspace
 * Endpoint: POST /api/workspaces/{workspaceId}/projects
 * @param workspaceId - Workspace ID
 * @param data - Project name and description
 */
export const createProject = async (
  workspaceId: number,
  data: CreateProjectRequest
): Promise<Project> => {
  const response = await api.post<Project>(
    `/api/workspaces/${workspaceId}/projects`,
    data
  );
  return response.data;
};

// ==========================================
// UPDATE PROJECT
// ==========================================
/**
 * Updates project details
 * Endpoint: PUT /api/projects/{id}
 * @param projectId - Project ID
 * @param data - Updated name and description
 */
export const updateProject = async (
  projectId: number,
  data: UpdateProjectRequest
): Promise<Project> => {
  const response = await api.put<Project>(`/api/projects/${projectId}`, data);
  return response.data;
};

// ==========================================
// DELETE PROJECT
// ==========================================
/**
 * Deletes a project
 * Endpoint: DELETE /api/projects/{id}
 * @param projectId - Project ID
 */
export const deleteProject = async (projectId: number): Promise<void> => {
  await api.delete(`/api/projects/${projectId}`);
};

// ==========================================
// DEFAULT EXPORT
// ==========================================
export default {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
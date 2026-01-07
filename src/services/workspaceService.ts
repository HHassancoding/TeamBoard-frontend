import api from './api';
import type {
  Workspace,
  WorkspaceMember,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  AddMemberRequest,
} from '../types';

// ==========================================
// GET ALL WORKSPACES
// ==========================================
export const getWorkspaces = async (): Promise<Workspace[]> => {
  const response = await api.get<Workspace[]>('/api/workspaces');
  return response.data;
};

// ==========================================
// GET SINGLE WORKSPACE
// ==========================================
export const getWorkspace = async (id: number): Promise<Workspace> => {
  const response = await api.get<Workspace>(`/api/workspaces/${id}`);
  return response.data;
};

// ==========================================
// CREATE WORKSPACE
// ==========================================
export const createWorkspace = async (
  data: CreateWorkspaceRequest
): Promise<Workspace> => {
  const response = await api.post<Workspace>('/api/workspaces', data);
  return response.data;
};

// ==========================================
// UPDATE WORKSPACE
// ==========================================
export const updateWorkspace = async (
  id: number,
  data: UpdateWorkspaceRequest
): Promise<Workspace> => {
  const response = await api.put<Workspace>(
    `/api/workspaces/${id}`,
    data
  );
  return response.data;
};

// ==========================================
// DELETE WORKSPACE
// ==========================================
export const deleteWorkspace = async (id: number): Promise<void> => {
  await api.delete(`/api/workspaces/${id}`);
};

// ==========================================
// GET WORKSPACE MEMBERS
// ==========================================
export const getWorkspaceMembers = async (
  workspaceId: number
): Promise<WorkspaceMember[]> => {
  const response = await api.get<WorkspaceMember[]>(
    `/api/workspaces/${workspaceId}/members`
  );
  return response.data;
};

// ==========================================
// ADD MEMBER TO WORKSPACE
// ==========================================
export const addWorkspaceMember = async (
  workspaceId: number,
  data: AddMemberRequest
): Promise<WorkspaceMember> => {
  const response = await api.post<WorkspaceMember>(
    `/api/workspaces/${workspaceId}/members`,
    data
  );
  return response.data;
};

// ==========================================
// REMOVE MEMBER
// ==========================================
export const removeWorkspaceMember = async (
  workspaceId: number,
  userId: number
): Promise<void> => {
  await api.delete(
    `/api/workspaces/${workspaceId}/members/${userId}`
  );
};

export default {
  getWorkspaces,
  getWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceMembers,
  addWorkspaceMember,
  removeWorkspaceMember,
};

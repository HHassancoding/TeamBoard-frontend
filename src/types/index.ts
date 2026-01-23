// ==========================================
// WORKSPACE TYPES
// ==========================================

export interface Workspace {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  ownerName: string;
  ownerEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: number;
  userId: number;
  userEmail: string;
  userName: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
  joinedAt: string;
  updatedAt: string;
}

// Request types for creating/updating
export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
}

export interface UpdateWorkspaceRequest {
  name: string;
  description?: string;
}

export interface AddMemberRequest {
  userId: number;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
}

// ==========================================
// WORKSPACE TYPES
// ==========================================

export interface Workspace {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  ownerName: string;
  ownerEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: number;
  userId: number;
  userEmail: string;
  userName: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
  joinedAt: string;
  updatedAt: string;
}

export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
}

export interface UpdateWorkspaceRequest {
  name: string;
  description?: string;
}

export interface AddMemberRequest {
  userId: number;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
}

// ==========================================
// PROJECT TYPES
// ==========================================

export interface Project {
  id: number;
  workspaceId: number;
  name: string;
  description?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// TASK & BOARD TYPES
// ==========================================

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type ColumnType = 'BACKLOG' | 'TO_DO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: number;
  projectId: number;
  columnId: number;
  title: string;
  description?: string;
  assignedTo?: number;
  assignedToName?: string;
  priority: Priority;
  dueDate?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface BoardColumn {
  id: number;
  projectId: number;
  name: string;
  position: number;
  columnType: ColumnType;
  tasks?: Task[];
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  // NOTE: Do NOT send columnId - backend auto-assigns to Backlog
  assignedToId?: number;  // Changed from 'assignedTo' to match backend
  priority: Priority;
  dueDate?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  assignedTo?: number;
  priority?: Priority;
  dueDate?: string;
}

export interface MoveTaskRequest {
  columnId: number;
}
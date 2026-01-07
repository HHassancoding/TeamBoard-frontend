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
// PROJECT TYPES (ADD THIS!)
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
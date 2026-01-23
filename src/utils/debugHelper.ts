/**
 * Debug Helper
 * Utilities for debugging backend permission issues
 */

export interface PermissionDebugInfo {
  timestamp: string;
  userId: number;
  userEmail: string;
  projectId: number;
  workspaceId: number;
  workspaceMembers: Array<{ userId: number; email: string; role: string }>;
  isMember: boolean;
  jwtToken: string | null;
}

/**
 * Collect comprehensive debug information for backend support
 */
export const collectPermissionDebugInfo = (data: {
  userId?: number;
  userEmail?: string;
  projectId: number;
  workspaceId: number;
  members?: Array<{ userId: number; userEmail: string; role: string }>;
}): PermissionDebugInfo => {
  const token = localStorage.getItem('accessToken');
  const { userId = 0, userEmail = '', projectId, workspaceId, members = [] } = data;
  
  const debugInfo: PermissionDebugInfo = {
    timestamp: new Date().toISOString(),
    userId,
    userEmail,
    projectId,
    workspaceId,
    workspaceMembers: members.map(m => ({
      userId: m.userId,
      email: m.userEmail,
      role: m.role,
    })),
    isMember: members.some(m => m.userId === userId),
    jwtToken: token ? `${token.substring(0, 20)}...` : null, // Show first 20 chars only
  };
  
  console.log('🔍 [DEBUG] Full Permission Context:', debugInfo);
  
  return debugInfo;
};

/**
 * Log backend API call details for tracing
 */
export const logBackendCall = (endpoint: string, method: string, userId?: number) => {
  const token = localStorage.getItem('accessToken');
  console.log(`📡 [API Call] ${method} ${endpoint}`, {
    userId,
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : null,
    timestamp: new Date().toISOString(),
  });
};

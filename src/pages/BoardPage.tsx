import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/authContext';
import { collectPermissionDebugInfo } from '../utils/debugHelper';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import projectService from '../services/projectService';
import boardService from '../services/boardService';
import taskService from '../services/taskService';
import workspaceService from '../services/workspaceService';
import BoardColumn from '../components/Board/BoardColumn';
import TaskCard from '../components/Board/TaskCard';
import CreateTaskModal from '../components/Board/CreateTaskModal';
import TaskDetailModal from '../components/Board/TaskDetailModal';
import type { Task } from '../types';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';

/**
 * BoardPage Component
 * 
 * EXPLANATION:
 * 1. REACT HOOKS USED:
 *    - useState: Manage modal open/close states and active dragged task
 *    - useParams: Extract workspaceId and projectId from URL
 *    - useNavigate: Navigate back to workspace
 *    - useQuery: Fetch project, columns (with tasks), and members
 *    - useMutation: Handle task updates (move, edit, delete)
 *    - useQueryClient: Invalidate queries to refetch fresh data
 * 
 * 2. @DND-KIT DRAG-DROP:
 *    - DndContext: Wraps entire board, provides drag-drop context
 *    - useSensors: Configure drag activation (pointer sensor)
 *    - onDragStart: Fires when drag begins (track which task)
 *    - onDragEnd: Fires when drag ends (update task column)
 *    - DragOverlay: Shows dragged task while dragging
 * 
 * 3. OPTIMISTIC UPDATES:
 *    - When task is dropped, immediately update local state
 *    - Show visual feedback before API call completes
 *    - If API fails, React Query auto-reverts via refetch
 *    - Use queryClient.setQueryData for optimistic update
 * 
 * 4. TASK ASSIGNMENT:
 *    - Members dropdown populated from workspace members
 *    - User selects from dropdown (shows name + email)
 *    - Stores userId in assignedTo field
 * 
 * 5. DATE FORMATTING:
 *    - Due dates: toLocaleDateString for user-friendly format
 *    - Timestamps: toLocaleString for full date + time
 *    - Overdue detection: compare with new Date()
 */

export default function BoardPage() {
  const { user } = useAuth();
  const { workspaceId, projectId } = useParams<{
    workspaceId: string;
    projectId: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const workspaceIdNum = Number(workspaceId);
  const projectIdNum = Number(projectId);

  // Validate IDs are valid numbers, not NaN
  if (isNaN(projectIdNum) || isNaN(workspaceIdNum)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">Invalid project or workspace ID</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Modal states
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to activate drag
      },
    })
  );

  // Fetch project details
  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useQuery({
    queryKey: ['project', projectIdNum],
    queryFn: async () => {
      console.log(`[BoardPage] Fetching project ${projectIdNum} with workspace ${workspaceIdNum}`);
      const proj = await projectService.getProjectWithWorkspace(workspaceIdNum, projectIdNum);
      console.log(`[BoardPage] Project loaded:`, {
        id: proj.id,
        name: proj.name,
        workspaceId: proj.workspaceId,
        expectedWorkspaceId: workspaceIdNum,
        idsMatch: proj.workspaceId === workspaceIdNum,
      });
      
      // Validate workspace ID matches
      if (proj.workspaceId !== workspaceIdNum) {
        console.error(`[BoardPage] WORKSPACE ID MISMATCH!`, {
          urlWorkspaceId: workspaceIdNum,
          projectWorkspaceId: proj.workspaceId,
          projectId: projectIdNum,
        });
      }
      
      return proj;
    },
    enabled: !!projectId,
  });

  // Fetch board columns (without tasks)
  const {
    data: columnsData,
    isLoading: columnsLoading,
    error: columnsError,
  } = useQuery({
    queryKey: ['columns', projectIdNum],
    queryFn: () => {
      console.log(`[BoardPage] Fetching columns for workspace ${workspaceIdNum}, project ${projectIdNum}`);
      return boardService.getColumnsWithWorkspace(workspaceIdNum, projectIdNum);
    },
    enabled: !!projectId,
    retry: (failureCount, error: any) => {
      // Don't retry on 403/404 - likely ID mismatch or permission issue
      if (error?.response?.status === 403 || error?.response?.status === 404) {
        console.error(`[BoardPage] Column fetch failed with ${error.response.status}`, {
          projectId: projectIdNum,
          workspaceId: workspaceIdNum,
          status: error.response.status,
          message: error.response?.data,
        });
        return false;
      }
      return failureCount < 2;
    },
  });

  // Fetch all tasks for the project
  const {
    data: tasksData,
    isLoading: tasksLoading,
    error: tasksError,
  } = useQuery({
    queryKey: ['tasks', projectIdNum],
    queryFn: () => {
      console.log(`[BoardPage] Fetching tasks for workspace ${workspaceIdNum}, project ${projectIdNum}`);
      return taskService.getTasksWithWorkspace(workspaceIdNum, projectIdNum);
    },
    enabled: !!projectId,
    retry: (failureCount, error: any) => {
      // Don't retry on 403/404 - likely ID mismatch or permission issue
      if (error?.response?.status === 403 || error?.response?.status === 404) {
        console.error(`[BoardPage] Task fetch failed with ${error.response.status}`, {
          projectId: projectIdNum,
          workspaceId: workspaceIdNum,
          status: error.response.status,
          message: error.response?.data,
        });
        return false;
      }
      return failureCount < 2;
    },
  });

  // Merge columns with tasks locally
  const columns = columnsData?.map((column) => ({
    ...column,
    tasks: tasksData?.filter((task) => task.columnId === column.id) || [],
  })) || [];

  // Fetch workspace members for task assignment and membership verification
  const {
    data: members,
    isLoading: membersLoading,
    error: membersError,
  } = useQuery({
    queryKey: ['workspace-members', workspaceIdNum],
    queryFn: async () => {
      console.log(`[BoardPage] Fetching workspace members for workspace ${workspaceIdNum}`);
      const membersList = await workspaceService.getWorkspaceMembers(workspaceIdNum);
      console.log(`[BoardPage] Workspace members loaded:`, {
        workspaceId: workspaceIdNum,
        membersCount: membersList.length,
        members: membersList.map(m => ({ userId: m.userId, email: m.userEmail, role: m.role })),
        currentUserId: user?.id,
        currentUserEmail: user?.email,
        currentUserIsMember: membersList.some(m => m.userId === user?.id),
      });
      return membersList;
    },
    enabled: !!workspaceId,
  });

  // Check if current user is a member of the workspace
  const userIsMember = members?.some(m => m.userId === user?.id);
  const hasMembersData = members && members.length > 0;
  
  // Log membership check results
  if (members && user) {
    console.log(`[BoardPage] Membership check:`, {
      userId: user.id,
      userEmail: user.email,
      isMember: userIsMember,
      totalMembers: members.length,
    });
    
    // Collect comprehensive debug info for backend support
    collectPermissionDebugInfo({
      userId: user.id,
      userEmail: user.email,
      projectId: projectIdNum,
      workspaceId: workspaceIdNum,
      members,
    });
    
    if (!userIsMember && members.length > 0) {
      console.error(`[BoardPage] ⚠️ MEMBERSHIP ISSUE: User ${user.id} (${user.email}) is NOT a member of workspace ${workspaceIdNum}!`, {
        availableMembers: members.map(m => `User ${m.userId} (${m.userEmail})`),
      });
    } else if (userIsMember) {
      console.log(`[BoardPage] ✅ User IS a workspace member, but backend may still reject project access due to backend permission bug`);
    }
  }

  // Mutation: Move task to different column
  const moveTaskMutation = useMutation({
    mutationFn: ({ taskId, columnId }: { taskId: number; columnId: number }) =>
      taskService.moveTask(taskId, columnId),
    onMutate: async ({ taskId, columnId }) => {
      // OPTIMISTIC UPDATE
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks', projectIdNum] });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData<Task[]>([
        'tasks',
        projectIdNum,
      ]);

      // Optimistically update tasks
      if (previousTasks) {
        const newTasks = previousTasks.map((task) =>
          task.id === taskId ? { ...task, columnId } : task
        );
        queryClient.setQueryData(['tasks', projectIdNum], newTasks);
      }

      return { previousTasks };
    },
    onError: (_error, _variables, context) => {
      // Revert on error
      if (context?.previousTasks) {
        queryClient.setQueryData(
          ['tasks', projectIdNum],
          context.previousTasks
        );
      }
      alert('Failed to move task');
    },
    onSettled: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: ['tasks', projectIdNum] });
    },
  });

  // Mutation: Update task
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data: any }) =>
      taskService.updateTask(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectIdNum] });
      setSelectedTask(null);
    },
    onError: () => {
      alert('Failed to update task');
    },
  });

  // Mutation: Delete task
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: number) => taskService.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectIdNum] });
      setSelectedTask(null);
    },
    onError: () => {
      alert('Failed to delete task');
    },
  });

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as number;
    const task = columns
      ?.flatMap((col) => col.tasks || [])
      .find((t) => t.id === taskId);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as number;
    // IMPORTANT: Using column.id from backend response, NOT column name
    // Backend expects: PATCH /api/tasks/{taskId}/column/{columnId}
    const targetColumnId = over.id as number;

    // Find task's current column
    const currentColumn = columns?.find((col) =>
      col.tasks?.some((task) => task.id === taskId)
    );

    if (currentColumn && currentColumn.id !== targetColumnId) {
      console.log(`[BoardPage] Moving task ${taskId} from column ${currentColumn.id} to ${targetColumnId}`);
      // Move task to new column
      moveTaskMutation.mutate({ taskId, columnId: targetColumnId });
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleUpdateTask = async (taskId: number, data: any) => {
    await updateTaskMutation.mutateAsync({ taskId, data });
  };

  const handleDeleteTask = async (taskId: number) => {
    await deleteTaskMutation.mutateAsync(taskId);
  };

  // Loading state
  if (projectLoading || columnsLoading || tasksLoading || membersLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  // Membership verification error
  if (!membersLoading && hasMembersData && !userIsMember) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">Access Denied</p>
          <p className="text-gray-400 mb-6">You are not a member of this workspace. Contact the workspace owner to request access.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Error state with detailed information
  if (projectError || columnsError || tasksError || membersError) {
    const errorDetails = projectError || columnsError || tasksError || membersError;
    const errorStatus = (errorDetails as any)?.response?.status;
    const errorMessage = (errorDetails as any)?.message || 
                        (errorDetails as any)?.response?.data || 
                        'Failed to load board';
    
    // Check for workspace ID mismatch
    const workspaceMismatch = project && project.workspaceId !== workspaceIdNum;
    
    // CRITICAL: If user is a member but still getting 403, it's a backend bug
    const membershipOkBut403 = userIsMember && errorStatus === 403 && !workspaceMismatch;
    
    const debugInfo = {
      projectId: projectIdNum,
      workspaceId: workspaceIdNum,
      projectActualWorkspaceId: project?.workspaceId,
      workspaceMismatch,
      userId: user?.id,
      userEmail: user?.email,
      isMember: userIsMember,
      membershipOkBut403,
      errorStatus,
      timestamp: new Date().toISOString(),
      error: errorMessage,
    };
    
    console.error('BoardPage Error Details:', debugInfo);
    
    // Specific error message for workspace ID mismatch
    let helpText = 'Share the debug information above with support if the error persists.';
    
    if (membershipOkBut403) {
      helpText = `🐛 BACKEND BUG DETECTED: You ARE a workspace member (verified in frontend), but the backend's GET /api/projects/${projectIdNum} endpoint is incorrectly rejecting your request with 403. This is a backend permission check bug. The backend needs to fix its project access authorization logic.`;
    } else if (workspaceMismatch) {
      helpText = '⚠️ Workspace ID mismatch detected! The project does not belong to this workspace. This usually happens when navigating with incorrect URL parameters.';
    } else if (errorStatus === 403) {
      helpText = '⚠️ Access forbidden. You may not be a member of the workspace, or the workspace ID in the URL does not match the project\'s workspace.';
    } else if (errorStatus === 404) {
      helpText = '⚠️ Project or columns not found. The project may have been deleted, or the workspace ID in the URL is incorrect.';
    }
    
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-2xl">
          <p className="text-red-500 text-xl mb-2">Failed to load board</p>
          <p className="text-gray-400 mb-4 text-sm">{String(errorMessage)}</p>
          
          {/* Debug Information */}
          <div className="bg-gray-800 rounded p-4 mb-6 text-left">
            <p className="text-gray-300 text-xs font-mono mb-2">Debug Information:</p>
            <pre className="text-gray-400 text-xs overflow-x-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
          
          <p className="text-gray-500 text-xs mb-4">
            {helpText}
          </p>
          
          <button
            onClick={() => navigate(`/workspace/${workspaceId}`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            Back to Workspace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
        <div className="max-w-full px-6 py-4">
          {/* Back Button */}
          <button
            onClick={() => navigate(`/workspace/${workspaceId}`)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft size={20} />
            Back to Workspace
          </button>

          {/* Project Info */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{project?.name}</h1>
              {project?.description && (
                <p className="text-gray-400 mt-2">{project.description}</p>
              )}
            </div>

            {/* Create Task Button */}
            <button
              onClick={() => setIsCreateTaskModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              <Plus size={18} />
              Create Task
            </button>
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="flex-1 p-6 overflow-x-auto overflow-y-auto">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 min-w-max">
            {columns?.map((column) => (
              <BoardColumn
                key={column.id}
                column={column}
                onTaskClick={handleTaskClick}
              />
            ))}
          </div>

          {/* Drag Overlay - shows task being dragged */}
          <DragOverlay>
            {activeTask ? (
              <div className="rotate-3 opacity-90">
                <TaskCard task={activeTask} onClick={() => {}} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Empty State */}
        {columns?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No columns found</p>
          </div>
        )}
      </main>

      {/* Modals */}
      {columns && members && (
        <CreateTaskModal
          isOpen={isCreateTaskModalOpen}
          onClose={() => setIsCreateTaskModalOpen(false)}
          workspaceId={workspaceIdNum}
          projectId={projectIdNum}
          columns={columns}
          members={members}
        />
      )}

      {selectedTask && members && (
        <TaskDetailModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          members={members}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
}

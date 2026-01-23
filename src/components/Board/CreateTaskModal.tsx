import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import taskService from '../../services/taskService';
import type { BoardColumn, WorkspaceMember, Priority } from '../../types';
import { X, Loader2 } from 'lucide-react';

/**
 * CreateTaskModal Component
 * 
 * EXPLANATION:
 * 1. React Hook Form manages form state with Zod validation
 * 2. useMutation handles the async task creation
 * 3. On success, invalidates queries to refetch fresh data
 * 4. Form fields: title, description, columnId, assignedTo, priority, dueDate
 * 5. Priority defaults to MEDIUM
 * 6. ColumnId defaults to first column (Backlog)
 */

// Zod validation schema
const taskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  columnId: z.number(),
  assignedTo: z.number().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: number;
  projectId: number;
  columns: BoardColumn[];
  members: WorkspaceMember[];
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  workspaceId,
  projectId,
  columns,
  members,
}: CreateTaskModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'MEDIUM',
      columnId: columns[0]?.id,
    },
  });

  // Mutation for creating task
  const createMutation = useMutation({
    mutationFn: (data: TaskFormData) =>
      taskService.createTaskWithWorkspace(workspaceId, projectId, {
        title: data.title,
        description: data.description,
        // columnId removed - backend auto-assigns to Backlog
        assignedToId: data.assignedTo,  // Changed field name to match backend
        priority: data.priority as Priority,
        dueDate: data.dueDate,
      }),
    onSuccess: () => {
      // Refetch tasks
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      // Reset form and close modal
      reset();
      onClose();
    },
    onError: (error: any) => {
      alert(error.response?.data || 'Failed to create task');
    },
  });

  const onSubmit = (data: TaskFormData) => {
    createMutation.mutate({
      ...data,
      dueDate: data.dueDate ? `${data.dueDate}:00` : undefined,
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-6">Create New Task</h2>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Task Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              id="title"
              type="text"
              {...register('title')}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter task title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
              placeholder="Add task details..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Column Selection */}
          <div>
            <label htmlFor="columnId" className="block text-sm font-medium text-gray-300 mb-2">
              Column *
            </label>
            <select
              id="columnId"
              {...register('columnId', { valueAsNumber: true })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
            >
              {columns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.name}
                </option>
              ))}
            </select>
            {errors.columnId && (
              <p className="text-red-500 text-sm mt-1">{errors.columnId.message}</p>
            )}
          </div>

          {/* Assignee Selection */}
          <div>
            <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-300 mb-2">
              Assign To
            </label>
            <select
              id="assignedTo"
              {...register('assignedTo', { 
                setValueAs: (v) => v === '' ? undefined : Number(v) 
              })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.userName} ({member.userEmail})
                </option>
              ))}
            </select>
            {errors.assignedTo && (
              <p className="text-red-500 text-sm mt-1">{errors.assignedTo.message}</p>
            )}
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Priority *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  {...register('priority')}
                  value="LOW"
                  className="mr-2"
                />
                <span className="text-green-500">Low</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  {...register('priority')}
                  value="MEDIUM"
                  className="mr-2"
                />
                <span className="text-yellow-500">Medium</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  {...register('priority')}
                  value="HIGH"
                  className="mr-2"
                />
                <span className="text-red-500">High</span>
              </label>
            </div>
            {errors.priority && (
              <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-300 mb-2">
              Due Date
            </label>
            <input
              id="dueDate"
              type="datetime-local"
              {...register('dueDate')}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
            />
            {errors.dueDate && (
              <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="animate-spin" size={16} />}
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import type { Task, WorkspaceMember } from '../../types';
import { X, Trash2, Calendar, User as UserIcon, Clock } from 'lucide-react';

/**
 * TaskDetailModal Component
 * 
 * EXPLANATION:
 * 1. Displays full task details with editable fields
 * 2. Uses React Hook Form for editing
 * 3. Shows created/updated timestamps
 * 4. Delete button with confirmation dialog
 * 5. Activity/comments section is a placeholder for future implementation
 * 6. onUpdate callback sends updated data to parent
 * 7. onDelete callback removes the task
 */

// Zod validation schema for editing
const editTaskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  assignedTo: z.number().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  dueDate: z.string().optional(),
});

type EditTaskFormData = z.infer<typeof editTaskSchema>;

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  members: WorkspaceMember[];
  onUpdate: (taskId: number, data: EditTaskFormData) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
}

export default function TaskDetailModal({
  isOpen,
  onClose,
  task,
  members,
  onUpdate,
  onDelete,
}: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditTaskFormData>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description || '',
      assignedTo: task.assignedTo,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    },
  });

  // Format timestamp
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Priority badge colors
  const priorityColors = {
    HIGH: 'bg-red-500',
    MEDIUM: 'bg-yellow-500',
    LOW: 'bg-green-500',
  };

  const onSubmit = async (data: EditTaskFormData) => {
    try {
      await onUpdate(task.id, data);
      setIsEditing(false);
    } catch (error) {
      // Error handled by parent
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(task.id);
      onClose();
    } catch (error) {
      setIsDeleting(false);
      alert('Failed to delete task');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {isEditing ? (
                <input
                  {...register('title')}
                  className="text-2xl font-bold text-white bg-gray-700 px-3 py-2 rounded w-full focus:outline-none focus:border-blue-500 border border-gray-600"
                />
              ) : (
                <h2 className="text-2xl font-bold text-white">{task.title}</h2>
              )}
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>
          </div>

          {/* Priority Badge */}
          {!isEditing && (
            <span
              className={`
                ${priorityColors[task.priority]} 
                text-white text-sm px-3 py-1 rounded-full inline-block
              `}
            >
              {task.priority} Priority
            </span>
          )}
        </div>

        {/* Form or View Mode */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            {isEditing ? (
              <>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="Add task details..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </>
            ) : (
              <p className="text-gray-300">
                {task.description || <span className="text-gray-500 italic">No description</span>}
              </p>
            )}
          </div>

          {/* Priority (when editing) */}
          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority
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
            </div>
          )}

          {/* Assignee */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <UserIcon size={16} className="inline mr-1" />
              Assigned To
            </label>
            {isEditing ? (
              <select
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
            ) : (
              <p className="text-gray-300">
                {task.assignedToName || task.assignedTo ? 
                  (task.assignedToName || `User ${task.assignedTo}`) : 
                  <span className="text-gray-500 italic">Unassigned</span>
                }
              </p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar size={16} className="inline mr-1" />
              Due Date
            </label>
            {isEditing ? (
              <input
                type="date"
                {...register('dueDate')}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-300">
                {task.dueDate ? (
                  new Date(task.dueDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                ) : (
                  <span className="text-gray-500 italic">No due date</span>
                )}
              </p>
            )}
          </div>

          {/* Timestamps */}
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center gap-1 text-gray-400 text-sm mb-2">
              <Clock size={14} />
              <span>Created: {formatTimestamp(task.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <Clock size={14} />
              <span>Last updated: {formatTimestamp(task.updatedAt)}</span>
            </div>
          </div>

          {/* Activity Section (Placeholder) */}
          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-white font-semibold mb-3">Activity</h3>
            <div className="text-gray-500 italic text-sm">
              Activity and comments coming soon...
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit Task
                </button>
              </>
            )}
          </div>
        </form>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="bg-gray-700 p-6 rounded-lg max-w-sm">
              <h3 className="text-white font-bold text-lg mb-3">Delete Task?</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete "{task.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

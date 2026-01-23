import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/authContext';
import workspaceService from '../../services/workspaceService';
import { X } from 'lucide-react';

// Validation schema
const workspaceSchema = z.object({
  name: z.string()
    .min(1, 'Workspace name is required')
    .max(255, 'Name must be less than 255 characters'),
  description: z.string().max(500, 'Description too long').optional(),
});

type WorkspaceFormData = z.infer<typeof workspaceSchema>;

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
  });

  // Mutation for creating workspace
  const createMutation = useMutation({
    mutationFn: async (data: WorkspaceFormData) => {
      console.log('[CreateWorkspace] Creating workspace:', data);
      const newWorkspace = await workspaceService.createWorkspace(data);
      console.log('[CreateWorkspace] Workspace created:', newWorkspace);
      
      // WORKAROUND: Backend should auto-add owner as member, but if it doesn't, do it manually
      if (user) {
        try {
          console.log('[CreateWorkspace] Adding owner as workspace member...', {
            workspaceId: newWorkspace.id,
            userId: user.id,
            userEmail: user.email,
          });
          
          await workspaceService.addWorkspaceMember(newWorkspace.id, {
            userId: user.id,
            role: 'ADMIN',
          });
          
          console.log('[CreateWorkspace] ✅ Successfully added owner as member');
        } catch (error: any) {
          // This might fail if backend already added the member
          const status = error?.response?.status;
          if (status === 409 || status === 400) {
            console.log('[CreateWorkspace] Owner already a member (expected if backend auto-adds)');
          } else {
            console.error('[CreateWorkspace] ⚠️ Failed to add owner as member:', error?.response?.data || error.message);
            // Don't fail the whole operation, just warn
          }
        }
      }
      
      return newWorkspace;
    },
    onSuccess: () => {
      // Refetch workspaces list
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      // Close modal and reset form
      reset();
      onClose();
    },
    onError: (error: any) => {
      console.error('[CreateWorkspace] Failed to create workspace:', error);
      alert(error.response?.data || 'Failed to create workspace');
    },
  });

  const onSubmit = (data: WorkspaceFormData) => {
    createMutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-6">
          Create Workspace
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Workspace Name *
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g., Marketing Team"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description (optional)
            </label>
            <textarea
              id="description"
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
              placeholder="What is this workspace for?"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
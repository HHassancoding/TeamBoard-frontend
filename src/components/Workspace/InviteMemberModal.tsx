import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import workspaceService from '../../services/workspaceService';
import { X } from 'lucide-react';

// Validation schema
const inviteSchema = z.object({
  userId: z
    .string()
    .min(1, 'User ID is required')
    .regex(/^\d+$/, 'Must be a valid numeric user ID'),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
});


type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: number;
}

export default function InviteMemberModal({ 
  isOpen, 
  onClose, 
  workspaceId 
}: InviteMemberModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      role: 'MEMBER',
    },
  });

  // Mutation for inviting member
  const inviteMutation = useMutation({
    mutationFn: (data: { userId: number; role: 'ADMIN' | 'MEMBER' | 'VIEWER' }) => 
      workspaceService.addWorkspaceMember(workspaceId, data),
    onSuccess: () => {
      // Refetch workspace members
      queryClient.invalidateQueries({ 
        queryKey: ['workspace-members', workspaceId] 
      });
      // Close modal and reset form
      reset();
      onClose();
    },
    onError: (error: any) => {
      const message = error.response?.data || 'Failed to invite member';
      alert(message);
    },
  });

  const onSubmit = (data: InviteFormData) => {
    inviteMutation.mutate({
      userId: Number(data.userId),
      role: data.role,
    });
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
          Invite Member
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* User ID Field */}
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-300 mb-2">
              User ID *
            </label>
            <input
              id="userId"
              type="text"
              {...register('userId')}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g., 2"
            />
            {errors.userId && (
              <p className="text-red-500 text-sm mt-1">{errors.userId.message}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Enter the numeric ID of the user you want to invite
            </p>
          </div>

          {/* Role Field */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
              Role *
            </label>
            <select
              id="role"
              {...register('role')}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
            >
              <option value="MEMBER">Member - Can create and edit</option>
              <option value="ADMIN">Admin - Full access</option>
              <option value="VIEWER">Viewer - Read only</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
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
              {isSubmitting ? 'Inviting...' : 'Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
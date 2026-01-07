import type { Workspace } from '../../types';
import { Users, FolderKanban } from 'lucide-react';

interface WorkspaceCardProps {
  workspace: Workspace;
  onClick: () => void;
}

export default function WorkspaceCard({ workspace, onClick }: WorkspaceCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors cursor-pointer border border-gray-700 hover:border-blue-500"
    >
      {/* Workspace Name */}
      <h3 className="text-xl font-semibold text-white mb-2">
        {workspace.name}
      </h3>

      {/* Description */}
      {workspace.description && (
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {workspace.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-gray-400 text-sm">
        <div className="flex items-center gap-1">
          <Users size={16} />
          <span>0 members</span>
        </div>
        <div className="flex items-center gap-1">
          <FolderKanban size={16} />
          <span>0 projects</span>
        </div>
      </div>

      {/* Owner Badge */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <span className="text-xs text-gray-500">
          Owner: {workspace.ownerName}
        </span>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import workspaceService from '../services/workspaceService';
import projectService from '../services/projectService';
import ProjectCard from '../components/Project/ProjectCard';
import CreateProjectModal from '../components/Project/CreateProjectModal';
import InviteMemberModal from '../components/Workspace/InviteMemberModal';
import { ArrowLeft, Plus, UserPlus, Users, Loader2 } from 'lucide-react';

export default function WorkspacePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isInviteMemberModalOpen, setIsInviteMemberModalOpen] = useState(false);

  const workspaceIdNum = Number(workspaceId);

  // Fetch workspace details
  const {
    data: workspace,
    isLoading: workspaceLoading,
    error: workspaceError,
  } = useQuery({
    queryKey: ['workspace', workspaceIdNum],
    queryFn: () => workspaceService.getWorkspace(workspaceIdNum),
    enabled: !!workspaceId,
  });

  // Fetch projects in this workspace
  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useQuery({
    queryKey: ['projects', workspaceIdNum],
    queryFn: () => projectService.getProjects(workspaceIdNum),
    enabled: !!workspaceId,
  });

  // Fetch workspace members
  const {
    data: members,
    isLoading: membersLoading,
  } = useQuery({
    queryKey: ['workspace-members', workspaceIdNum],
    queryFn: () => workspaceService.getWorkspaceMembers(workspaceIdNum),
    enabled: !!workspaceId,
  });

  const handleProjectClick = (projectId: number) => {
    navigate(`/workspace/${workspaceId}/project/${projectId}`);
  };

  if (workspaceLoading || projectsLoading || membersLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (workspaceError || projectsError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">Failed to load workspace</p>
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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          {/* Workspace Info */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{workspace?.name}</h1>
              {workspace?.description && (
                <p className="text-gray-400 mt-2">{workspace.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Users size={16} />
                  <span>{members?.length || 0} members</span>
                </div>
                <span>•</span>
                <span>Owner: {workspace?.ownerName}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsInviteMemberModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
              >
                <UserPlus size={18} />
                Invite Member
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Projects Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Projects</h2>
          <button
            onClick={() => setIsCreateProjectModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            <Plus size={18} />
            Create Project
          </button>
        </div>

        {/* Empty State */}
        {projects && projects.length === 0 && (
          <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-gray-400 mb-4">No projects yet in this workspace.</p>
            <button
              onClick={() => setIsCreateProjectModalOpen(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              Create Your First Project
            </button>
          </div>
        )}

        {/* Projects Grid */}
        {projects && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleProjectClick(project.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        workspaceId={workspaceIdNum}
      />

      <InviteMemberModal
        isOpen={isInviteMemberModalOpen}
        onClose={() => setIsInviteMemberModalOpen(false)}
        workspaceId={workspaceIdNum}
      />
    </div>
  );
}
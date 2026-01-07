import { useState } from 'react';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import workspaceService from '../services/workspaceService';
import WorkspaceCard from '../components/Workspace/WorkspaceCard';
import CreateWorkspaceModal from '../components/Workspace/CreateWorkspaceModal';
import { Plus, LogOut, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout, loading } = useAuth(); // ✅ ADD loading
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // ✅ WAIT FOR AUTH BEFORE QUERY
  const {
    data: workspaces,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['workspaces'],
    queryFn: workspaceService.getWorkspaces,
    enabled: !!user && !loading, // ✅ CRITICAL FIX
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleWorkspaceClick = (workspaceId: number) => {
    navigate(`/workspace/${workspaceId}`);
  };

  // ✅ SESSION LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">TeamBoard</h1>
            <p className="text-gray-400 text-sm">
              Welcome back, {user?.name}!
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">My Workspaces</h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            <Plus size={18} />
            Create Workspace
          </button>
        </div>

        {/* Workspace Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin" size={32} />
          </div>
        )}

        {/* Workspace Error */}
        {isError && (
          <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded p-4 text-red-400">
            Failed to load workspaces. Please try again.
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && workspaces?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">
              You don't have any workspaces yet.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              Create Your First Workspace
            </button>
          </div>
        )}

        {/* Workspace Grid */}
        {!isLoading && !isError && workspaces && workspaces.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace) => (
              <WorkspaceCard
                key={workspace.id}
                workspace={workspace}
                onClick={() => handleWorkspaceClick(workspace.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

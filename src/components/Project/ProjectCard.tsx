import { Project } from '../../types';
import { Calendar, User } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div
      onClick={onClick}
      className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors cursor-pointer border border-gray-700 hover:border-blue-500"
    >
      {/* Project Name */}
      <h3 className="text-xl font-semibold text-white mb-2">
        {project.name}
      </h3>

      {/* Description */}
      {project.description && (
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>
      )}

      {/* Stats/Info */}
      <div className="flex flex-col gap-2 text-gray-400 text-sm">
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span>Created {formatDate(project.createdAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <User size={16} />
          <span>0 tasks</span>
        </div>
      </div>
    </div>
  );
}
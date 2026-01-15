import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types';
import { Calendar, AlertCircle, User } from 'lucide-react';

/**
 * TaskCard Component
 * 
 * EXPLANATION:
 * 1. Uses @dnd-kit/sortable's useSortable hook to make the card draggable
 * 2. The hook returns:
 *    - attributes: accessibility props for dragging
 *    - listeners: mouse/touch event handlers
 *    - setNodeRef: ref to attach to the draggable element
 *    - transform/transition: CSS values for smooth drag animation
 * 3. Priority badges are color-coded (HIGH=red, MEDIUM=yellow, LOW=green)
 * 4. Overdue tasks get a red border (comparing dueDate with today)
 * 5. Click handler opens task detail modal
 */

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  // @dnd-kit sortable hook - makes this card draggable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  // Transform CSS for smooth drag animation
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Check if task is overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  // Priority badge colors
  const priorityColors = {
    HIGH: 'bg-red-500',
    MEDIUM: 'bg-yellow-500',
    LOW: 'bg-green-500',
  };

  // Format due date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    // Check if tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    // Otherwise show formatted date
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className={`
        bg-gray-800 rounded-lg p-3 mb-2 cursor-pointer
        hover:bg-gray-750 transition-colors
        border-2
        ${isOverdue ? 'border-red-500' : 'border-transparent'}
        ${isDragging ? 'shadow-lg' : ''}
      `}
    >
      {/* Task Title */}
      <h4 className="text-white font-medium text-sm mb-2 line-clamp-2">
        {task.title}
      </h4>

      {/* Priority Badge */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`
            ${priorityColors[task.priority]} 
            text-white text-xs px-2 py-0.5 rounded-full
          `}
        >
          {task.priority}
        </span>
        
        {isOverdue && (
          <span className="flex items-center gap-1 text-red-400 text-xs">
            <AlertCircle size={12} />
            Overdue
          </span>
        )}
      </div>

      {/* Footer: Assignee and Due Date */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        {/* Assignee Avatar */}
        {task.assignedTo && (
          <div className="flex items-center gap-1">
            <User size={12} />
            <span className="truncate max-w-[100px]">
              {task.assignedToName || `User ${task.assignedTo}`}
            </span>
          </div>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span className={isOverdue ? 'text-red-400' : ''}>
              {formatDate(task.dueDate)}
            </span>
          </div>
        )}
      </div>

      {/* Description Preview (if exists) */}
      {task.description && (
        <p className="text-gray-500 text-xs mt-2 line-clamp-2">
          {task.description}
        </p>
      )}
    </div>
  );
}

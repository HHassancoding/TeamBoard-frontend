import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { BoardColumn, Task } from '../../types';
import TaskCard from './TaskCard';

/**
 * BoardColumn Component
 * 
 * EXPLANATION:
 * 1. Uses @dnd-kit/core's useDroppable hook to make this a drop zone
 * 2. Uses @dnd-kit/sortable's SortableContext to manage sortable tasks within column
 * 3. verticalListSortingStrategy tells dnd-kit tasks are stacked vertically
 * 4. setNodeRef connects the droppable area
 * 5. isOver indicates when a dragged item is hovering over this column
 * 6. Each TaskCard is rendered as a sortable item
 */

interface BoardColumnProps {
  column: BoardColumn;
  onTaskClick: (task: Task) => void;
}

export default function BoardColumn({ column, onTaskClick }: BoardColumnProps) {
  // Make this column a droppable zone
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  // Column color schemes
  const columnStyles = {
    BACKLOG: 'border-gray-600',
    TO_DO: 'border-blue-600',
    IN_PROGRESS: 'border-yellow-600',
    DONE: 'border-green-600',
  };

  const tasks = column.tasks || [];
  const taskIds = tasks.map((task) => task.id);

  return (
    <div
      className={`
        bg-gray-900 rounded-lg p-4 
        min-w-[280px] max-w-[320px] flex-shrink-0
        border-t-4 ${columnStyles[column.columnType]}
        ${isOver ? 'ring-2 ring-blue-500 bg-gray-850' : ''}
      `}
    >
      {/* Column Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-lg">
            {column.name}
          </h3>
          <span className="text-gray-400 text-sm bg-gray-800 px-2 py-1 rounded">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Task List - Droppable & Sortable */}
      <div
        ref={setNodeRef}
        className="space-y-2 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto"
      >
        {/* SortableContext manages the sortable items */}
        <SortableContext
          items={taskIds}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <div className="text-gray-500 text-sm text-center py-8">
              No tasks yet
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onClick={onTaskClick} 
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Plus, MoreHorizontal, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'doing' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
}

const SortableTask = ({ task, onDelete, onChangePriority }: { task: Task; onDelete?: (id: string) => void; onChangePriority?: (id: string, priority: Task['priority']) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    low: 'bg-muted text-black',
    medium: 'bg-accent/20 text-black',
    high: 'bg-destructive/20 text-black',
    urgent: 'bg-destructive/40 text-black',
  } as const;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-soft ${
        isDragging ? 'opacity-50 rotate-1 scale-105' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-black">{task.title}</h4>
        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              aria-label="Delete task"
              className="text-black hover:text-destructive transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDelete(task.id);
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <MoreHorizontal className="w-4 h-4 text-black" />
        </div>
      </div>
      {task.description && (
        <p className="text-sm text-black mb-3">{task.description}</p>
      )}
      <div className="flex items-center justify-between">
        {onChangePriority ? (
          <Select
            value={task.priority}
            onValueChange={(val) => onChangePriority(task.id, val as Task['priority'])}
          >
            <SelectTrigger
              className={`w-[120px] h-7 ${priorityColors[task.priority]} border-0`}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent onPointerDown={(e) => e.stopPropagation()}>
              <SelectItem className='text-black' value="low">Low</SelectItem>
              <SelectItem className='text-black' value="medium">Medium</SelectItem>
              <SelectItem className='text-black' value="high">High</SelectItem>
              <SelectItem className='text-black' value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Badge className={priorityColors[task.priority]} variant="secondary">
            {task.priority}
          </Badge>
        )}
        <span className="text-xs text-black">
          {task.createdAt.toLocaleDateString()}
        </span>
      </div>
    </Card>
  );
};

const TodosSection = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;

    const overId = over.id as string;
    let newStatus: 'todo' | 'doing' | 'done';

    // Check if dropped on a column
    if (overId.endsWith('-column')) {
      newStatus = overId.replace('-column', '') as 'todo' | 'doing' | 'done';
    } else {
      // Check if dropped on another task
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
      } else {
        return; // Invalid drop target
      }
    }

    // Update task status if it changed
    if (activeTask.status !== newStatus) {
      // optimistic update
      setTasks(prev => prev.map(task => task.id === active.id ? { ...task, status: newStatus } : task));
      // persist to backend
      fetch(`/api/todos/${active.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus.toUpperCase() }),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to update');
        return res.json();
      }).then(updated => {
        // ensure createdAt remains Date
        setTasks(prev => prev.map(t => t.id === updated.id ? {
          id: updated.id,
          title: updated.title,
          description: updated.description ?? undefined,
          status: (String(updated.status).toLowerCase() as 'todo'|'doing'|'done'),
          priority: (String(updated.priority).toLowerCase() as 'low'|'medium'|'high'),
          createdAt: new Date(updated.createdAt),
        } : t));
      }).catch(() => {
        // rollback on error
        setTasks(prev => prev.map(task => task.id === active.id ? { ...task, status: activeTask.status } : task));
      });
    }
  };

  const createTask = async () => {
    if (!newTask.title.trim()) return;
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description || undefined,
          status: 'TODO',
          priority: 'MEDIUM',
          completed: false,
        }),
      });
      if (!response.ok) throw new Error('Failed to create');
      const created = await response.json();
      const task: Task = {
        id: created.id,
        title: created.title,
        description: created.description ?? undefined,
        status: (String(created.status).toLowerCase() as 'todo'|'doing'|'done'),
        priority: (String(created.priority).toLowerCase() as 'low'|'medium'|'high'),
        createdAt: new Date(created.createdAt),
      };
      setTasks(prev => [task, ...prev]);
      setNewTask({ title: '', description: '' });
      setIsCreating(false);
    } catch (error) {
      // noop
    }
  };

  const getTasksByStatus = (status: 'todo' | 'doing' | 'done') => {
    return tasks.filter(task => task.status === status);
  };

  const deleteTask = async (id: string) => {
    const prev = tasks;
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
    } catch (e) {
      // rollback
      setTasks(prev);
    }
  };

  const changePriority = async (id: string, priority: Task['priority']) => {
    const previous = tasks;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, priority } : t));
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: priority.toUpperCase() }),
      });
      if (!res.ok) throw new Error('Failed to update');
      const updated = await res.json();
      setTasks(prev => prev.map(t => t.id === updated.id ? {
        ...t,
        priority: (String(updated.priority).toLowerCase() as Task['priority']),
      } : t));
    } catch (e) {
      setTasks(previous);
    }
  };

  const DroppableColumn = ({ 
    status, 
    title, 
    tasks, 
    className 
  }: { 
    status: string;
    title: string;
    tasks: Task[];
    className: string;
  }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: `${status}-column`,
    });

    return (
      <div className={`flex-1 min-h-0 ${className}`}>
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-black">{title}</h3>
            <Badge variant="secondary" className="text-xs text-black">
              {tasks.length}
            </Badge>
          </div>
        </div>
        
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div
            ref={setNodeRef}
            className={`space-y-3 min-h-96 p-4 rounded-xl border-2 border-dashed transition-all duration-200 ${
              isOver 
                ? 'bg-primary/10 border-primary/50 shadow-lg' 
                : 'bg-muted/30 border-border/50'
            }`}
          >
            {tasks.map(task => (
              <SortableTask key={task.id} task={task} onDelete={deleteTask} onChangePriority={changePriority} />
            ))}
          </div>
        </SortableContext>
      </div>
    );
  };

  // Fetch todos on mount
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/todos');
        if (!response.ok) return; // likely unauthorized
        const data = await response.json();
        const mapped: Task[] = (data as any[]).map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description ?? undefined,
          status: (String(t.status).toLowerCase() as 'todo'|'doing'|'done'),
          priority: (String(t.priority).toLowerCase() as 'low'|'medium'|'high'),
          createdAt: new Date(t.createdAt),
        }));
        setTasks(mapped);
      } catch (e) {
      } finally {
        setIsLoading(false);
      }
    };
    fetchTodos();
  }, []);

  return (
    <div className="h-full p-6 rounded-xl  bg-white shadow-lg">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-black mb-2">Todos</h2>
            <p className="text-black">Organize your tasks with drag & drop</p>
          </div>
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-gradient-to-r from-primary to-primary-glow hover:scale-105 transition-transform duration-200 text-black"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>

        {isLoading && (
          <div className="mt-4 text-sm text-black">Loading...</div>
        )}

        {isCreating && (
          <Card className="mt-4 p-4 bg-card/80 backdrop-blur-sm">
            <div className="space-y-3">
              <Input
                placeholder="Task title..."
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) createTask();
                  if (e.key === 'Escape') setIsCreating(false);
                }}
                autoFocus
              />
              <Input
                placeholder="Description (optional)..."
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
              <div className="flex gap-2">
                <Button onClick={createTask} size="sm" className="text-black">
                  Create
                </Button>
                <Button variant="ghost" onClick={() => setIsCreating(false)} size="sm" className="text-black">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 h-full">
          <DroppableColumn
            status="todo"
            title="Todo"
            tasks={getTasksByStatus('todo')}
            className="text-black"
          />
          <DroppableColumn
            status="doing"
            title="Doing"
            tasks={getTasksByStatus('doing')}
            className="text-black"
          />
          <DroppableColumn
            status="done"
            title="Done"
            tasks={getTasksByStatus('done')}
            className="text-black"
          />
        </div>

        <DragOverlay>
          {activeTask ? <SortableTask task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default TodosSection;
import { useState } from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';
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
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

const SortableTask = ({ task }: { task: Task }) => {
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
    low: 'bg-muted text-muted-foreground',
    medium: 'bg-accent/20 text-accent-foreground',
    high: 'bg-destructive/20 text-destructive-foreground',
  };

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
        <h4 className="font-medium text-foreground">{task.title}</h4>
        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
      </div>
      {task.description && (
        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
      )}
      <div className="flex items-center justify-between">
        <Badge className={priorityColors[task.priority]} variant="secondary">
          {task.priority}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {task.createdAt.toLocaleDateString()}
        </span>
      </div>
    </Card>
  );
};

const TodosSection = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Welcome to Earth Todos',
      description: 'Organize your tasks with this beautiful kanban board',
      status: 'todo',
      priority: 'medium',
      createdAt: new Date(),
    },
  ]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

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
      setTasks(prev => 
        prev.map(task => 
          task.id === active.id 
            ? { ...task, status: newStatus }
            : task
        )
      );
    }
  };

  const createTask = () => {
    if (newTask.title.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.title,
        description: newTask.description || undefined,
        status: 'todo',
        priority: 'medium',
        createdAt: new Date(),
      };
      setTasks([...tasks, task]);
      setNewTask({ title: '', description: '' });
      setIsCreating(false);
    }
  };

  const getTasksByStatus = (status: 'todo' | 'doing' | 'done') => {
    return tasks.filter(task => task.status === status);
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
            <h3 className="font-semibold text-foreground">{title}</h3>
            <Badge variant="secondary" className="text-xs">
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
              <SortableTask key={task.id} task={task} />
            ))}
          </div>
        </SortableContext>
      </div>
    );
  };

  return (
    <div className="h-full p-6 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Todos</h2>
            <p className="text-muted-foreground">Organize your tasks with drag & drop</p>
          </div>
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-gradient-to-r from-primary to-primary-glow hover:scale-105 transition-transform duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>

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
                <Button onClick={createTask} size="sm">
                  Create
                </Button>
                <Button variant="ghost" onClick={() => setIsCreating(false)} size="sm">
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
            className="text-foreground"
          />
          <DroppableColumn
            status="doing"
            title="Doing"
            tasks={getTasksByStatus('doing')}
            className="text-accent-foreground"
          />
          <DroppableColumn
            status="done"
            title="Done"
            tasks={getTasksByStatus('done')}
            className="text-primary"
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
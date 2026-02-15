import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, GripVertical, Calendar, User, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  assigned_to: string | null;
  created_at: string;
}

const COLUMNS = ["To Do", "In Progress", "Done"] as const;

const PRIORITY_COLORS: Record<string, string> = {
  High: "border-l-red-500",
  Medium: "border-l-amber-500",
  Low: "border-l-green-500",
};

const PRIORITY_BADGE: Record<string, string> = {
  High: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  Medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  Low: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
};

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[200px] space-y-2 transition-colors rounded-lg p-2 ${
        isOver ? "bg-primary/10" : ""
      }`}
    >
      {children}
    </div>
  );
}

function SortableTaskCard({
  task,
  onClick,
}: {
  task: Task;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div
        className={`p-3 rounded-lg border-l-4 ${PRIORITY_COLORS[task.priority]} bg-card border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer group`}
        onClick={onClick}
      >
        <div className="flex items-start gap-2">
          <button {...listeners} className="mt-0.5 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm leading-snug">{task.title}</p>
            {task.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${PRIORITY_BADGE[task.priority]}`}>
                {task.priority}
              </span>
              {task.due_date && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Calendar className="h-3 w-3" />
                  {new Date(task.due_date).toLocaleDateString()}
                </span>
              )}
              {task.assigned_to && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <User className="h-3 w-3" />
                  {task.assigned_to}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskOverlay({ task }: { task: Task }) {
  return (
    <div className={`p-3 rounded-lg border-l-4 ${PRIORITY_COLORS[task.priority]} bg-card border border-border shadow-lg rotate-2 w-72`}>
      <p className="font-medium text-sm">{task.title}</p>
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${PRIORITY_BADGE[task.priority]}`}>
        {task.priority}
      </span>
    </div>
  );
}

export default function KanbanBoard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState({ description: "", due_date: "", assigned_to: "", priority: "Medium" });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    } else {
      setTasks((data as Task[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async () => {
    if (!newTitle.trim() || !user) return;

    const { error } = await supabase.from("tasks").insert({
      title: newTitle.trim(),
      priority: newPriority,
      status: "To Do",
      user_id: user.id,
    });

    if (error) {
      toast.error("Failed to add task");
    } else {
      setNewTitle("");
      setNewPriority("Medium");
      fetchTasks();
      toast.success("Task added");
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", taskId);

    if (error) {
      toast.error("Failed to update task");
      fetchTasks();
    }
  };

  const updateTaskDetails = async () => {
    if (!selectedTask) return;

    const { error } = await supabase
      .from("tasks")
      .update({
        description: editForm.description || null,
        due_date: editForm.due_date || null,
        assigned_to: editForm.assigned_to || null,
        priority: editForm.priority,
      })
      .eq("id", selectedTask.id);

    if (error) {
      toast.error("Failed to update task");
    } else {
      toast.success("Task updated");
      setSelectedTask(null);
      fetchTasks();
    }
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) {
      toast.error("Failed to delete task");
    } else {
      toast.success("Task deleted");
      setSelectedTask(null);
      fetchTasks();
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    if (COLUMNS.includes(overId as any)) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== overId) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: overId } : t)));
        updateTaskStatus(taskId, overId);
      }
    } else {
      // Dropped on another task — move to that task's column
      const overTask = tasks.find((t) => t.id === overId);
      const draggedTask = tasks.find((t) => t.id === taskId);
      if (overTask && draggedTask && draggedTask.status !== overTask.status) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: overTask.status } : t)));
        updateTaskStatus(taskId, overTask.status);
      }
    }
  };

  const openTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setEditForm({
      description: task.description || "",
      due_date: task.due_date || "",
      assigned_to: task.assigned_to || "",
      priority: task.priority,
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Task Form */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Task title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              className="flex-1"
            />
            <Select value={newPriority} onValueChange={setNewPriority}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addTask} disabled={!newTitle.trim()}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Columns */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col);
            return (
              <Card key={col} className="bg-muted/30">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    {col}
                    <Badge variant="secondary" className="text-xs">
                      {columnTasks.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-2 pb-4">
                  <DroppableColumn id={col}>
                    <SortableContext items={columnTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                      {columnTasks.map((task) => (
                        <SortableTaskCard key={task.id} task={task} onClick={() => openTaskDetail(task)} />
                      ))}
                    </SortableContext>
                    {columnTasks.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-8">
                        Drop tasks here
                      </p>
                    )}
                  </DroppableColumn>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? <TaskOverlay task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Task Detail Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Add a description..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <Select value={editForm.priority} onValueChange={(v) => setEditForm({ ...editForm, priority: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={editForm.due_date}
                  onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Assigned To</Label>
              <Input
                value={editForm.assigned_to}
                onChange={(e) => setEditForm({ ...editForm, assigned_to: e.target.value })}
                placeholder="Name or initials..."
              />
            </div>
            <div className="flex justify-between">
              <Button variant="destructive" size="sm" onClick={() => selectedTask && deleteTask(selectedTask.id)}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
              <Button onClick={updateTaskDetails}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

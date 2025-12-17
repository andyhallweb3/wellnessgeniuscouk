import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  source_name: string;
  category: string;
}

interface SortableItemProps {
  article: Article;
  onRemove: (id: string) => void;
}

function SortableItem({ article, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: article.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-3 py-2 bg-accent/20 border border-accent/30 rounded-lg group ${
        isDragging ? 'opacity-50 shadow-lg z-50' : ''
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
      >
        <GripVertical size={16} />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-accent truncate">{article.title}</p>
        <p className="text-xs text-muted-foreground">{article.source_name} • {article.category}</p>
      </div>
      <button
        onClick={() => onRemove(article.id)}
        className="text-muted-foreground hover:text-foreground"
      >
        <X size={14} />
      </button>
    </div>
  );
}

interface SortableArticleListProps {
  articles: Article[];
  onReorder: (articles: Article[]) => void;
  onRemove: (id: string) => void;
}

export function SortableArticleList({ articles, onReorder, onRemove }: SortableArticleListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = articles.findIndex((a) => a.id === active.id);
      const newIndex = articles.findIndex((a) => a.id === over.id);
      onReorder(arrayMove(articles, oldIndex, newIndex));
    }
  }

  if (articles.length === 0) return null;

  return (
    <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
      <p className="text-sm font-medium text-accent mb-3">
        Selected Articles ({articles.length}) - Drag to reorder:
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={articles.map(a => a.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {articles.map((article) => (
              <SortableItem
                key={article.id}
                article={article}
                onRemove={onRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

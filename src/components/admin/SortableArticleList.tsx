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
import { GripVertical, X, Crown } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  source_name: string;
  category: string;
}

interface SortableItemProps {
  article: Article;
  index: number;
  onRemove: (id: string) => void;
  onMakeEditorsChoice: (id: string) => void;
}

function SortableItem({ article, index, onRemove, onMakeEditorsChoice }: SortableItemProps) {
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

  const isEditorsChoice = index === 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg group ${
        isDragging ? 'opacity-50 shadow-lg z-50' : ''
      } ${isEditorsChoice 
        ? 'bg-yellow-500/20 border-2 border-yellow-500/50' 
        : 'bg-accent/20 border border-accent/30'
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none p-1"
      >
        <GripVertical size={16} />
      </div>
      
      {isEditorsChoice && (
        <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/30 text-yellow-600 dark:text-yellow-400 rounded text-xs font-semibold">
          <Crown size={12} />
          Editor's Choice
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isEditorsChoice ? 'text-yellow-600 dark:text-yellow-400' : 'text-accent'}`}>
          {article.title}
        </p>
        <p className="text-xs text-muted-foreground">{article.source_name} • {article.category}</p>
      </div>
      
      {!isEditorsChoice && (
        <button
          onClick={() => onMakeEditorsChoice(article.id)}
          className="text-muted-foreground hover:text-yellow-500 p-1"
          title="Make Editor's Choice"
        >
          <Crown size={14} />
        </button>
      )}
      
      <button
        onClick={() => onRemove(article.id)}
        className="text-muted-foreground hover:text-destructive p-1"
        title="Remove"
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
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
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

  function handleMakeEditorsChoice(id: string) {
    const index = articles.findIndex((a) => a.id === id);
    if (index > 0) {
      onReorder(arrayMove(articles, index, 0));
    }
  }

  if (articles.length === 0) return null;

  return (
    <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
      <p className="text-sm font-medium text-accent mb-3">
        Selected Articles ({articles.length}) — First article is Editor's Choice:
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={articles.map(a => a.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {articles.map((article, index) => (
              <SortableItem
                key={article.id}
                article={article}
                index={index}
                onRemove={onRemove}
                onMakeEditorsChoice={handleMakeEditorsChoice}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

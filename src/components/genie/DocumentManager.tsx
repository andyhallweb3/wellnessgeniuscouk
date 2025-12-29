import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Trash2, 
  Upload, 
  Loader2,
  FolderOpen,
  Check,
  X,
  Pencil,
  FileSpreadsheet,
  File
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CoachDocument } from "@/hooks/useCoachDocuments";

interface DocumentManagerProps {
  documents: CoachDocument[];
  loading: boolean;
  uploading: boolean;
  onUpload: (file: File) => Promise<boolean>;
  onDelete: (id: string, storagePath: string) => Promise<boolean>;
  onUpdateCategory: (id: string, category: string) => Promise<boolean>;
  onUpdateDescription: (id: string, description: string) => Promise<boolean>;
}

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "financials", label: "Financials" },
  { value: "operations", label: "Operations" },
  { value: "marketing", label: "Marketing" },
  { value: "strategy", label: "Strategy" },
  { value: "hr", label: "HR & People" },
  { value: "legal", label: "Legal" },
];

const getFileIcon = (fileType: string) => {
  if (fileType.includes("spreadsheet") || fileType.includes("excel") || fileType.includes("csv")) {
    return <FileSpreadsheet size={16} className="text-green-500" />;
  }
  if (fileType.includes("pdf")) {
    return <FileText size={16} className="text-red-500" />;
  }
  if (fileType.includes("word") || fileType.includes("document")) {
    return <FileText size={16} className="text-blue-500" />;
  }
  return <File size={16} className="text-muted-foreground" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const DocumentManager = ({
  documents,
  loading,
  uploading,
  onUpload,
  onDelete,
  onUpdateCategory,
  onUpdateDescription,
}: DocumentManagerProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await onUpload(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onUpload(file);
      e.target.value = "";
    }
  };

  const startEditing = (doc: CoachDocument) => {
    setEditingId(doc.id);
    setEditDescription(doc.description || "");
  };

  const saveDescription = async (id: string) => {
    await onUpdateDescription(id, editDescription);
    setEditingId(null);
    setEditDescription("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditDescription("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragging 
            ? "border-accent bg-accent/10" 
            : "border-border hover:border-accent/50"
        )}
      >
        <input
          type="file"
          id="doc-upload"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-accent" size={24} />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </div>
        ) : (
          <label htmlFor="doc-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-accent/10">
                <Upload size={20} className="text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {isDragging ? "Drop file here" : "Drag & drop or click to upload"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, Word, Excel, CSV (max 10MB)
                </p>
              </div>
            </div>
          </label>
        )}
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FolderOpen size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No documents uploaded yet</p>
          <p className="text-xs mt-1">Upload business documents to personalise AI responses</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {documents.length} document{documents.length !== 1 ? 's' : ''} • 
            {documents.filter(d => d.extracted_text).length} processed
          </p>
          
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="border border-border rounded-lg p-3 bg-card hover:bg-secondary/20 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* File Icon */}
                <div className="p-2 rounded bg-secondary shrink-0">
                  {getFileIcon(doc.file_type)}
                </div>
                
                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{doc.file_name}</p>
                    {doc.extracted_text ? (
                      <span className="text-[10px] text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded shrink-0">
                        Ready
                      </span>
                    ) : (
                      <span className="text-[10px] text-yellow-600 bg-yellow-500/10 px-1.5 py-0.5 rounded shrink-0">
                        Processing
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{formatFileSize(doc.file_size)}</span>
                    <span>•</span>
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  {/* Description */}
                  {editingId === doc.id ? (
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Add description..."
                        className="h-7 text-xs"
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => saveDescription(doc.id)}
                      >
                        <Check size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={cancelEditing}
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 mt-1">
                      {doc.description ? (
                        <p className="text-xs text-muted-foreground italic truncate">
                          "{doc.description}"
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground/50">
                          No description
                        </p>
                      )}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 shrink-0"
                              onClick={() => startEditing(doc)}
                            >
                              <Pencil size={10} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit description</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Category Selector */}
                  <Select
                    value={doc.category}
                    onValueChange={(value) => onUpdateCategory(doc.id, value)}
                  >
                    <SelectTrigger className="h-7 text-xs w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value} className="text-xs">
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Delete */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                        <Trash2 size={14} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete document?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{doc.file_name}" and remove it from AI context.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(doc.id, doc.storage_path)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentManager;
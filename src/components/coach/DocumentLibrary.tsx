import { useState, useRef } from "react";
import { 
  Upload, 
  FileText, 
  Trash2, 
  Loader2,
  File,
  Image,
  Table,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCoachDocuments, CoachDocument } from "@/hooks/useCoachDocuments";
import { formatDistanceToNow } from "date-fns";

const getFileIcon = (fileType: string) => {
  if (fileType.includes("image")) return <Image size={16} className="text-blue-500" />;
  if (fileType.includes("spreadsheet") || fileType.includes("excel") || fileType === "text/csv") {
    return <FileSpreadsheet size={16} className="text-green-500" />;
  }
  if (fileType.includes("pdf")) return <FileText size={16} className="text-red-500" />;
  return <File size={16} className="text-muted-foreground" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const DocumentLibrary = () => {
  const { documents, loading, uploading, uploadDocument, deleteDocument } = useCoachDocuments();
  const [description, setDescription] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadDocument(file, description);
    setDescription("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (doc: CoachDocument) => {
    setDeletingId(doc.id);
    await deleteDocument(doc.id, doc.storage_path);
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4">
      {/* Upload Section */}
      <div className="mb-4 p-4 border border-dashed border-border rounded-xl bg-secondary/30">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.txt,.csv,.xls,.xlsx,.doc,.docx,.jpg,.jpeg,.png,.webp"
          className="hidden"
        />
        
        <div className="text-center">
          <Upload size={24} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">Upload business documents</p>
          <p className="text-xs text-muted-foreground mb-3">
            PDFs, spreadsheets, images, and more
          </p>
          
          <Input
            placeholder="Optional description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mb-2 text-sm"
          />
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={14} />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={14} className="mr-2" />
                Choose File
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Documents List */}
      <div className="flex-1 overflow-y-auto">
        {documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No documents yet</p>
            <p className="text-xs">Upload files to give your coach more context</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors"
              >
                <div className="shrink-0">
                  {getFileIcon(doc.file_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(doc.file_size)} • {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                  </p>
                  {doc.description && (
                    <p className="text-xs text-accent mt-1 truncate">{doc.description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(doc)}
                  disabled={deletingId === doc.id}
                >
                  {deletingId === doc.id ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-center text-muted-foreground mt-4">
        Documents are used to personalize coach responses
      </p>
    </div>
  );
};

export default DocumentLibrary;

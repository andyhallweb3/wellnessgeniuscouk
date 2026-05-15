import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Brain,
  StickyNote,
  FileUp,
  Loader2,
  Trash2,
  Plus,
  CheckCircle2,
  FileText,
  FileSpreadsheet,
  File,
  BarChart3,
  Info,
} from "lucide-react";
import { useBusinessNotes, NOTE_CATEGORIES, NoteCategory } from "@/hooks/useBusinessNotes";
import { useCoachDocuments } from "@/hooks/useCoachDocuments";
import { useWorkspace } from "@/hooks/useWorkspace";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

// ─── KPI definitions ─────────────────────────────────────────────────────────

const KPI_FIELDS = [
  { key: "total_members", label: "Total members", placeholder: "e.g. 450", unit: "" },
  { key: "monthly_revenue", label: "Monthly revenue", placeholder: "e.g. 28000", unit: "£" },
  { key: "retention_rate", label: "Retention rate", placeholder: "e.g. 78", unit: "%" },
  { key: "churn_rate", label: "Monthly churn", placeholder: "e.g. 4.2", unit: "%" },
  { key: "avg_member_ltv", label: "Avg member LTV", placeholder: "e.g. 840", unit: "£" },
  { key: "class_fill_rate", label: "Class fill rate", placeholder: "e.g. 65", unit: "%" },
  { key: "staff_headcount", label: "Staff headcount", placeholder: "e.g. 12", unit: "" },
  { key: "nps_score", label: "NPS score", placeholder: "e.g. 42", unit: "" },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getFileIcon = (fileType: string) => {
  if (fileType.includes("spreadsheet") || fileType.includes("excel") || fileType.includes("csv"))
    return <FileSpreadsheet size={14} className="text-green-500" />;
  if (fileType.includes("pdf"))
    return <FileText size={14} className="text-red-500" />;
  if (fileType.includes("word") || fileType.includes("document"))
    return <FileText size={14} className="text-blue-500" />;
  return <File size={14} className="text-muted-foreground" />;
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const categoryColor: Record<string, string> = {
  general: "bg-secondary text-secondary-foreground",
  market: "bg-blue-500/10 text-blue-500",
  competitor: "bg-orange-500/10 text-orange-500",
  operations: "bg-purple-500/10 text-purple-500",
  finance: "bg-green-500/10 text-green-500",
  people: "bg-rose-500/10 text-rose-500",
};

// ─── Sub-sections ─────────────────────────────────────────────────────────────

function MetricsPanel() {
  const { metrics, saveMetrics, isLoading } = useWorkspace();
  const [values, setValues] = useState<Record<string, string>>(() => {
    const current = (metrics?.current_values as Record<string, string>) || {};
    return Object.fromEntries(KPI_FIELDS.map(f => [f.key, String(current[f.key] ?? "")]));
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const filtered = Object.fromEntries(
      Object.entries(values).filter(([, v]) => v.trim() !== "")
    );
    const ok = await saveMetrics({ current_values: filtered });
    setSaving(false);
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); toast.success("Metrics saved — Genie will use these in every session"); }
  };

  if (isLoading) return <div className="flex items-center gap-2 text-muted-foreground text-sm"><Loader2 size={14} className="animate-spin" />Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/5 border border-accent/20 text-sm text-muted-foreground">
        <Info size={14} className="text-accent mt-0.5 shrink-0" />
        Genie uses these numbers in every session. Leave fields blank if you don't have the data yet.
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {KPI_FIELDS.map(field => (
          <div key={field.key} className="space-y-1">
            <Label className="text-xs text-muted-foreground">{field.label}</Label>
            <div className="relative">
              {field.unit && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{field.unit}</span>
              )}
              <Input
                value={values[field.key]}
                onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className={cn("h-9 text-sm", field.unit ? "pl-7" : "")}
                type="number"
                min={0}
              />
            </div>
          </div>
        ))}
      </div>
      <Button size="sm" onClick={handleSave} disabled={saving} className="mt-2">
        {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle2 size={14} className="text-accent" /> : null}
        {saved ? "Saved" : "Save metrics"}
      </Button>
    </div>
  );
}

function NotesPanel() {
  const { notes, loading, saving, addNote, deleteNote } = useBusinessNotes();
  const [draft, setDraft] = useState("");
  const [category, setCategory] = useState<NoteCategory>("general");

  const handleAdd = async () => {
    if (!draft.trim()) return;
    const ok = await addNote(draft, category);
    if (ok) { setDraft(""); toast.success("Note saved — Genie will use it in future sessions"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/5 border border-accent/20 text-sm text-muted-foreground">
        <Info size={14} className="text-accent mt-0.5 shrink-0" />
        Quick observations Genie should know — market shifts, staff issues, competitor moves, anything relevant. The 8 most recent notes are injected into every session.
      </div>

      {/* Input */}
      <div className="space-y-2">
        <Textarea
          value={draft}
          onChange={e => setDraft(e.target.value.slice(0, 500))}
          placeholder="e.g. A new boutique studio opened 200m away last week. They're pricing at £80/month vs our £65."
          className="text-sm min-h-[90px] resize-none"
        />
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Select value={category} onValueChange={v => setCategory(v as NoteCategory)}>
              <SelectTrigger className="h-8 text-xs w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NOTE_CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">{draft.length}/500</span>
          </div>
          <Button size="sm" onClick={handleAdd} disabled={saving || !draft.trim()}>
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            Add note
          </Button>
        </div>
      </div>

      {/* Saved notes */}
      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm"><Loader2 size={13} className="animate-spin" />Loading…</div>
      ) : notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notes yet.</p>
      ) : (
        <div className="space-y-2">
          {notes.map(note => (
            <div key={note.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", categoryColor[note.category] || categoryColor.general)}>
                    {note.category}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{note.note}</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0">
                    <Trash2 size={13} />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete note?</AlertDialogTitle>
                    <AlertDialogDescription>This will remove the note from Genie's context.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteNote(note.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DocumentsPanel() {
  const { documents, loading, uploading, uploadDocument, deleteDocument } = useCoachDocuments();
  const fileInputRef = useState<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadDocument(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/5 border border-accent/20 text-sm text-muted-foreground">
        <Info size={14} className="text-accent mt-0.5 shrink-0" />
        Upload reports, spreadsheets, or strategy docs. Genie extracts the text and references it in relevant sessions. PDF, Word, Excel, CSV — up to 10 MB.
      </div>

      {/* Upload button */}
      <div>
        <label className="cursor-pointer">
          <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt" />
          <Button size="sm" variant="outline" disabled={uploading} asChild>
            <span>
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <FileUp size={13} />}
              {uploading ? "Uploading…" : "Upload document"}
            </span>
          </Button>
        </label>
      </div>

      {/* Document list */}
      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm"><Loader2 size={13} className="animate-spin" />Loading…</div>
      ) : documents.length === 0 ? (
        <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
      ) : (
        <div className="space-y-2">
          {documents.map(doc => (
            <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
              {getFileIcon(doc.file_type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(doc.file_size)} · {doc.extracted_text ? "Text extracted" : "Processing…"} · {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0">
                    <Trash2 size={13} />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete document?</AlertDialogTitle>
                    <AlertDialogDescription>This will permanently remove the file and its extracted text from Genie's context.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteDocument(doc.id, doc.storage_path)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

type Section = "metrics" | "notes" | "documents";

const SECTIONS: { id: Section; label: string; icon: React.ReactNode; description: string }[] = [
  { id: "metrics", label: "Business Metrics", icon: <BarChart3 size={16} />, description: "KPIs Genie uses in every session" },
  { id: "notes", label: "Business Notes", icon: <StickyNote size={16} />, description: "Quick insights and observations" },
  { id: "documents", label: "Documents", icon: <FileUp size={16} />, description: "Reports, spreadsheets, strategy docs" },
];

export default function KnowledgeBase() {
  const [active, setActive] = useState<Section>("metrics");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-accent/10 shrink-0">
          <Brain size={20} className="text-accent" />
        </div>
        <div>
          <h2 className="text-xl font-heading">Knowledge Base</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Everything here is injected into Genie's context so it knows your business inside out.
          </p>
        </div>
      </div>

      {/* Section tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={cn(
              "text-left p-4 rounded-xl border transition-all",
              active === s.id
                ? "border-accent/50 bg-accent/5"
                : "border-border bg-card hover:border-accent/30"
            )}
          >
            <div className={cn("mb-2", active === s.id ? "text-accent" : "text-muted-foreground")}>
              {s.icon}
            </div>
            <p className={cn("text-sm font-medium", active === s.id ? "text-accent" : "")}>{s.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
          </button>
        ))}
      </div>

      {/* Active panel */}
      <div className="rounded-xl border border-border bg-card p-5">
        {active === "metrics" && <MetricsPanel />}
        {active === "notes" && <NotesPanel />}
        {active === "documents" && <DocumentsPanel />}
      </div>
    </div>
  );
}

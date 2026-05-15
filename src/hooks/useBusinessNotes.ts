import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const NOTE_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "market", label: "Market" },
  { value: "competitor", label: "Competitor" },
  { value: "operations", label: "Operations" },
  { value: "finance", label: "Finance" },
  { value: "people", label: "People" },
] as const;

export type NoteCategory = typeof NOTE_CATEGORIES[number]["value"];

export interface BusinessNote {
  id: string;
  user_id: string;
  note: string;
  category: NoteCategory;
  created_at: string;
  updated_at: string;
}

export const useBusinessNotes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<BusinessNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from("business_notes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      setNotes((data as BusinessNote[]) || []);
    } catch (e) {
      console.error("useBusinessNotes fetch:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const addNote = async (note: string, category: NoteCategory = "general"): Promise<boolean> => {
    if (!user || !note.trim()) return false;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("business_notes")
        .insert({ user_id: user.id, note: note.trim(), category });
      if (error) throw error;
      await fetchNotes();
      return true;
    } catch (e) {
      console.error("addNote:", e);
      toast.error("Failed to save note");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("business_notes")
        .delete()
        .eq("id", id)
        .eq("user_id", user?.id);
      if (error) throw error;
      setNotes(prev => prev.filter(n => n.id !== id));
      return true;
    } catch (e) {
      console.error("deleteNote:", e);
      toast.error("Failed to delete note");
      return false;
    }
  };

  const getNotesContext = (): string => {
    if (!notes.length) return "";
    const recent = notes.slice(0, 8);
    const lines = recent.map(n => `[${n.category}] ${n.note}`).join("\n");
    return `\n\nBusiness Notes (operator-recorded):\n${lines}`;
  };

  return { notes, loading, saving, addNote, deleteNote, getNotesContext, refresh: fetchNotes };
};

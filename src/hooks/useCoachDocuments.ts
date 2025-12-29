import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface CoachDocument {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  extracted_text: string | null;
  description: string | null;
  category: string;
  created_at: string;
  updated_at: string;
}

export const useCoachDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<CoachDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("coach_documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocument = async (file: File, description?: string, category?: string): Promise<boolean> => {
    if (!user) {
      toast.error("Please sign in to upload documents");
      return false;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size must be under 10MB");
      return false;
    }

    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Unsupported file type. Please upload PDF, CSV, Excel, Word, or image files.");
      return false;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const storagePath = `${user.id}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("coach-documents")
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      // Extract text for text-based files directly
      let extractedText: string | null = null;
      if (file.type === "text/plain" || file.type === "text/csv") {
        extractedText = await file.text();
      }

      // Insert document record first
      const { data: insertedDoc, error: insertError } = await supabase
        .from("coach_documents")
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: storagePath,
          extracted_text: extractedText,
          description: description || null,
          category: category || "general"
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // For PDFs, Word, and Excel files, call the extraction function
      const needsExtraction = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ].includes(file.type);

      if (needsExtraction && insertedDoc) {
        // Get session for auth
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.access_token) {
          // Call extraction function in background
          supabase.functions.invoke("extract-document-text", {
            body: {
              storagePath,
              fileType: file.type,
              documentId: insertedDoc.id
            },
            headers: {
              Authorization: `Bearer ${sessionData.session.access_token}`
            }
          }).then(() => {
            // Refresh documents after extraction completes
            fetchDocuments();
          }).catch(console.error);
        }
      }

      toast.success("Document uploaded successfully");
      await fetchDocuments();
      return true;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload document");
      return false;
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (id: string, storagePath: string): Promise<boolean> => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("coach-documents")
        .remove([storagePath]);

      if (storageError) throw storageError;

      // Delete record
      const { error: deleteError } = await supabase
        .from("coach_documents")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      toast.success("Document deleted");
      await fetchDocuments();
      return true;
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete document");
      return false;
    }
  };

  const updateDocumentCategory = async (id: string, category: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("coach_documents")
        .update({ category })
        .eq("id", id);

      if (error) throw error;

      toast.success("Category updated");
      await fetchDocuments();
      return true;
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update category");
      return false;
    }
  };

  const updateDocumentDescription = async (id: string, description: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("coach_documents")
        .update({ description })
        .eq("id", id);

      if (error) throw error;

      toast.success("Description updated");
      await fetchDocuments();
      return true;
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update description");
      return false;
    }
  };

  const getDocumentContext = (): string => {
    if (documents.length === 0) return "";

    const contextParts = documents
      .filter(doc => doc.extracted_text || doc.description)
      .map(doc => {
        const parts = [`[Document: ${doc.file_name}]`];
        if (doc.description) parts.push(`Description: ${doc.description}`);
        if (doc.extracted_text) parts.push(`Content: ${doc.extracted_text.slice(0, 2000)}`);
        return parts.join("\n");
      });

    return contextParts.length > 0 
      ? `\n\nUser's Business Documents:\n${contextParts.join("\n\n")}`
      : "";
  };

  return {
    documents,
    loading,
    uploading,
    uploadDocument,
    deleteDocument,
    updateDocumentCategory,
    updateDocumentDescription,
    getDocumentContext,
    refresh: fetchDocuments
  };
};

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface KBCanonEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface KBIntelEntry {
  id: string;
  title: string;
  summary: string;
  source_url: string | null;
  source_name: string | null;
  published_date: string | null;
  content_type: string;
  category: string;
  tags: string[];
  is_outdated: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useKnowledgeBase = () => {
  const [canonEntries, setCanonEntries] = useState<KBCanonEntry[]>([]);
  const [intelEntries, setIntelEntries] = useState<KBIntelEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchKnowledgeBase = useCallback(async () => {
    try {
      const [canonRes, intelRes] = await Promise.all([
        supabase
          .from("kb_canon")
          .select("*")
          .eq("is_active", true)
          .order("priority", { ascending: false }),
        supabase
          .from("kb_intel")
          .select("*")
          .eq("is_active", true)
          .order("published_date", { ascending: false })
          .limit(50),
      ]);

      setCanonEntries((canonRes.data || []) as KBCanonEntry[]);
      setIntelEntries((intelRes.data || []) as KBIntelEntry[]);
    } catch (error) {
      console.error("Error fetching knowledge base:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKnowledgeBase();
  }, [fetchKnowledgeBase]);

  const searchCanon = useCallback(
    (query: string, category?: string): KBCanonEntry[] => {
      const lowerQuery = query.toLowerCase();
      return canonEntries.filter((entry) => {
        const matchesQuery =
          entry.title.toLowerCase().includes(lowerQuery) ||
          entry.content.toLowerCase().includes(lowerQuery) ||
          entry.tags.some((tag) => tag.toLowerCase().includes(lowerQuery));
        const matchesCategory = !category || entry.category === category;
        return matchesQuery && matchesCategory;
      });
    },
    [canonEntries]
  );

  const searchIntel = useCallback(
    (query: string, category?: string): KBIntelEntry[] => {
      const lowerQuery = query.toLowerCase();
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      return intelEntries
        .filter((entry) => {
          const matchesQuery =
            entry.title.toLowerCase().includes(lowerQuery) ||
            entry.summary.toLowerCase().includes(lowerQuery) ||
            entry.tags.some((tag) => tag.toLowerCase().includes(lowerQuery));
          const matchesCategory = !category || entry.category === category;
          return matchesQuery && matchesCategory;
        })
        .map((entry) => ({
          ...entry,
          is_outdated: entry.published_date
            ? new Date(entry.published_date) < twelveMonthsAgo
            : false,
        }));
    },
    [intelEntries]
  );

  const getRelevantContext = useCallback(
    (mode: string, query: string): string => {
      const relevantCanon = searchCanon(query).slice(0, 3);
      const relevantIntel = searchIntel(query).slice(0, 3);

      const parts: string[] = [];

      if (relevantCanon.length > 0) {
        parts.push("## Wellness Genius Frameworks");
        relevantCanon.forEach((entry) => {
          parts.push(`### ${entry.title}`);
          parts.push(entry.content);
        });
      }

      if (relevantIntel.length > 0) {
        parts.push("\n## Industry Intelligence");
        relevantIntel.forEach((entry) => {
          const outdatedNote = entry.is_outdated ? " [Note: This information may be outdated]" : "";
          parts.push(`### ${entry.title}${outdatedNote}`);
          parts.push(entry.summary);
          if (entry.source_url) {
            parts.push(`Source: ${entry.source_name || entry.source_url}`);
          }
        });
      }

      return parts.join("\n");
    },
    [searchCanon, searchIntel]
  );

  return {
    canonEntries,
    intelEntries,
    isLoading,
    searchCanon,
    searchIntel,
    getRelevantContext,
    refetch: fetchKnowledgeBase,
  };
};

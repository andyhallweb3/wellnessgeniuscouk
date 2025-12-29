import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Loader2, 
  RefreshCw, 
  ChevronRight,
  Newspaper,
  Save,
  FolderOpen,
  Trash2
} from "lucide-react";

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source_name: string;
  source_url: string;
  category: string;
  published_date: string;
  image_url: string | null;
  business_lens: string | null;
}

interface NewsletterTemplate {
  id: string;
  name: string;
  article_ids: string[];
  created_at: string;
}

interface ArticleSelectorProps {
  selectedArticleIds: string[];
  setSelectedArticleIds: (ids: string[]) => void;
  getAuthHeaders: () => Record<string, string>;
  onContinue: () => void;
}

export const ArticleSelector = ({
  selectedArticleIds,
  setSelectedArticleIds,
  getAuthHeaders,
  onContinue,
}: ArticleSelectorProps) => {
  const { toast } = useToast();
  const [availableNews, setAvailableNews] = useState<NewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [daysBack, setDaysBack] = useState(7);
  const [templates, setTemplates] = useState<NewsletterTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchAvailableNews = async () => {
    setLoadingNews(true);
    try {
      const { data, error } = await supabase.functions.invoke("newsletter-run", {
        body: { action: "list-news", daysBack, limit: 100 },
        headers: getAuthHeaders(),
      });

      if (error) throw error;
      setAvailableNews(data.articles || []);
      toast({
        title: "News Loaded",
        description: `Found ${data.articles?.length || 0} articles from the last ${daysBack} days`,
      });
    } catch (error) {
      toast({
        title: "Failed to Load News",
        description: error instanceof Error ? error.message : "Failed to fetch news articles",
        variant: "destructive",
      });
    } finally {
      setLoadingNews(false);
    }
  };

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const { data, error } = await supabase
        .from("newsletter_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const saveTemplate = async () => {
    if (!templateName.trim() || selectedArticleIds.length === 0) {
      toast({
        title: "Cannot Save",
        description: "Please enter a name and select at least one article",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("newsletter_templates")
        .insert({ name: templateName.trim(), article_ids: selectedArticleIds });

      if (error) throw error;

      toast({
        title: "Template Saved",
        description: `"${templateName}" saved with ${selectedArticleIds.length} articles`,
      });
      setTemplateName("");
      setShowSaveInput(false);
      fetchTemplates();
    } catch (error) {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save template",
        variant: "destructive",
      });
    }
  };

  const loadTemplate = (template: NewsletterTemplate) => {
    setSelectedArticleIds(template.article_ids);
    toast({
      title: "Template Loaded",
      description: `Loaded "${template.name}" with ${template.article_ids.length} articles`,
    });
  };

  const deleteTemplate = async (id: string, name: string) => {
    try {
      const { error } = await supabase.from("newsletter_templates").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Template Deleted",
        description: `"${name}" has been deleted`,
      });
      fetchTemplates();
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const toggleArticle = (id: string) => {
    if (selectedArticleIds.includes(id)) {
      setSelectedArticleIds(selectedArticleIds.filter((a) => a !== id));
    } else {
      setSelectedArticleIds([...selectedArticleIds, id]);
    }
  };

  const selectAll = () => {
    setSelectedArticleIds(filteredNews.map((a) => a.id));
  };

  const clearAll = () => {
    setSelectedArticleIds([]);
  };

  const categories = ["all", ...new Set(availableNews.map((a) => a.category))];

  const filteredNews = availableNews.filter((article) => {
    const matchesSearch =
      !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.source_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || article.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            Step 1: Select Articles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Load controls */}
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="text-sm text-muted-foreground">Days back</label>
              <Input
                type="number"
                value={daysBack}
                onChange={(e) => setDaysBack(parseInt(e.target.value) || 7)}
                className="w-24"
                min={1}
                max={30}
              />
            </div>
            <Button onClick={fetchAvailableNews} disabled={loadingNews}>
              {loadingNews ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Load News
            </Button>
          </div>

          {/* Templates */}
          {templates.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Saved Templates
              </h4>
              <div className="flex flex-wrap gap-2">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadTemplate(template)}
                    >
                      {template.name} ({template.article_ids.length})
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTemplate(template.id, template.name)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search and filter */}
          {availableNews.length > 0 && (
            <>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-secondary border border-border rounded-md px-3 py-2"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selection controls */}
              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {selectedArticleIds.length} selected
                  </span>
                  <Button variant="ghost" size="sm" onClick={selectAll}>
                    Select All
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearAll}>
                    Clear
                  </Button>
                </div>
                {selectedArticleIds.length > 0 && (
                  <div className="flex items-center gap-2">
                    {showSaveInput ? (
                      <>
                        <Input
                          placeholder="Template name..."
                          value={templateName}
                          onChange={(e) => setTemplateName(e.target.value)}
                          className="w-40"
                        />
                        <Button size="sm" onClick={saveTemplate}>
                          <Save className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => setShowSaveInput(true)}>
                        <Save className="h-4 w-4 mr-1" />
                        Save Template
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Article list */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredNews.map((article) => (
                  <div
                    key={article.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedArticleIds.includes(article.id)
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-muted-foreground"
                    }`}
                    onClick={() => toggleArticle(article.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedArticleIds.includes(article.id)}
                        onCheckedChange={() => toggleArticle(article.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium line-clamp-1">{article.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {article.source_name} • {article.category}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {availableNews.length === 0 && !loadingNews && (
            <div className="text-center py-8 text-muted-foreground">
              <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No articles loaded. Click "Load News" to fetch recent articles.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Continue button */}
      <div className="flex justify-end">
        <Button
          onClick={onContinue}
          disabled={selectedArticleIds.length === 0}
          className="gap-2"
        >
          Continue to Preview
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Eye, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  Moon,
  Sun,
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  Copy,
  Check
} from "lucide-react";

interface NewsletterPreviewProps {
  selectedArticleIds: string[];
  previewHtml: string | null;
  articles: any[];
  getAuthHeaders: () => Record<string, string>;
  onPreviewGenerated: (html: string, articles: any[]) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const NewsletterPreview = ({
  selectedArticleIds,
  previewHtml,
  articles,
  getAuthHeaders,
  onPreviewGenerated,
  onBack,
  onContinue,
}: NewsletterPreviewProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [previewWidth, setPreviewWidth] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);

  const generatePreview = async () => {
    setLoading(true);
    try {
      const requestBody: { preview: boolean; selectedArticleIds?: string[] } = { preview: true };

      if (selectedArticleIds.length > 0) {
        requestBody.selectedArticleIds = selectedArticleIds;
      }

      const { data, error } = await supabase.functions.invoke("newsletter-run", {
        body: requestBody,
        headers: getAuthHeaders(),
      });

      if (error) throw error;

      if (data.articleCount === 0) {
        toast({
          title: "No Articles",
          description:
            selectedArticleIds.length > 0
              ? "Selected articles could not be loaded."
              : "No articles found. Try loading news first.",
          variant: "destructive",
        });
        return;
      }

      onPreviewGenerated(data.html, data.articles || []);

      toast({
        title: "Preview Generated",
        description: `Generated newsletter with ${data.articleCount} articles`,
      });
    } catch (error) {
      toast({
        title: "Preview Failed",
        description: error instanceof Error ? error.message : "Failed to generate preview",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const widthClasses = {
    desktop: "w-full",
    tablet: "max-w-[768px]",
    mobile: "max-w-[375px]",
  };

  const copyHtmlToClipboard = async () => {
    if (!previewHtml) return;
    
    try {
      await navigator.clipboard.writeText(previewHtml);
      setCopied(true);
      toast({
        title: "HTML Copied!",
        description: "Newsletter HTML copied to clipboard. Paste it into Resend.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy HTML to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Step 2: Preview Newsletter
            </span>
            <div className="flex items-center gap-2">
              {/* Dark mode toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
                title={darkMode ? "Light mode" : "Dark mode"}
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              {/* Device preview */}
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={previewWidth === "desktop" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewWidth("desktop")}
                  className="rounded-none"
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewWidth === "tablet" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewWidth("tablet")}
                  className="rounded-none"
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewWidth === "mobile" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewWidth("mobile")}
                  className="rounded-none"
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Generate button and Copy HTML */}
          <div className="flex items-center gap-4 flex-wrap">
            <Button onClick={generatePreview} disabled={loading || selectedArticleIds.length === 0}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {previewHtml ? "Regenerate Preview" : "Generate Preview"}
            </Button>
            
            {previewHtml && (
              <Button 
                variant="outline" 
                onClick={copyHtmlToClipboard}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy HTML for Resend
                  </>
                )}
              </Button>
            )}
            
            <span className="text-sm text-muted-foreground">
              {selectedArticleIds.length} article{selectedArticleIds.length !== 1 ? "s" : ""} selected
            </span>
          </div>

          {/* Preview iframe */}
          {previewHtml ? (
            <div className="flex justify-center">
              <div
                className={`${widthClasses[previewWidth]} transition-all duration-300 rounded-lg overflow-hidden border`}
                style={{
                  filter: darkMode ? "invert(0.9) hue-rotate(180deg)" : "none",
                }}
              >
                <iframe
                  srcDoc={previewHtml}
                  title="Newsletter Preview"
                  className="w-full h-[600px] border-0"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground border rounded-lg">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Click "Generate Preview" to see your newsletter</p>
            </div>
          )}

          {/* Article summary */}
          {articles.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Articles in this newsletter:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {articles.map((article, index) => (
                  <li key={article.id || index}>
                    {index + 1}. {article.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back to Articles
        </Button>
        <Button onClick={onContinue} disabled={!previewHtml} className="gap-2">
          Continue to Send
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

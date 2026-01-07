import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  FileText, 
  Shield, 
  Settings,
  LogOut,
  Sparkles,
  Mail,
  Newspaper,
  Clock
} from "lucide-react";
import { SubscriberManager } from "./SubscriberManager";
import { BlogPostManager } from "./BlogPostManager";
import { AdminManager } from "./AdminManager";
import { EmailCampaigns } from "./EmailCampaigns";
import { ArticleSelector } from "./ArticleSelector";
import { NewsletterPreview } from "./NewsletterPreview";
import { SendNewsletter } from "./SendNewsletter";
import { SendHistory } from "./SendHistory";
import AIArticleGenerator from "@/components/admin/AIArticleGenerator";

interface ManageSectionProps {
  getAuthHeaders: () => Record<string, string>;
  onLogout: () => void;
  defaultTab?: string;
}

export const ManageSection = ({ getAuthHeaders, onLogout, defaultTab = "campaigns" }: ManageSectionProps) => {
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  
  // Newsletter builder state
  const [builderStep, setBuilderStep] = useState<"articles" | "preview" | "send">("articles");
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>([]);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [customIntro, setCustomIntro] = useState("");

  const handlePreviewGenerated = (html: string, loadedArticles: any[]) => {
    setPreviewHtml(html);
    setArticles(loadedArticles);
  };

  const handleSendComplete = () => {
    // Reset the builder after successful send
    setBuilderStep("articles");
    setSelectedArticleIds([]);
    setPreviewHtml(null);
    setArticles([]);
    setCustomIntro("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Manage
            </span>
            <Button variant="outline" onClick={onLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={defaultTab}>
            <TabsList className="mb-6 flex-wrap">
              <TabsTrigger value="builder" className="gap-2">
                <Newspaper className="h-4 w-4" />
                Newsletter Builder
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <Clock className="h-4 w-4" />
                Send History
              </TabsTrigger>
              <TabsTrigger value="campaigns" className="gap-2">
                <Mail className="h-4 w-4" />
                Email Campaigns
              </TabsTrigger>
              <TabsTrigger value="subscribers" className="gap-2">
                <Users className="h-4 w-4" />
                Subscribers
              </TabsTrigger>
              <TabsTrigger value="blog" className="gap-2">
                <FileText className="h-4 w-4" />
                Blog Posts
              </TabsTrigger>
              <TabsTrigger value="ai-gen" className="gap-2">
                <Sparkles className="h-4 w-4" />
                AI Generator
              </TabsTrigger>
              <TabsTrigger value="admins" className="gap-2">
                <Shield className="h-4 w-4" />
                Admins
              </TabsTrigger>
            </TabsList>

            <TabsContent value="builder">
              {builderStep === "articles" && (
                <ArticleSelector
                  selectedArticleIds={selectedArticleIds}
                  setSelectedArticleIds={setSelectedArticleIds}
                  getAuthHeaders={getAuthHeaders}
                  onContinue={() => setBuilderStep("preview")}
                />
              )}
              {builderStep === "preview" && (
                <NewsletterPreview
                  selectedArticleIds={selectedArticleIds}
                  previewHtml={previewHtml}
                  articles={articles}
                  customIntro={customIntro}
                  onCustomIntroChange={setCustomIntro}
                  getAuthHeaders={getAuthHeaders}
                  onPreviewGenerated={handlePreviewGenerated}
                  onBack={() => setBuilderStep("articles")}
                  onContinue={() => setBuilderStep("send")}
                />
              )}
              {builderStep === "send" && (
                <SendNewsletter
                  previewHtml={previewHtml}
                  articles={articles}
                  selectedArticleIds={selectedArticleIds}
                  getAuthHeaders={getAuthHeaders}
                  onSendComplete={handleSendComplete}
                  onBack={() => setBuilderStep("preview")}
                />
              )}
            </TabsContent>

            <TabsContent value="history">
              <SendHistory getAuthHeaders={getAuthHeaders} />
            </TabsContent>

            <TabsContent value="campaigns">
              <EmailCampaigns getAuthHeaders={getAuthHeaders} />
            </TabsContent>

            <TabsContent value="subscribers">
              <SubscriberManager getAuthHeaders={getAuthHeaders} />
            </TabsContent>

            <TabsContent value="blog">
              <BlogPostManager getAuthHeaders={getAuthHeaders} />
            </TabsContent>

            <TabsContent value="ai-gen">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Generate blog posts from news articles using AI.
                </p>
                <Button onClick={() => setShowAIGenerator(true)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Open AI Generator
                </Button>
              </div>
              <AIArticleGenerator
                open={showAIGenerator}
                onOpenChange={setShowAIGenerator}
                sourceArticle={showAIGenerator ? {
                  title: "",
                  summary: "",
                  source_name: "",
                  source_url: "",
                  category: "",
                  published_date: new Date().toISOString(),
                } : null}
                getAuthHeaders={getAuthHeaders}
                onArticleCreated={() => setShowAIGenerator(false)}
              />
            </TabsContent>

            <TabsContent value="admins">
              <AdminManager getAuthHeaders={getAuthHeaders} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

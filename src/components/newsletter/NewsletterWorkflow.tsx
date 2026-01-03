import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Eye, 
  Send, 
  Clock, 
  Settings,
  CheckCircle
} from "lucide-react";
import { ArticleSelector } from "./ArticleSelector";
import { NewsletterPreview } from "./NewsletterPreview";
import { SendNewsletter } from "./SendNewsletter";
import { SendHistory } from "./SendHistory";
import { ManageSection } from "./ManageSection";

interface NewsletterWorkflowProps {
  getAuthHeaders: () => Record<string, string>;
  onLogout: () => void;
  initialTab?: string;
}

export const NewsletterWorkflow = ({ getAuthHeaders, onLogout, initialTab }: NewsletterWorkflowProps) => {
  // Map 'campaigns' to 'manage' tab since campaigns is inside manage
  const getInitialTab = () => {
    if (initialTab === 'campaigns') return 'manage';
    return initialTab || 'articles';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>([]);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [customIntro, setCustomIntro] = useState("");

  const handlePreviewGenerated = (html: string, articleData: any[]) => {
    setPreviewHtml(html);
    setArticles(articleData);
    setActiveTab("preview");
  };

  const handleSendComplete = () => {
    setPreviewHtml(null);
    setArticles([]);
    setSelectedArticleIds([]);
    setCustomIntro("");
    setActiveTab("history");
  };

  const stepComplete = {
    articles: selectedArticleIds.length > 0,
    preview: previewHtml !== null,
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <StepIndicator 
          step={1} 
          label="Select" 
          active={activeTab === "articles"} 
          complete={stepComplete.articles}
        />
        <div className="w-8 h-px bg-border" />
        <StepIndicator 
          step={2} 
          label="Preview" 
          active={activeTab === "preview"} 
          complete={stepComplete.preview}
        />
        <div className="w-8 h-px bg-border" />
        <StepIndicator 
          step={3} 
          label="Send" 
          active={activeTab === "send"} 
          complete={false}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl mx-auto mb-8">
          <TabsTrigger value="articles" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Articles</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Preview</span>
          </TabsTrigger>
          <TabsTrigger value="send" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Send</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Manage</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="mt-0">
          <ArticleSelector
            selectedArticleIds={selectedArticleIds}
            setSelectedArticleIds={setSelectedArticleIds}
            getAuthHeaders={getAuthHeaders}
            onContinue={() => setActiveTab("preview")}
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <NewsletterPreview
            selectedArticleIds={selectedArticleIds}
            previewHtml={previewHtml}
            articles={articles}
            customIntro={customIntro}
            onCustomIntroChange={setCustomIntro}
            getAuthHeaders={getAuthHeaders}
            onPreviewGenerated={handlePreviewGenerated}
            onBack={() => setActiveTab("articles")}
            onContinue={() => setActiveTab("send")}
          />
        </TabsContent>

        <TabsContent value="send" className="mt-0">
          <SendNewsletter
            previewHtml={previewHtml}
            articles={articles}
            selectedArticleIds={selectedArticleIds}
            getAuthHeaders={getAuthHeaders}
            onSendComplete={handleSendComplete}
            onBack={() => setActiveTab("preview")}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <SendHistory getAuthHeaders={getAuthHeaders} />
        </TabsContent>

        <TabsContent value="manage" className="mt-0">
          <ManageSection getAuthHeaders={getAuthHeaders} onLogout={onLogout} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface StepIndicatorProps {
  step: number;
  label: string;
  active: boolean;
  complete: boolean;
}

const StepIndicator = ({ step, label, active, complete }: StepIndicatorProps) => (
  <div className="flex items-center gap-2">
    <div 
      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
        complete 
          ? "bg-green-500 text-white" 
          : active 
            ? "bg-accent text-accent-foreground" 
            : "bg-secondary text-muted-foreground"
      }`}
    >
      {complete ? <CheckCircle className="h-4 w-4" /> : step}
    </div>
    <span className={`text-sm ${active ? "text-foreground font-medium" : "text-muted-foreground"}`}>
      {label}
    </span>
  </div>
);

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
  Sparkles
} from "lucide-react";
import { SubscriberManager } from "./SubscriberManager";
import { BlogPostManager } from "./BlogPostManager";
import { AdminManager } from "./AdminManager";
import AIArticleGenerator from "@/components/admin/AIArticleGenerator";

interface ManageSectionProps {
  getAuthHeaders: () => Record<string, string>;
  onLogout: () => void;
}

export const ManageSection = ({ getAuthHeaders, onLogout }: ManageSectionProps) => {
  const [showAIGenerator, setShowAIGenerator] = useState(false);

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
          <Tabs defaultValue="subscribers">
            <TabsList className="mb-6">
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

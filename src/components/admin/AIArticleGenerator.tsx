import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  FileText,
  Wand2,
  Search,
  Newspaper,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SourceArticle {
  id?: string;
  title: string;
  summary: string;
  source_name: string;
  source_url: string;
  category: string;
  published_date: string;
  business_lens?: string | null;
  image_url?: string | null;
}

interface AIArticleGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceArticle: SourceArticle | null;
  getAuthHeaders: () => Record<string, string>;
  onArticleCreated?: () => void;
}

const AUDIENCES = [
  { value: 'operators', label: 'Operators', description: 'Gym owners, studio operators, spa directors' },
  { value: 'suppliers', label: 'Suppliers', description: 'Equipment manufacturers, software vendors' },
  { value: 'founders', label: 'Founders & Executives', description: 'CEOs, C-suite leaders' },
  { value: 'investors', label: 'Investors', description: 'VCs, PE firms, strategic investors' },
  { value: 'general', label: 'General', description: 'Broad decision-maker audience' },
];

const TONES = [
  { value: 'analytical', label: 'Analytical', description: 'Precise, data-aware, methodical' },
  { value: 'conversational', label: 'Conversational', description: 'Approachable, direct' },
  { value: 'authoritative', label: 'Authoritative', description: 'Confident, definitive' },
  { value: 'provocative', label: 'Provocative', description: 'Challenging, uncomfortable questions' },
];

const CHANNELS = [
  { value: 'blog', label: 'Blog Article', description: 'Long-form editorial content' },
  { value: 'linkedin_post', label: 'LinkedIn Post', description: 'Short, engaging social post' },
  { value: 'linkedin_newsletter', label: 'LinkedIn Newsletter', description: 'Weekly intelligence briefing' },
  { value: 'email_newsletter', label: 'Email Newsletter', description: 'Scannable, action-oriented' },
];

const LENGTHS = [
  { value: 'short', label: 'Short', description: '300-500 words' },
  { value: 'medium', label: 'Medium', description: '500-800 words' },
  { value: 'long', label: 'Long', description: '800-1200 words' },
];

const BUSINESS_LENSES = [
  { value: '', label: 'Auto-detect' },
  { value: 'revenue_growth', label: 'Revenue & Growth' },
  { value: 'cost_efficiency', label: 'Operational Efficiency' },
  { value: 'retention_engagement', label: 'Member Behaviour' },
  { value: 'risk_regulation', label: 'Risk & Regulation' },
  { value: 'investment_ma', label: 'Investment & M&A' },
  { value: 'technology_enablement', label: 'AI & Automation' },
];

export default function AIArticleGenerator({
  open,
  onOpenChange,
  sourceArticle: initialSourceArticle,
  getAuthHeaders,
  onArticleCreated,
}: AIArticleGeneratorProps) {
  const { toast } = useToast();
  
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // News article selection
  const [newsArticles, setNewsArticles] = useState<SourceArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [newsSearch, setNewsSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<SourceArticle | null>(initialSourceArticle);
  
  // Editorial controls
  const [audience, setAudience] = useState('operators');
  const [tone, setTone] = useState('analytical');
  const [channel, setChannel] = useState('blog');
  const [length, setLength] = useState('medium');
  const [businessLens, setBusinessLens] = useState('');
  
  // Generated content
  const [generatedHeadline, setGeneratedHeadline] = useState('');
  const [generatedBody, setGeneratedBody] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const [rawContent, setRawContent] = useState('');
  
  // Blog post form (for saving)
  const [blogForm, setBlogForm] = useState({
    slug: '',
    excerpt: '',
    category: 'AI',
    meta_title: '',
    meta_description: '',
    keywords: '',
    read_time: '5 min read',
    published: false,
    featured: false,
    image_url: '',
  });

  // Fetch news articles when modal opens
  useEffect(() => {
    if (open) {
      fetchNewsArticles();
      setSelectedArticle(initialSourceArticle);
    }
  }, [open, initialSourceArticle]);

  const fetchNewsArticles = async () => {
    setLoadingNews(true);
    try {
      // Fetch from rss_news_cache (recent news)
      const { data, error } = await supabase
        .from('rss_news_cache')
        .select('id, title, summary, source_url, source_name, category, published_date, business_lens, image_url')
        .order('published_date', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNewsArticles(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "Error",
        description: "Failed to load news articles",
        variant: "destructive",
      });
    } finally {
      setLoadingNews(false);
    }
  };

  const filteredArticles = newsArticles.filter(article =>
    article.title.toLowerCase().includes(newsSearch.toLowerCase()) ||
    article.summary.toLowerCase().includes(newsSearch.toLowerCase()) ||
    article.source_name.toLowerCase().includes(newsSearch.toLowerCase())
  );

  const handleGenerate = async () => {
    if (!selectedArticle) return;
    
    setGenerating(true);
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-article-content`,
        {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sourceArticle: {
              headline: selectedArticle.title,
              summary: selectedArticle.summary,
              source: selectedArticle.source_name,
              date: selectedArticle.published_date,
              category: selectedArticle.category,
              url: selectedArticle.source_url,
              business_lens: businessLens || selectedArticle.business_lens,
            },
            editorialControls: {
              audience,
              tone,
              channel,
              length,
              business_lens: businessLens || selectedArticle.business_lens,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate content');
      }

      const data = await response.json();
      
      setGeneratedHeadline(data.headline);
      setGeneratedBody(data.body);
      setRawContent(data.raw);
      
      // Auto-fill blog form with source article image
      setBlogForm(prev => ({
        ...prev,
        slug: data.headline.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        excerpt: data.body.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
        meta_title: data.headline,
        meta_description: data.body.replace(/<[^>]*>/g, '').substring(0, 160),
        image_url: selectedArticle?.image_url || '',
      }));

      toast({
        title: "Content Generated",
        description: "AI has generated your article. Review and edit as needed.",
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveToBlog = async () => {
    if (!generatedHeadline || !generatedBody) return;
    
    setSaving(true);
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-blog-posts`,
        {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'create',
            post: {
              title: generatedHeadline,
              slug: blogForm.slug,
              excerpt: blogForm.excerpt,
              content: generatedBody,
              category: blogForm.category,
              published: blogForm.published,
              featured: blogForm.featured,
              meta_title: blogForm.meta_title,
              meta_description: blogForm.meta_description,
              keywords: blogForm.keywords.split(',').map(k => k.trim()).filter(Boolean),
              read_time: blogForm.read_time,
              image_url: blogForm.image_url,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save blog post');
      }

      toast({
        title: "Blog Post Created",
        description: "Your article has been saved to the blog.",
      });
      
      onArticleCreated?.();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    const textToCopy = showRaw ? rawContent : `# ${generatedHeadline}\n\n${generatedBody}`;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setGeneratedHeadline('');
    setGeneratedBody('');
    setRawContent('');
    setShowRaw(false);
    setBlogForm({
      slug: '',
      excerpt: '',
      category: 'AI',
      meta_title: '',
      meta_description: '',
      keywords: '',
      read_time: '5 min read',
      published: false,
      featured: false,
      image_url: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogContent className="bg-card border-border max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles size={20} className="text-accent" />
            AI Article Generator
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          {/* Left Column - Source & Controls */}
          <div className="space-y-4">
            {/* Source Article Info */}
            {selectedArticle && selectedArticle.title ? (
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/30 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm text-accent">Selected Article</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedArticle(null)}
                    className="h-6 px-2 text-xs"
                  >
                    Change
                  </Button>
                </div>
                <p className="font-semibold">{selectedArticle.title}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{selectedArticle.summary}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{selectedArticle.source_name}</span>
                  <span>•</span>
                  <span>{new Date(selectedArticle.published_date).toLocaleDateString()}</span>
                  <a 
                    href={selectedArticle.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-accent hover:underline flex items-center gap-1"
                  >
                    <ExternalLink size={12} />
                    View
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Newspaper size={16} className="text-muted-foreground" />
                  <h4 className="font-medium text-sm">Select a News Article</h4>
                </div>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search articles..."
                    value={newsSearch}
                    onChange={(e) => setNewsSearch(e.target.value)}
                    className="pl-9 bg-secondary border-border"
                  />
                </div>
                <div className="max-h-[300px] overflow-y-auto space-y-2 border border-border rounded-lg p-2">
                  {loadingNews ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-accent" />
                    </div>
                  ) : filteredArticles.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No articles found
                    </p>
                  ) : (
                    filteredArticles.map((article) => (
                      <button
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className="w-full text-left p-3 rounded-lg bg-secondary/50 hover:bg-secondary border border-transparent hover:border-accent/30 transition-colors"
                      >
                        <p className="font-medium text-sm line-clamp-2">{article.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{article.source_name}</span>
                          <span>•</span>
                          <span>{new Date(article.published_date).toLocaleDateString()}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Editorial Controls */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Wand2 size={16} className="text-accent" />
                Editorial Controls
              </h4>
              
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-sm"
                >
                  {AUDIENCES.map(a => (
                    <option key={a.value} value={a.value}>{a.label} – {a.description}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Tone</Label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-sm"
                >
                  {TONES.map(t => (
                    <option key={t.value} value={t.value}>{t.label} – {t.description}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Distribution Channel</Label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-sm"
                >
                  {CHANNELS.map(c => (
                    <option key={c.value} value={c.value}>{c.label} – {c.description}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Length</Label>
                  <select
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-sm"
                  >
                    {LENGTHS.map(l => (
                      <option key={l.value} value={l.value}>{l.label} ({l.description})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Business Lens</Label>
                  <select
                    value={businessLens}
                    onChange={(e) => setBusinessLens(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-sm"
                  >
                    {BUSINESS_LENSES.map(b => (
                      <option key={b.value} value={b.value}>{b.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generating || !selectedArticle || !selectedArticle.title}
                className="w-full gap-2"
                variant="accent"
              >
                {generating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate Article
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right Column - Generated Content */}
          <div className="space-y-4">
            {generatedHeadline ? (
              <>
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center gap-2">
                    <FileText size={16} className="text-blue-400" />
                    Generated Content
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowRaw(!showRaw)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      {showRaw ? 'Show Formatted' : 'Show Raw'}
                    </button>
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Headline</Label>
                  <Input
                    value={generatedHeadline}
                    onChange={(e) => setGeneratedHeadline(e.target.value)}
                    className="bg-secondary border-border font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Content</Label>
                  {showRaw ? (
                    <Textarea
                      value={rawContent}
                      readOnly
                      className="bg-secondary border-border min-h-[300px] font-mono text-xs"
                    />
                  ) : (
                    <Textarea
                      value={generatedBody}
                      onChange={(e) => setGeneratedBody(e.target.value)}
                      className="bg-secondary border-border min-h-[300px] font-mono text-sm"
                    />
                  )}
                </div>

                {/* Blog Post Options */}
                {channel === 'blog' && (
                  <div className="space-y-4 p-4 rounded-lg bg-secondary/30 border border-border">
                    <h5 className="font-medium text-sm">Save as Blog Post</h5>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Slug</Label>
                        <Input
                          value={blogForm.slug}
                          onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                          className="bg-secondary border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <select
                          value={blogForm.category}
                          onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                          className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-sm"
                        >
                          <option value="AI">AI</option>
                          <option value="Wellness">Wellness</option>
                          <option value="Fitness">Fitness</option>
                          <option value="Data">Data</option>
                          <option value="Partnerships">Partnerships</option>
                          <option value="GTM">GTM</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Featured Image URL</Label>
                      <Input
                        value={blogForm.image_url}
                        onChange={(e) => setBlogForm({ ...blogForm, image_url: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        className="bg-secondary border-border"
                      />
                      {blogForm.image_url && (
                        <div className="mt-2 relative w-full h-24 rounded-lg overflow-hidden border border-border">
                          <img 
                            src={blogForm.image_url} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Excerpt</Label>
                      <Textarea
                        value={blogForm.excerpt}
                        onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                        className="bg-secondary border-border min-h-[60px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Meta Title</Label>
                        <Input
                          value={blogForm.meta_title}
                          onChange={(e) => setBlogForm({ ...blogForm, meta_title: e.target.value })}
                          className="bg-secondary border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Keywords</Label>
                        <Input
                          value={blogForm.keywords}
                          onChange={(e) => setBlogForm({ ...blogForm, keywords: e.target.value })}
                          placeholder="ai, wellness, fitness"
                          className="bg-secondary border-border"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Meta Description</Label>
                      <Input
                        value={blogForm.meta_description}
                        onChange={(e) => setBlogForm({ ...blogForm, meta_description: e.target.value })}
                        className="bg-secondary border-border"
                        maxLength={160}
                      />
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={blogForm.published}
                          onCheckedChange={(checked) => setBlogForm({ ...blogForm, published: checked })}
                        />
                        <Label>Publish immediately</Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={blogForm.featured}
                          onCheckedChange={(checked) => setBlogForm({ ...blogForm, featured: checked })}
                        />
                        <Label>Featured</Label>
                      </div>
                    </div>

                    <Button
                      onClick={handleSaveToBlog}
                      disabled={saving || !generatedHeadline || !generatedBody}
                      className="w-full gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FileText size={16} />
                          Save to Blog
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
                <Sparkles size={48} className="mb-4 opacity-30" />
                <p className="text-center">
                  Select a news item and configure editorial controls,<br />
                  then click "Generate Article" to create content.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

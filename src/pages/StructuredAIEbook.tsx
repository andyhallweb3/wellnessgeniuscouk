import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateStructuredAIEbook } from "@/lib/pdf-generators";
import { 
  Download, 
  Loader2, 
  CheckCircle, 
  Brain, 
  Target, 
  Shield, 
  BarChart3,
  Lightbulb,
  Building2,
  ExternalLink,
  BookOpen,
  Sparkles
} from "lucide-react";

const StructuredAIEbook = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to newsletter_subscribers
      await supabase
        .from("newsletter_subscribers")
        .insert({
          email: email.trim().toLowerCase(),
          name: name.trim() || null,
          source: "ebook-structured-ai",
        })
        .select()
        .maybeSingle();

      // Log the download
      await supabase
        .from("product_downloads")
        .insert({
          email: email.trim().toLowerCase(),
          name: name.trim() || null,
          product_id: "structured-ai-ebook",
          product_name: "Structured AI for Wellness Operators",
          product_type: "ebook",
          download_type: "free",
        });

      setIsSuccess(true);
      toast.success("Check your downloads folder!");
      
      // Generate and download PDF
      setTimeout(() => {
        const doc = generateStructuredAIEbook();
        doc.save("Structured-AI-Wellness-Operators.pdf");
      }, 500);

      // Trigger upsell email
      supabase.functions.invoke("send-download-upsell", {
        body: { 
          email: email.trim().toLowerCase(), 
          name: name.trim() || null,
          productId: "structured-ai-ebook",
          productName: "Structured AI for Wellness Operators",
        },
      }).catch(console.error);

    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const frameworkPillars = [
    {
      icon: Target,
      title: "Intent",
      description: "Define which decisions you're improving — retention, yield, utilisation, workforce stability",
    },
    {
      icon: Brain,
      title: "Context",
      description: "AI must understand your business model, market, demographics, and data reality",
    },
    {
      icon: Shield,
      title: "Constraints",
      description: "Define what must not happen — unsafe claims, data misuse, brand inconsistency",
    },
    {
      icon: BarChart3,
      title: "Output Contracts",
      description: "What 'good' looks like — clear prioritisation, practical next steps, decision-ready insight",
    },
  ];

  const sources = [
    { name: "Global Wellness Institute", url: "https://globalwellnessinstitute.org" },
    { name: "Leisure Database Company", url: "https://www.leisuredatabase.com" },
    { name: "Health Club Management", url: "https://www.healthclubmanagement.co.uk" },
    { name: "MVP Index", url: "https://themvpindex.com" },
  ];

  return (
    <>
      <Helmet>
        <title>Structured AI for Wellness Operators | Free Executive Brief</title>
        <meta name="description" content="From chatbots to decision infrastructure. Learn how structured AI improves decision quality for wellness businesses. Free executive brief with industry research." />
        <meta property="og:title" content="Structured AI for Wellness Operators | Free Executive Brief" />
        <meta property="og:description" content="From chatbots to decision infrastructure. A strategic framework for wellness leaders." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://wellnessgenius.co.uk/structured-ai" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-background to-background" />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <Badge variant="outline" className="mb-6 border-accent/30 text-accent">
                <BookOpen size={14} className="mr-2" />
                Free Executive Brief
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Structured AI for
                <span className="block text-accent">Wellness Operators</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-4">
                From Chatbots to Decision Infrastructure
              </p>
              
              <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto">
                A strategic framework for leaders who want AI that improves decision quality,
                not just automates tasks. Backed by GWI, Leisure DB, and industry research.
              </p>
            </div>

            {/* Download Form Card */}
            <Card className="max-w-md mx-auto bg-card/80 backdrop-blur border-border/50 shadow-2xl">
              <CardContent className="p-8">
                {isSuccess ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={32} className="text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Download Complete!</h3>
                    <p className="text-muted-foreground mb-6">
                      Check your downloads folder for the PDF.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const doc = generateStructuredAIEbook();
                        doc.save("Structured-AI-Wellness-Operators.pdf");
                      }}
                    >
                      <Download size={16} className="mr-2" />
                      Download Again
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="text-center mb-6">
                      <Sparkles size={24} className="text-accent mx-auto mb-2" />
                      <h3 className="font-semibold">Get the Free Executive Brief</h3>
                      <p className="text-sm text-muted-foreground">12-page PDF with framework + sources</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Work Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company">Company (optional)</Label>
                      <Input
                        id="company"
                        type="text"
                        placeholder="Your organisation"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      variant="accent"
                      className="w-full"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Download size={18} className="mr-2" />
                          Download Free PDF
                        </>
                      )}
                    </Button>
                    
                    <p className="text-xs text-center text-muted-foreground">
                      We respect your inbox. Occasional insights only.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Problem Statement */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-center">The Core Problem</h2>
              
              <Card className="bg-card border-border/50">
                <CardContent className="p-8">
                  <p className="text-xl text-center mb-6">
                    Most wellness businesses don't have a technology gap.
                    <span className="block font-semibold text-accent mt-2">
                      They have a decision-quality gap.
                    </span>
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-4 text-center text-muted-foreground">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="font-medium text-foreground">Data exists</p>
                      <p className="text-sm">but insight does not</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="font-medium text-foreground">Tools exist</p>
                      <p className="text-sm">but clarity does not</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="font-medium text-foreground">AI outputs</p>
                      <p className="text-sm">are generic and hard to trust</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Framework Preview */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">The Wellness AI Operating Framework</h2>
                <p className="text-lg text-muted-foreground">
                  AI performance scales with structure. Here's how.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {frameworkPillars.map((pillar) => (
                  <Card key={pillar.title} className="bg-card border-border/50 hover:border-accent/30 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <pillar.icon size={24} className="text-accent" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-2">{pillar.title}</h3>
                          <p className="text-muted-foreground">{pillar.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-12 text-center">
                <Card className="bg-accent/5 border-accent/20 inline-block">
                  <CardContent className="p-6">
                    <Lightbulb size={24} className="text-accent mx-auto mb-3" />
                    <p className="text-lg font-medium">
                      "Unstructured input → generic output.
                      <span className="block text-accent">Structured input → decision-ready intelligence."</span>
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Supplier Value */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <Badge variant="outline" className="mb-4">
                  <Building2 size={14} className="mr-2" />
                  For Suppliers & Partners
                </Badge>
                <h2 className="text-3xl font-bold mb-4">
                  Why Structured AI is a Growth Lever
                </h2>
                <p className="text-lg text-muted-foreground">
                  Move from product delivery to intelligence delivery
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-card border-border/50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">Standardised Intelligence at Scale</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      One structured framework, consistent insight across all clients.
                    </p>
                    <p className="text-accent text-sm font-medium">
                      "Deliver expert-level insight without scaling headcount."
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-card border-border/50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">Faster Client Adoption</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      AI explains how and why your product delivers value.
                    </p>
                    <p className="text-accent text-sm font-medium">
                      "Your product becomes easier to justify and harder to replace."
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-card border-border/50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">Data → Insight → Story</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      Turn usage data into renewal conversations and upsell logic.
                    </p>
                    <p className="text-accent text-sm font-medium">
                      "Stop selling features. Start selling outcomes."
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-card border-border/50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">Partner Differentiation</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      Most suppliers say "AI-powered". Few can say...
                    </p>
                    <p className="text-accent text-sm font-medium">
                      "We improve how our clients make decisions."
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Sources */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-lg font-semibold mb-6 text-muted-foreground">
                Industry Research & Sources
              </h3>
              <div className="flex flex-wrap justify-center gap-4">
                {sources.map((source) => (
                  <a
                    key={source.name}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-sm"
                  >
                    {source.name}
                    <ExternalLink size={12} className="text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-b from-background to-accent/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Get the Complete Framework
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              12-page executive brief with the full Wellness AI Operating Framework,
              supplier value hooks, and industry sources.
            </p>
            <Button
              variant="accent"
              size="lg"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <Download size={18} className="mr-2" />
              Download Free PDF
            </Button>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default StructuredAIEbook;

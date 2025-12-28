import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import FounderLayout from "@/components/founder/FounderLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Target, Ban, MessageSquare, Heart, Pencil, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface GuardrailSection {
  id: string;
  title: string;
  icon: typeof Shield;
  defaultItems: string[];
}

const sectionDefinitions: GuardrailSection[] = [
  {
    id: 'principles',
    title: 'Non-negotiable principles',
    icon: Shield,
    defaultItems: [
      'Never make medical or diagnostic claims',
      'Always prioritise user privacy over data collection',
      'Maintain editorial independence from sponsors',
      'Transparency about AI capabilities and limitations',
      'British English in all communications'
    ]
  },
  {
    id: 'markets',
    title: 'Markets to ignore',
    icon: Target,
    defaultItems: [
      'Consumer fitness apps (B2C)',
      'Medical and clinical wellness',
      'Supplement and nutrition products',
      'Franchise fitness models'
    ]
  },
  {
    id: 'language',
    title: 'Language to avoid',
    icon: Ban,
    defaultItems: [
      'Hype language: revolutionary, game-changing, disruptive',
      'Fear-based messaging: don\'t miss out, competitors are ahead',
      'Generic AI promises: will transform your business',
      'Emojis in professional communications'
    ]
  },
  {
    id: 'ethics',
    title: 'Ethical red lines',
    icon: Heart,
    defaultItems: [
      'No dark patterns in product design',
      'No selling user data to third parties',
      'No misleading claims about AI capabilities',
      'No exploiting health anxieties for engagement'
    ]
  },
  {
    id: 'optimisation',
    title: 'What not to optimise for',
    icon: MessageSquare,
    defaultItems: [
      'Short-term engagement over long-term trust',
      'Vanity metrics over meaningful outcomes',
      'Speed of shipping over quality of experience',
      'Growth at the expense of brand integrity'
    ]
  }
];

export default function Guardrails() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [sectionItems, setSectionItems] = useState<Record<string, string[]>>({});

  useEffect(() => {
    async function loadGuardrails() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('founder_guardrails')
          .select('section_id, items')
          .eq('user_id', user.id);

        if (error) throw error;

        // Build items map from database, falling back to defaults
        const itemsMap: Record<string, string[]> = {};
        sectionDefinitions.forEach(section => {
          const dbSection = data?.find(d => d.section_id === section.id);
          itemsMap[section.id] = dbSection?.items || section.defaultItems;
        });

        setSectionItems(itemsMap);
      } catch (error) {
        console.error('Error loading guardrails:', error);
        // Fall back to defaults
        const defaultMap: Record<string, string[]> = {};
        sectionDefinitions.forEach(section => {
          defaultMap[section.id] = section.defaultItems;
        });
        setSectionItems(defaultMap);
      } finally {
        setLoading(false);
      }
    }

    loadGuardrails();
  }, [user]);

  const handleEdit = (sectionId: string) => {
    setEditingSection(sectionId);
    setEditValue((sectionItems[sectionId] || []).join('\n'));
  };

  const handleSave = async (sectionId: string) => {
    if (!user) return;

    setSaving(sectionId);
    const items = editValue.split('\n').map(s => s.trim()).filter(Boolean);

    try {
      const { error } = await supabase
        .from('founder_guardrails')
        .upsert({
          user_id: user.id,
          section_id: sectionId,
          items: items
        }, {
          onConflict: 'user_id,section_id'
        });

      if (error) throw error;

      setSectionItems(prev => ({
        ...prev,
        [sectionId]: items
      }));

      toast({
        title: "Guardrails saved",
        description: "Your strategic boundaries have been updated.",
      });

      setEditingSection(null);
      setEditValue('');
    } catch (error) {
      console.error('Error saving guardrails:', error);
      toast({
        title: "Error saving",
        description: "Could not save guardrails. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(null);
    }
  };

  const handleCancel = () => {
    setEditingSection(null);
    setEditValue('');
  };

  if (loading) {
    return (
      <FounderLayout>
        <Helmet>
          <title>Guardrails & Strategy | Wellness Genius</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="founder-card">
              <Skeleton className="h-5 w-40 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      </FounderLayout>
    );
  }

  return (
    <FounderLayout>
      <Helmet>
        <title>Guardrails & Strategy | Wellness Genius</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Guardrails & Strategy</h1>
        <p className="text-muted-foreground mt-1">
          Keep AI aligned with your values
        </p>
      </div>

      {/* Explanation */}
      <div className="founder-card mb-6 bg-muted/30">
        <p className="text-sm text-muted-foreground">
          These guardrails define boundaries for AI recommendations and content generation. 
          They ensure the Wellness Genius voice remains consistent with your strategic intent.
        </p>
      </div>

      {/* Guardrail Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sectionDefinitions.map((section) => {
          const Icon = section.icon;
          const isEditing = editingSection === section.id;
          const isSaving = saving === section.id;
          const items = sectionItems[section.id] || section.defaultItems;
          
          return (
            <div key={section.id} className="founder-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-accent" />
                  <h3 className="text-sm font-medium text-foreground">{section.title}</h3>
                </div>
                {!isEditing && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => handleEdit(section.id)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <Textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="One item per line"
                    className="min-h-[150px] text-sm"
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={handleCancel} disabled={isSaving}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={() => handleSave(section.id)} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 mr-1" />
                      )}
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <ul className="space-y-2">
                  {items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </FounderLayout>
  );
}
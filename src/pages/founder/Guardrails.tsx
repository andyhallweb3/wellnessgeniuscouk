import { useState } from "react";
import { Helmet } from "react-helmet-async";
import FounderLayout from "@/components/founder/FounderLayout";
import { Shield, Target, Ban, MessageSquare, Heart, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface GuardrailSection {
  id: string;
  title: string;
  icon: typeof Shield;
  items: string[];
  editable?: boolean;
}

export default function Guardrails() {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const sections: GuardrailSection[] = [
    {
      id: 'principles',
      title: 'Non-negotiable principles',
      icon: Shield,
      items: [
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
      items: [
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
      items: [
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
      items: [
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
      items: [
        'Short-term engagement over long-term trust',
        'Vanity metrics over meaningful outcomes',
        'Speed of shipping over quality of experience',
        'Growth at the expense of brand integrity'
      ]
    }
  ];

  const handleEdit = (section: GuardrailSection) => {
    setEditingSection(section.id);
    setEditValue(section.items.join('\n'));
  };

  const handleSave = () => {
    // In a real implementation, this would save to the database
    setEditingSection(null);
    setEditValue('');
  };

  const handleCancel = () => {
    setEditingSection(null);
    setEditValue('');
  };

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
        {sections.map((section) => {
          const Icon = section.icon;
          const isEditing = editingSection === section.id;
          
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
                    onClick={() => handleEdit(section)}
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
                    <Button size="sm" variant="ghost" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      <Check className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <ul className="space-y-2">
                  {section.items.map((item, index) => (
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
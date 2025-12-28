import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface GuardrailsData {
  principles: string[];
  markets: string[];
  language: string[];
  ethics: string[];
  optimisation: string[];
}

const defaultGuardrails: GuardrailsData = {
  principles: [
    'Never make medical or diagnostic claims',
    'Always prioritise user privacy over data collection',
    'Maintain editorial independence from sponsors',
    'Transparency about AI capabilities and limitations',
    'British English in all communications'
  ],
  markets: [
    'Consumer fitness apps (B2C)',
    'Medical and clinical wellness',
    'Supplement and nutrition products',
    'Franchise fitness models'
  ],
  language: [
    'Hype language: revolutionary, game-changing, disruptive',
    'Fear-based messaging: don\'t miss out, competitors are ahead',
    'Generic AI promises: will transform your business',
    'Emojis in professional communications'
  ],
  ethics: [
    'No dark patterns in product design',
    'No selling user data to third parties',
    'No misleading claims about AI capabilities',
    'No exploiting health anxieties for engagement'
  ],
  optimisation: [
    'Short-term engagement over long-term trust',
    'Vanity metrics over meaningful outcomes',
    'Speed of shipping over quality of experience',
    'Growth at the expense of brand integrity'
  ]
};

export function useFounderGuardrails() {
  const { user } = useAuth();
  const [guardrails, setGuardrails] = useState<GuardrailsData>(defaultGuardrails);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGuardrails() {
      if (!user) {
        setGuardrails(defaultGuardrails);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('founder_guardrails')
          .select('section_id, items')
          .eq('user_id', user.id);

        if (error) throw error;

        const loaded: GuardrailsData = { ...defaultGuardrails };
        
        if (data) {
          data.forEach(row => {
            if (row.section_id in loaded) {
              loaded[row.section_id as keyof GuardrailsData] = row.items;
            }
          });
        }

        setGuardrails(loaded);
      } catch (error) {
        console.error('Error loading guardrails:', error);
        setGuardrails(defaultGuardrails);
      } finally {
        setLoading(false);
      }
    }

    loadGuardrails();
  }, [user]);

  /**
   * Generates a formatted context string for AI prompts
   * This can be injected into system prompts to ensure AI respects strategic boundaries
   */
  const getGuardrailsContext = useCallback((): string => {
    return `
## Strategic Guardrails

You must respect the following strategic boundaries in all recommendations and content:

### Non-negotiable Principles
${guardrails.principles.map(p => `- ${p}`).join('\n')}

### Markets to Ignore (do not recommend targeting or engaging with)
${guardrails.markets.map(m => `- ${m}`).join('\n')}

### Language to Avoid
${guardrails.language.map(l => `- ${l}`).join('\n')}

### Ethical Red Lines (never suggest anything that violates these)
${guardrails.ethics.map(e => `- ${e}`).join('\n')}

### Do Not Optimise For
${guardrails.optimisation.map(o => `- ${o}`).join('\n')}

Always use British English spelling and maintain a calm, founder-to-founder tone.
`.trim();
  }, [guardrails]);

  /**
   * Returns guardrails as a JSON object for API calls
   */
  const getGuardrailsJson = useCallback(() => {
    return guardrails;
  }, [guardrails]);

  return {
    guardrails,
    loading,
    getGuardrailsContext,
    getGuardrailsJson
  };
}
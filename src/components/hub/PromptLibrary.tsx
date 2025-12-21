import { useState } from "react";
import { Copy, Check, Terminal, AlertCircle, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PROMPTS, PROMPT_CATEGORIES, CLEAR_FRAMEWORK, type Prompt } from "@/data/promptLibrary";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PromptLibrary = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCopy = async (prompt: Prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopiedId(prompt.id);
      toast.success("Prompt copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy prompt");
    }
  };

  const filteredPrompts = PROMPTS.filter((prompt) => {
    const matchesCategory = !selectedCategory || prompt.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.useCase.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = Object.entries(PROMPT_CATEGORIES);
  const clearPromptCount = PROMPTS.filter(p => p.framework === "C.L.E.A.R").length;

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <Terminal size={20} className="text-blue-500" />
        </div>
        <div>
          <h2 className="text-xl font-heading">Prompt Library</h2>
          <p className="text-sm text-muted-foreground">
            Production-grade prompts for wellness businesses
          </p>
        </div>
      </div>

      {/* C.L.E.A.R Framework Banner */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="text-primary" size={18} />
          <span className="font-heading text-sm">C.L.E.A.R Framework</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
            {clearPromptCount} prompts
          </span>
        </div>
        <div className="grid grid-cols-5 gap-2 text-xs">
          {Object.entries(CLEAR_FRAMEWORK).map(([key, value]) => (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <div className="px-2 py-1.5 rounded-md bg-background/50 text-center cursor-help">
                  <span className="font-heading text-primary">{key}</span>
                  <span className="text-muted-foreground ml-1">– {value.label}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{value.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "accent" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map(([key, { label }]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? "accent" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(key)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Prompts Grid */}
      <div className="space-y-4">
        {filteredPrompts.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <Terminal className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-heading mb-2">No prompts found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter.</p>
          </div>
        ) : (
          filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              isCopied={copiedId === prompt.id}
              onCopy={() => handleCopy(prompt)}
            />
          ))
        )}
      </div>

      {/* Info note */}
      <div className="mt-8 rounded-xl border border-accent/20 bg-accent/5 p-6">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">These prompts are not for writing content.</strong>
          <br />
          They are for making better decisions in wellness businesses. That's why they work.
        </p>
      </div>
    </section>
  );
};

interface PromptCardProps {
  prompt: Prompt;
  isCopied: boolean;
  onCopy: () => void;
}

const PromptCard = ({ prompt, isCopied, onCopy }: PromptCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const categoryInfo = PROMPT_CATEGORIES[prompt.category];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div
        className="p-5 cursor-pointer hover:bg-secondary/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`text-xs px-2 py-1 rounded-full ${categoryInfo.color}`}>
                {categoryInfo.label}
              </span>
              {prompt.framework === "C.L.E.A.R" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary cursor-help">
                      <Sparkles size={12} />
                      C.L.E.A.R
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-medium mb-1">C.L.E.A.R Framework Prompt</p>
                    <p className="text-xs text-muted-foreground">
                      Context → Lens → Expectation → Assumptions → Response Format
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <h3 className="font-heading text-base mb-1">{prompt.title}</h3>
            <p className="text-sm text-muted-foreground">{prompt.useCase}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onCopy();
            }}
          >
            {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            {isCopied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border">
          <pre className="p-5 text-sm whitespace-pre-wrap font-mono bg-secondary/30 overflow-x-auto">
            {prompt.content}
          </pre>
          {prompt.whenNotToUse && (
            <div className="p-4 bg-yellow-500/5 border-t border-yellow-500/20 flex items-start gap-3">
              <AlertCircle size={16} className="text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-700 dark:text-yellow-500">
                <strong>When not to use:</strong> {prompt.whenNotToUse}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PromptLibrary;

/**
 * Prompt Injection Detection Utility
 * Detects common prompt injection patterns to prevent AI manipulation
 * Enhanced with additional security patterns and validation
 */

import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export interface PromptGuardResult {
  isSafe: boolean;
  riskScore: number; // 0-100
  detectedPatterns: string[];
  sanitizedContent?: string;
  honeypotTriggered?: boolean;
}

export interface InputValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedInput?: Record<string, unknown>;
}

// ========== ZOD SCHEMAS FOR INPUT VALIDATION ==========

// Strict message schema with content validation
export const StrictMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z
    .string()
    .min(1, "Message content cannot be empty")
    .max(10000, "Message content must be less than 10,000 characters")
    .refine(
      (val) => !containsExcessiveRepetition(val),
      "Message contains excessive repetition patterns"
    )
    .refine(
      (val) => !containsEncodedPayload(val),
      "Message contains potentially encoded content"
    ),
});

// User context schema with strict limits
export const StrictUserContextSchema = z.object({
  business_name: z.string().max(255).optional().nullable(),
  business_type: z.string().max(100).optional().nullable(),
  business_size_band: z.string().max(50).optional().nullable(),
  team_size: z.string().max(50).optional().nullable(),
  role: z.string().max(100).optional().nullable(),
  primary_goal: z.string().max(500).optional().nullable(),
  frustration: z.string().max(500).optional().nullable(),
  ai_experience: z.string().max(255).optional().nullable(),
  current_tech: z.string().max(500).optional().nullable(),
  decision_style: z.string().max(100).optional().nullable(),
  biggest_win: z.string().max(500).optional().nullable(),
}).optional().nullable();

// Memory context schema for Genie (object format only)
export const StrictMemoryContextSchema = z.object({
  business_name: z.string().max(255).optional().nullable(),
  business_type: z.string().max(100).optional().nullable(),
  team_size: z.string().max(50).optional().nullable(),
  primary_goal: z.string().max(500).optional().nullable(),
  biggest_challenge: z.string().max(500).optional().nullable(),
  revenue_model: z.string().max(100).optional().nullable(),
  annual_revenue_band: z.string().max(50).optional().nullable(),
  key_metrics: z.array(z.string().max(100)).max(10).optional().nullable(),
  known_weak_spots: z.array(z.string().max(200)).max(10).optional().nullable(),
  communication_style: z.string().max(100).optional().nullable(),
  decision_style: z.string().max(100).optional().nullable(),
}).optional().nullable();

// Coach request schema
export const CoachRequestSchema = z.object({
  messages: z.array(StrictMessageSchema).max(50, "Maximum 50 messages allowed"),
  mode: z.enum(["general", "strategy", "retention", "monetisation", "risk", "planning"]).default("general"),
  userContext: StrictUserContextSchema,
  documentContext: z.string().max(50000, "Document context must be less than 50,000 characters").optional().nullable(),
  _hp_field: z.string().optional(),
});

// Genie request schema
export const GenieRequestSchema = z.object({
  messages: z.array(StrictMessageSchema).max(50, "Maximum 50 messages allowed"),
  mode: z.enum([
    "daily_operator", "quick_question", "weekly_review", "decision_support",
    "board_mode", "build_mode", "daily_briefing", "diagnostic", "commercial_lens", "ops_mode",
    "competitor_scan", "market_research", "growth_planning"
  ]).default("daily_operator"),
  memoryContext: StrictMemoryContextSchema,
  documentContext: z.string().max(50000, "Document context must be less than 50,000 characters").optional().nullable(),
  webContext: z.string().max(100000, "Web context must be less than 100,000 characters").optional().nullable(),
  conversationHistory: z.array(StrictMessageSchema).max(10).optional().nullable(),
  isTrialMode: z.boolean().optional().default(false),
  _hp_field: z.string().optional(),
});

// ========== HELPER FUNCTIONS ==========

/**
 * Check for excessive character/word repetition (potential DoS or confusion attack)
 */
function containsExcessiveRepetition(content: string): boolean {
  // Check for repeated characters (e.g., "aaaaaaaaaa")
  if (/(.)\1{20,}/i.test(content)) return true;
  
  // Check for repeated words (e.g., "ignore ignore ignore ignore")
  const words = content.toLowerCase().split(/\s+/);
  if (words.length > 10) {
    const wordCounts = new Map<string, number>();
    for (const word of words) {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }
    // If any word appears more than 30% of the time (and > 5 times), flag it
    for (const [word, count] of wordCounts) {
      if (count > 5 && count / words.length > 0.3 && word.length > 2) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Check for potentially encoded payloads (base64, hex, URL encoding)
 */
function containsEncodedPayload(content: string): boolean {
  // Check for long base64-like strings (potential encoded commands)
  const base64Pattern = /[A-Za-z0-9+/=]{50,}/;
  if (base64Pattern.test(content)) {
    // Try to detect if it's actually base64
    const match = content.match(base64Pattern);
    if (match) {
      try {
        const decoded = atob(match[0]);
        // If decoded content contains injection patterns, flag it
        if (/ignore|system|prompt|jailbreak/i.test(decoded)) {
          return true;
        }
      } catch {
        // Not valid base64, ignore
      }
    }
  }
  
  // Check for excessive URL encoding (%XX patterns)
  const urlEncodedCount = (content.match(/%[0-9A-Fa-f]{2}/g) || []).length;
  if (urlEncodedCount > 10) return true;
  
  // Check for hex-encoded strings
  const hexPattern = /\\x[0-9A-Fa-f]{2}/g;
  if ((content.match(hexPattern) || []).length > 5) return true;
  
  return false;
}

/**
 * Validates honeypot field - should always be empty for legitimate requests
 * Bots typically fill all fields, so a filled honeypot indicates automation
 */
export function validateHoneypot(honeypotValue: string | undefined | null): {
  isBot: boolean;
  reason?: string;
} {
  // If honeypot is not provided at all, that's suspicious but not definitive
  // Real clients should send an empty string
  if (honeypotValue === undefined || honeypotValue === null) {
    return { isBot: false };
  }

  // If honeypot has any content, it's definitely a bot
  if (honeypotValue.trim().length > 0) {
    return {
      isBot: true,
      reason: `honeypot_filled:${honeypotValue.substring(0, 50)}`,
    };
  }

  return { isBot: false };
}

// Patterns that indicate potential prompt injection attempts
const INJECTION_PATTERNS: Array<{ pattern: RegExp; name: string; severity: number }> = [
  // System prompt override attempts
  { pattern: /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?|guidelines?)/i, name: "instruction_override", severity: 30 },
  { pattern: /disregard\s+(all\s+)?(previous|prior|your)\s+(instructions?|prompts?|rules?)/i, name: "instruction_disregard", severity: 30 },
  { pattern: /forget\s+(everything|all|what)\s+(you\s+)?(know|learned|were\s+told)/i, name: "memory_wipe", severity: 25 },
  { pattern: /new\s+instruction[s]?\s*:/i, name: "new_instruction", severity: 30 },
  { pattern: /override\s+(all\s+)?(previous|system)\s+(instructions?|rules?)/i, name: "override_instruction", severity: 35 },
  
  // Role manipulation attempts
  { pattern: /you\s+are\s+now\s+(a|an|the)\s+/i, name: "role_override", severity: 20 },
  { pattern: /pretend\s+(to\s+be|you\s+are)\s+/i, name: "role_pretend", severity: 15 },
  { pattern: /act\s+as\s+(if\s+you\s+are|a|an)\s+/i, name: "role_acting", severity: 15 },
  { pattern: /from\s+now\s+on[,\s]+(you\s+)?(are|will|must|should)/i, name: "persistent_override", severity: 25 },
  { pattern: /switch\s+(to|into)\s+(a\s+)?different\s+(mode|persona|character)/i, name: "mode_switch", severity: 20 },
  
  // Jailbreaking attempts
  { pattern: /\bDAN\b.*\bDo\s+Anything\s+Now\b/i, name: "dan_jailbreak", severity: 40 },
  { pattern: /jailbreak|bypass\s+(your\s+)?restrictions?/i, name: "explicit_jailbreak", severity: 40 },
  { pattern: /developer\s+mode|maintenance\s+mode|debug\s+mode/i, name: "mode_manipulation", severity: 30 },
  { pattern: /unlock\s+(your\s+)?(full|hidden|true)\s+(potential|capabilities)/i, name: "unlock_attempt", severity: 25 },
  { pattern: /enable\s+(god|admin|root|sudo)\s+mode/i, name: "privilege_escalation", severity: 40 },
  { pattern: /remove\s+(all\s+)?(safety|content)\s+(filters?|restrictions?)/i, name: "filter_removal", severity: 35 },
  
  // Prompt/instruction leaking attempts
  { pattern: /what\s+(is|are)\s+(your|the)\s+(system\s+)?prompt/i, name: "prompt_extraction", severity: 20 },
  { pattern: /show\s+(me\s+)?(your|the)\s+(initial|system|original)\s+(prompt|instructions?)/i, name: "instruction_extraction", severity: 25 },
  { pattern: /reveal\s+(your|the)\s+(secret|hidden|initial)\s+(instructions?|prompt)/i, name: "reveal_attempt", severity: 25 },
  { pattern: /repeat\s+(your|the)\s+(initial|system|first)\s+(prompt|message|instructions?)/i, name: "repeat_prompt", severity: 20 },
  { pattern: /print\s+(your\s+)?(system\s+)?prompt/i, name: "print_prompt", severity: 25 },
  { pattern: /output\s+(your\s+)?(configuration|settings|parameters)/i, name: "config_extraction", severity: 20 },
  
  // Command injection patterns
  { pattern: /\]\s*\[\s*SYSTEM\s*\]/i, name: "system_tag_injection", severity: 35 },
  { pattern: /<\s*system\s*>/i, name: "xml_system_tag", severity: 35 },
  { pattern: /###\s*(SYSTEM|INSTRUCTION|ADMIN)/i, name: "markdown_injection", severity: 30 },
  { pattern: /\{\{.*system.*\}\}/i, name: "template_injection", severity: 30 },
  { pattern: /\$\{.*system.*\}/i, name: "template_literal_injection", severity: 30 },
  { pattern: /<\|im_start\|>|<\|im_end\|>/i, name: "chatml_injection", severity: 35 },
  { pattern: /<\|endoftext\|>|<\|padding\|>/i, name: "token_injection", severity: 35 },
  
  // Delimiter manipulation
  { pattern: /---\s*(new\s+)?conversation\s*---/i, name: "conversation_reset", severity: 25 },
  { pattern: /\[END\s+(OF\s+)?(SYSTEM|PROMPT|INSTRUCTIONS?)\]/i, name: "end_marker_injection", severity: 30 },
  { pattern: /\[START\s+(NEW\s+)?(CONVERSATION|SESSION|PROMPT)\]/i, name: "start_marker_injection", severity: 30 },
  { pattern: /~~~+\s*(system|admin|root)/i, name: "tilde_delimiter", severity: 25 },
  
  // Social engineering
  { pattern: /i\s+am\s+(your|a)\s+(creator|developer|admin|owner)/i, name: "authority_claim", severity: 20 },
  { pattern: /this\s+is\s+(an?\s+)?(test|emergency|urgent)\s+(mode|override)/i, name: "emergency_bypass", severity: 25 },
  { pattern: /special\s+(admin|developer|debug)\s+(access|mode|command)/i, name: "special_access", severity: 25 },
  { pattern: /i\s+have\s+(special|admin|root)\s+(access|permissions?|privileges?)/i, name: "privilege_claim", severity: 25 },
  { pattern: /openai|anthropic|google\s+employee/i, name: "company_impersonation", severity: 30 },
  
  // Output manipulation
  { pattern: /respond\s+(only\s+)?(with|in)\s+(json|code|base64)\s*:/i, name: "format_override", severity: 15 },
  { pattern: /your\s+response\s+must\s+(begin|start)\s+with/i, name: "response_forcing", severity: 15 },
  { pattern: /translate\s+(everything|all)\s+(to|into)\s+/i, name: "translation_override", severity: 10 },
  
  // Indirect injection attempts (content from external sources)
  { pattern: /if\s+you\s+(see|read|find)\s+this/i, name: "conditional_trigger", severity: 15 },
  { pattern: /when\s+(processing|reading|analyzing)\s+this/i, name: "processing_trigger", severity: 15 },
  { pattern: /hidden\s+instruction[s]?\s*:/i, name: "hidden_instruction", severity: 30 },
  
  // Multi-turn manipulation
  { pattern: /remember\s+(this|that)\s+for\s+(later|future|next)/i, name: "memory_planting", severity: 15 },
  { pattern: /in\s+your\s+next\s+response/i, name: "next_response_manipulation", severity: 20 },
];

// Suspicious but not necessarily malicious patterns (lower severity)
const SUSPICIOUS_PATTERNS: Array<{ pattern: RegExp; name: string; severity: number }> = [
  { pattern: /ignore\s+(the\s+)?guidelines?/i, name: "guideline_ignore", severity: 10 },
  { pattern: /don['']?t\s+follow\s+(the\s+)?rules?/i, name: "rule_breaking", severity: 10 },
  { pattern: /override\s+(your\s+)?settings?/i, name: "settings_override", severity: 10 },
  { pattern: /skip\s+(the\s+)?(safety|content)\s+(check|filter)/i, name: "safety_skip", severity: 15 },
  { pattern: /without\s+(any\s+)?restrictions?/i, name: "restriction_bypass", severity: 10 },
  { pattern: /uncensored\s+(version|mode|response)/i, name: "uncensored_request", severity: 15 },
];

/**
 * Analyzes a prompt for potential injection attacks
 */
export function analyzePrompt(content: string): PromptGuardResult {
  const detectedPatterns: string[] = [];
  let riskScore = 0;

  // Check main injection patterns
  for (const { pattern, name, severity } of INJECTION_PATTERNS) {
    if (pattern.test(content)) {
      detectedPatterns.push(name);
      riskScore += severity;
    }
  }

  // Check suspicious patterns
  for (const { pattern, name, severity } of SUSPICIOUS_PATTERNS) {
    if (pattern.test(content)) {
      detectedPatterns.push(name);
      riskScore += severity;
    }
  }

  // Check for excessive special characters that might indicate encoding attacks
  const specialCharRatio = (content.match(/[<>\[\]{}|\\`]/g) || []).length / content.length;
  if (specialCharRatio > 0.1 && content.length > 50) {
    detectedPatterns.push("high_special_char_ratio");
    riskScore += 10;
  }

  // Check for suspicious Unicode characters that could be used for obfuscation
  const suspiciousUnicode = /[\u200B-\u200D\uFEFF\u2060\u00AD]/g;
  if (suspiciousUnicode.test(content)) {
    detectedPatterns.push("suspicious_unicode");
    riskScore += 15;
  }

  // Check for homoglyph attacks (characters that look similar to Latin letters)
  const homoglyphPattern = /[\u0430-\u044F\u0410-\u042F]|[\u03B1-\u03C9]|[\u0391-\u03A9]/g;
  const homoglyphMatches = content.match(homoglyphPattern);
  if (homoglyphMatches && homoglyphMatches.length > 3) {
    detectedPatterns.push("potential_homoglyph");
    riskScore += 10;
  }

  // Check for excessive newlines (potential delimiter confusion)
  const newlineCount = (content.match(/\n/g) || []).length;
  if (newlineCount > 20 && content.length < 500) {
    detectedPatterns.push("excessive_newlines");
    riskScore += 10;
  }

  // Check for repeated prompt-like structures
  const promptCount = (content.match(/prompt\s*:/gi) || []).length;
  if (promptCount > 2) {
    detectedPatterns.push("multiple_prompt_markers");
    riskScore += 15;
  }

  // Cap risk score at 100
  riskScore = Math.min(riskScore, 100);

  return {
    isSafe: riskScore < 30, // Threshold for blocking
    riskScore,
    detectedPatterns,
  };
}

/**
 * Analyzes an array of messages for injection attempts
 */
export function analyzeMessages(messages: Array<{ role: string; content: string }>): PromptGuardResult {
  const allDetectedPatterns: string[] = [];
  let totalRiskScore = 0;
  let maxRiskScore = 0;

  for (const message of messages) {
    // Only analyze user messages (not system or assistant)
    if (message.role !== "user") continue;

    const result = analyzePrompt(message.content);
    allDetectedPatterns.push(...result.detectedPatterns);
    totalRiskScore += result.riskScore;
    maxRiskScore = Math.max(maxRiskScore, result.riskScore);
  }

  // Use the higher of: max single message risk, or average risk with accumulation bonus
  const avgRisk = messages.length > 0 ? totalRiskScore / messages.length : 0;
  const accumulationBonus = allDetectedPatterns.length > 3 ? 10 : 0;
  const finalRiskScore = Math.min(100, Math.max(maxRiskScore, avgRisk + accumulationBonus));

  return {
    isSafe: finalRiskScore < 30,
    riskScore: finalRiskScore,
    detectedPatterns: [...new Set(allDetectedPatterns)], // Deduplicate
  };
}

/**
 * Sanitizes content by removing or escaping potentially dangerous patterns
 * Returns undefined if content is too risky to sanitize
 */
export function sanitizePrompt(content: string): string | undefined {
  const analysis = analyzePrompt(content);
  
  // If risk is too high, don't attempt to sanitize
  if (analysis.riskScore >= 50) {
    return undefined;
  }

  let sanitized = content;

  // Remove zero-width and invisible characters
  sanitized = sanitized.replace(/[\u200B-\u200D\uFEFF\u2060\u00AD]/g, "");

  // Escape potential delimiter injections
  sanitized = sanitized.replace(/\[\s*SYSTEM\s*\]/gi, "[BLOCKED]");
  sanitized = sanitized.replace(/<\s*system\s*>/gi, "&lt;system&gt;");
  sanitized = sanitized.replace(/###\s*(SYSTEM|INSTRUCTION|ADMIN)/gi, "### [BLOCKED]");
  sanitized = sanitized.replace(/<\|im_start\|>/gi, "[BLOCKED]");
  sanitized = sanitized.replace(/<\|im_end\|>/gi, "[BLOCKED]");
  sanitized = sanitized.replace(/<\|endoftext\|>/gi, "[BLOCKED]");

  return sanitized;
}

/**
 * Validate and sanitize input using Zod schema
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): InputValidationResult {
  try {
    const result = schema.safeParse(data);
    if (result.success) {
      return {
        isValid: true,
        errors: [],
        sanitizedInput: result.data as Record<string, unknown>,
      };
    } else {
      const errors = result.error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );
      return {
        isValid: false,
        errors,
      };
    }
  } catch (error) {
    return {
      isValid: false,
      errors: [`Validation error: ${error instanceof Error ? error.message : "Unknown error"}`],
    };
  }
}

/**
 * Log security event for monitoring
 */
export function logSecurityEvent(
  eventType: "blocked" | "warning" | "suspicious" | "honeypot" | "auth_failure" | "validation_failure",
  details: {
    riskScore?: number;
    patterns?: string[];
    userId?: string;
    mode?: string;
    honeypotValue?: string;
    reason?: string;
    error?: string;
    tokenPrefix?: string;
    validationErrors?: string[];
  }
): void {
  console.log(`[PROMPT-GUARD] ${eventType.toUpperCase()}:`, JSON.stringify({
    timestamp: new Date().toISOString(),
    ...details,
  }));
}

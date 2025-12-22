/**
 * Prompt Injection Detection Utility
 * Detects common prompt injection patterns to prevent AI manipulation
 */

export interface PromptGuardResult {
  isSafe: boolean;
  riskScore: number; // 0-100
  detectedPatterns: string[];
  sanitizedContent?: string;
}

// Patterns that indicate potential prompt injection attempts
const INJECTION_PATTERNS: Array<{ pattern: RegExp; name: string; severity: number }> = [
  // System prompt override attempts
  { pattern: /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?|guidelines?)/i, name: "instruction_override", severity: 30 },
  { pattern: /disregard\s+(all\s+)?(previous|prior|your)\s+(instructions?|prompts?|rules?)/i, name: "instruction_disregard", severity: 30 },
  { pattern: /forget\s+(everything|all|what)\s+(you\s+)?(know|learned|were\s+told)/i, name: "memory_wipe", severity: 25 },
  
  // Role manipulation attempts
  { pattern: /you\s+are\s+now\s+(a|an|the)\s+/i, name: "role_override", severity: 20 },
  { pattern: /pretend\s+(to\s+be|you\s+are)\s+/i, name: "role_pretend", severity: 15 },
  { pattern: /act\s+as\s+(if\s+you\s+are|a|an)\s+/i, name: "role_acting", severity: 15 },
  { pattern: /from\s+now\s+on[,\s]+(you\s+)?(are|will|must|should)/i, name: "persistent_override", severity: 25 },
  
  // Jailbreaking attempts
  { pattern: /\bDAN\b.*\bDo\s+Anything\s+Now\b/i, name: "dan_jailbreak", severity: 40 },
  { pattern: /jailbreak|bypass\s+(your\s+)?restrictions?/i, name: "explicit_jailbreak", severity: 40 },
  { pattern: /developer\s+mode|maintenance\s+mode|debug\s+mode/i, name: "mode_manipulation", severity: 30 },
  { pattern: /unlock\s+(your\s+)?(full|hidden|true)\s+(potential|capabilities)/i, name: "unlock_attempt", severity: 25 },
  
  // Prompt/instruction leaking attempts
  { pattern: /what\s+(is|are)\s+(your|the)\s+(system\s+)?prompt/i, name: "prompt_extraction", severity: 20 },
  { pattern: /show\s+(me\s+)?(your|the)\s+(initial|system|original)\s+(prompt|instructions?)/i, name: "instruction_extraction", severity: 25 },
  { pattern: /reveal\s+(your|the)\s+(secret|hidden|initial)\s+(instructions?|prompt)/i, name: "reveal_attempt", severity: 25 },
  { pattern: /repeat\s+(your|the)\s+(initial|system|first)\s+(prompt|message|instructions?)/i, name: "repeat_prompt", severity: 20 },
  
  // Command injection patterns
  { pattern: /\]\s*\[\s*SYSTEM\s*\]/i, name: "system_tag_injection", severity: 35 },
  { pattern: /<\s*system\s*>/i, name: "xml_system_tag", severity: 35 },
  { pattern: /###\s*(SYSTEM|INSTRUCTION|ADMIN)/i, name: "markdown_injection", severity: 30 },
  { pattern: /\{\{.*system.*\}\}/i, name: "template_injection", severity: 30 },
  
  // Delimiter manipulation
  { pattern: /---\s*(new\s+)?conversation\s*---/i, name: "conversation_reset", severity: 25 },
  { pattern: /\[END\s+(OF\s+)?(SYSTEM|PROMPT|INSTRUCTIONS?)\]/i, name: "end_marker_injection", severity: 30 },
  { pattern: /\[START\s+(NEW\s+)?(CONVERSATION|SESSION|PROMPT)\]/i, name: "start_marker_injection", severity: 30 },
  
  // Social engineering
  { pattern: /i\s+am\s+(your|a)\s+(creator|developer|admin|owner)/i, name: "authority_claim", severity: 20 },
  { pattern: /this\s+is\s+(an?\s+)?(test|emergency|urgent)\s+(mode|override)/i, name: "emergency_bypass", severity: 25 },
  { pattern: /special\s+(admin|developer|debug)\s+(access|mode|command)/i, name: "special_access", severity: 25 },
  
  // Output manipulation
  { pattern: /respond\s+(only\s+)?(with|in)\s+(json|code|base64)\s*:/i, name: "format_override", severity: 15 },
  { pattern: /your\s+response\s+must\s+(begin|start)\s+with/i, name: "response_forcing", severity: 15 },
];

// Suspicious but not necessarily malicious patterns (lower severity)
const SUSPICIOUS_PATTERNS: Array<{ pattern: RegExp; name: string; severity: number }> = [
  { pattern: /ignore\s+(the\s+)?guidelines?/i, name: "guideline_ignore", severity: 10 },
  { pattern: /don['']?t\s+follow\s+(the\s+)?rules?/i, name: "rule_breaking", severity: 10 },
  { pattern: /override\s+(your\s+)?settings?/i, name: "settings_override", severity: 10 },
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

  return sanitized;
}

/**
 * Log security event for monitoring
 */
export function logSecurityEvent(
  eventType: "blocked" | "warning" | "suspicious",
  details: {
    riskScore: number;
    patterns: string[];
    userId?: string;
    mode?: string;
  }
): void {
  console.log(`[PROMPT-GUARD] ${eventType.toUpperCase()}:`, JSON.stringify({
    timestamp: new Date().toISOString(),
    ...details,
  }));
}

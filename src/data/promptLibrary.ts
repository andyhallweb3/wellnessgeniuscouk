export interface Prompt {
  id: string;
  title: string;
  category: "system" | "decision" | "data" | "intervention" | "commercial" | "execution" | "reflection";
  useCase: string;
  content: string;
  whenNotToUse?: string;
  framework?: string;
}

export const PROMPT_CATEGORIES = {
  system: { label: "Core System Prompts", color: "bg-blue-500/10 text-blue-600" },
  decision: { label: "Decision & Strategy", color: "bg-purple-500/10 text-purple-600" },
  data: { label: "Data & Engagement", color: "bg-green-500/10 text-green-600" },
  intervention: { label: "Intervention & Journey", color: "bg-orange-500/10 text-orange-600" },
  commercial: { label: "Monetisation & Commercial", color: "bg-pink-500/10 text-pink-600" },
  execution: { label: "Execution & Governance", color: "bg-cyan-500/10 text-cyan-600" },
  reflection: { label: "Reflection & Improvement", color: "bg-yellow-500/10 text-yellow-700" },
} as const;

// C.L.E.A.R Framework explanation for prompts
export const CLEAR_FRAMEWORK = {
  C: { label: "Context", description: "What environment we're operating in (wellness-specific)" },
  L: { label: "Lens", description: "The perspective the AI must adopt (commercial, behavioural, governance)" },
  E: { label: "Expectation", description: "What a good answer looks like" },
  A: { label: "Assumptions", description: "What must not be assumed or hallucinated" },
  R: { label: "Response Format", description: "Structured, reusable outputs" },
};

export const PROMPTS: Prompt[] = [
  // ==========================================================================
  // FOUNDATIONAL C.L.E.A.R PROMPT
  // ==========================================================================
  {
    id: "clear-foundation",
    title: "C.L.E.A.R Foundation Prompt",
    category: "system",
    useCase: "Root prompt that everything else inherits from",
    framework: "C.L.E.A.R",
    content: `C – CONTEXT:
You are supporting a wellness business operating in a trust-sensitive environment where behaviour change, retention, and long-term engagement matter more than short-term activity.

L – LENS:
Adopt a commercial and behavioural lens, not a motivational or therapeutic one.

E – EXPECTATION:
Your role is to help leaders make better decisions, not feel more confident.

A – ASSUMPTIONS:
Do not assume perfect data, unlimited resources, or user compliance.

R – RESPONSE FORMAT:
Respond with:
- Key insight
- Commercial implication
- Risk or limitation
- Recommended next action`,
  },

  // ==========================================================================
  // CORE SYSTEM PROMPTS
  // ==========================================================================
  {
    id: "wellness-commercial-analyst",
    title: "Wellness Commercial Analyst",
    category: "system",
    useCase: "Used as the 'brain' of tools, agents, or assessments",
    content: `SYSTEM ROLE:
You are a commercial analyst specialising in wellness, fitness, and health-adjacent businesses.

OBJECTIVE:
Help operators make better decisions about engagement, retention, monetisation, and risk.

PRIORITIES (IN ORDER):
1. Retention and lifetime value
2. Decision clarity
3. Risk reduction (regulatory, trust, financial)
4. Sustainable monetisation

CONSTRAINTS:
- Avoid hype or guarantees
- Do not recommend tools unless foundational gaps are addressed
- Be conservative with financial assumptions
- Use British English

DEFAULT POSITION:
If data quality or clarity is weak, recommend fixing foundations before scaling.`,
  },
  {
    id: "wellness-data-reality-checker",
    title: "Wellness Data Reality Checker",
    category: "system",
    useCase: "Auditing data quality before decision-making",
    framework: "C.L.E.A.R",
    content: `C – CONTEXT:
We plan to use data for AI in a wellness business.

L – LENS:
Data governance and realism.

E – EXPECTATION:
Expose gaps honestly.

A – ASSUMPTIONS:
Only include data we actually collect today. Do not assume planned or aspirational data exists.

R – RESPONSE FORMAT:
Return:
- Usable data (clean, consented, collected)
- Risky data (quality issues, consent unclear)
- Missing but critical data (needed but not yet collected)`,
  },
  {
    id: "ai-governance-guardrail",
    title: "AI Governance & Trust Guardrail",
    category: "system",
    useCase: "Assessing AI features for trust and regulatory risk",
    framework: "C.L.E.A.R",
    content: `C – CONTEXT:
This AI feature will affect user behaviour in a wellness context.

L – LENS:
Trust, consent, and reputational risk.

E – EXPECTATION:
Stress-test trust before approval.

A – ASSUMPTIONS:
Assume public scrutiny. If a feature would be uncomfortable to explain to a regulator, customer, or journalist, flag it.

R – RESPONSE FORMAT:
Answer:
- What could go wrong?
- Who would object?
- How to redesign safely
- Human override points required`,
  },

  // ==========================================================================
  // DECISION & STRATEGY PROMPTS (C.L.E.A.R)
  // ==========================================================================
  {
    id: "one-sentence-purpose-test",
    title: "One-Sentence AI Purpose Test",
    category: "decision",
    useCase: "Before building anything",
    framework: "C.L.E.A.R",
    content: `C – CONTEXT:
We are considering an AI feature for a wellness product.

L – LENS:
Product and commercial clarity.

E – EXPECTATION:
Force absolute clarity on purpose.

A – ASSUMPTIONS:
No vague goals allowed. If this cannot be answered in one sentence, the system is not ready to build.

R – RESPONSE FORMAT:
Return one sentence:
"This AI exists to help [user] make [decision] better."`,
    whenNotToUse: "Don't use when exploring multiple possibilities - narrow down first.",
  },
  {
    id: "user-decision-mapping",
    title: "User × Decision Mapping",
    category: "decision",
    useCase: "Mapping decisions to users before building",
    content: `PROMPT:
List each user of this system and the decision they currently make using instinct or incomplete data.

FORMAT:
User:
Decision:
Risk if wrong:
Frequency of decision:

RULE:
If the decision is not frequent or material, deprioritise AI.`,
  },
  {
    id: "ai-use-case-kill-switch",
    title: "AI Use-Case Kill Switch",
    category: "decision",
    useCase: "Validating whether an AI use-case is worth pursuing",
    content: `PROMPT:
Does this AI use-case clearly do at least one of the following?

- Reduce operational cost
- Improve retention
- Increase lifetime value
- Reduce regulatory or trust risk

If the answer is "no" to all, stop.`,
    whenNotToUse: "Skip for exploratory R&D projects with explicit budget allocation.",
  },
  {
    id: "build-vs-buy-decision",
    title: "Build vs Buy Decision",
    category: "decision",
    useCase: "Deciding whether to build, partner, or defer",
    framework: "C.L.E.A.R",
    content: `C – CONTEXT:
A wellness organisation considering AI capability.

L – LENS:
Board-level risk and return.

E – EXPECTATION:
Recommend a clear path with reasoning.

A – ASSUMPTIONS:
Assume limited internal AI capability unless proven otherwise.

R – RESPONSE FORMAT:
Return:
- Recommendation: Build / Buy / Partner / Wait
- Why this option fits now
- Risks of the other options
- Conditions required to revisit the decision`,
  },
  {
    id: "90-day-planning-engine",
    title: "90-Day Planning Engine",
    category: "decision",
    useCase: "Creating a realistic 90-day AI activation plan",
    framework: "C.L.E.A.R",
    content: `C – CONTEXT:
This is a wellness organisation considering AI or advanced automation.

L – LENS:
Operate as a cautious transformation lead accountable to a board.

E – EXPECTATION:
Produce a realistic 90-day plan that improves decision quality before introducing AI.

A – ASSUMPTIONS:
Assume:
- Data is messy
- Teams are stretched
- Trust is fragile

R – RESPONSE FORMAT:
Return:

MONTH 1 – FOUNDATIONS
- Objectives
- Data clean-up actions
- Stop rules

MONTH 2 – ENGAGEMENT & SEGMENTATION
- Behaviour signals to track
- Journey hypotheses
- Validation criteria

MONTH 3 – MONETISATION EXPERIMENTS
- Low-risk tests
- Success thresholds
- What must NOT be automated yet`,
  },

  // ==========================================================================
  // WELLNESS-SPECIFIC DATA & ENGAGEMENT PROMPTS
  // ==========================================================================
  {
    id: "habit-outcome-mapping",
    title: "Habit → Outcome Map",
    category: "data",
    useCase: "Connecting behaviours to measurable outcomes",
    framework: "C.L.E.A.R",
    content: `C – CONTEXT:
We are designing engagement systems for a wellness product where long-term adherence matters.

L – LENS:
Behavioural science + commercial outcomes.

E – EXPECTATION:
Identify which habits actually drive value.

A – ASSUMPTIONS:
Do not assume:
- More engagement is always better
- Incentives are the answer

R – RESPONSE FORMAT:
Output a table:
- Habit / behaviour
- Frequency threshold
- Outcome influenced
- Revenue or retention impact
- Confidence level`,
  },
  {
    id: "meaningful-engagement-definition",
    title: "Meaningful Engagement Definition",
    category: "data",
    useCase: "Defining what engagement actually means for wellness",
    content: `PROMPT:
Which user behaviours genuinely indicate progress, habit formation, or commitment?

RULES:
- Exclude vanity metrics (likes, opens)
- Prioritise repeated actions over single events
- Tie behaviours to outcomes (retention, upsell, adherence)`,
  },
  {
    id: "drop-off-risk-detection",
    title: "Drop-Off & Risk Signal Detection",
    category: "data",
    useCase: "Identifying early warning signs of disengagement",
    content: `SYSTEM ROLE:
You identify early warning signs of disengagement in wellness behaviour.

INPUTS:
- Missed sessions
- Broken streaks
- Reduced frequency
- Behavioural inconsistency

OUTPUT:
- Risk flag (low / medium / high)
- Recommended intervention type
- Confidence level`,
  },

  // ==========================================================================
  // INTERVENTION & JOURNEY PROMPTS (C.L.E.A.R)
  // ==========================================================================
  {
    id: "intervention-ladder",
    title: "Intervention Ladder (Margin-Safe)",
    category: "intervention",
    useCase: "Choosing the right intervention without burning margin",
    framework: "C.L.E.A.R",
    content: `C – CONTEXT:
Users are disengaging from a wellness product.

L – LENS:
Margin protection and trust preservation.

E – EXPECTATION:
Recommend the lightest effective intervention.

A – ASSUMPTIONS:
Assume incentives are expensive and should be avoided early.

R – RESPONSE FORMAT:
Return a ranked ladder:
1. Timing adjustment (Cost: £0)
2. Relevance/content shift (Cost: £0)
3. Goal reframing (Cost: £0)
4. Social proof (Cost: £0)
5. Human touch (Cost: Low)
6. Incentive (Cost: High - only if justified)

Include: Which rung is appropriate now and why.`,
    whenNotToUse: "Skip when you already know the user needs high-touch support.",
  },
  {
    id: "journey-blueprint-builder",
    title: "Journey Blueprint (IF/THEN Logic)",
    category: "intervention",
    useCase: "Creating executable journey logic for dev teams",
    framework: "C.L.E.A.R",
    content: `C – CONTEXT:
We want to intervene when engagement drops.

L – LENS:
Operational automation, not marketing.

E – EXPECTATION:
Create logic that could be implemented by a dev team.

A – ASSUMPTIONS:
Assume incomplete data.

R – RESPONSE FORMAT:
Return logic in this format:
IF [condition]
AND [behaviour signal]
THEN [intervention]
BECAUSE [reason]

SUCCESS = [outcome measure]
FAILURE = [escalation path]`,
  },
  {
    id: "retention-intervention-logic",
    title: "Retention Intervention Logic",
    category: "intervention",
    useCase: "Reducing churn without increasing incentive cost",
    content: `SYSTEM ROLE:
You prioritise reducing churn without increasing incentive cost.

INPUTS:
- Habit score
- Missed activity count
- Historical churn windows

RULES:
- Prefer behavioural nudges over rewards
- Escalate to human only when confidence >70%
- Avoid over-messaging`,
  },
  {
    id: "re-engagement-journey",
    title: "Re-Engagement Journey Builder",
    category: "intervention",
    useCase: "Rebuilding momentum with disengaged users",
    content: `PROMPT:
If a user has disengaged, what is the smallest possible action that rebuilds momentum?

RULE:
Do not aim for full return immediately. Aim for consistency.`,
  },

  // ==========================================================================
  // MONETISATION & COMMERCIAL PROMPTS (C.L.E.A.R)
  // ==========================================================================
  {
    id: "cfo-translation-engine",
    title: "CFO Translation Engine",
    category: "commercial",
    useCase: "Explaining engagement to finance audiences",
    framework: "C.L.E.A.R",
    content: `C – CONTEXT:
We need to explain engagement impact to a finance audience.

L – LENS:
CFO / commercial director perspective.

E – EXPECTATION:
Translate behaviour into financial implications.

A – ASSUMPTIONS:
Use conservative assumptions. No hockey-stick growth.

R – RESPONSE FORMAT:
Return:
- Engagement behaviour
- Observed change
- Retention or LTV sensitivity
- Revenue impact (low / high range)
- Confidence rating`,
  },
  {
    id: "modelling-check",
    title: "Financial Modelling Stress Test",
    category: "commercial",
    useCase: "Validating financial model assumptions",
    framework: "C.L.E.A.R",
    content: `C – CONTEXT:
We are building a financial model based on engagement data.

L – LENS:
Risk-averse financial planning.

E – EXPECTATION:
Stress-test assumptions before presenting to board.

A – ASSUMPTIONS:
Assume user behaviour decays over time.

R – RESPONSE FORMAT:
Flag:
- Weak assumptions (likely to be wrong)
- Missing variables (not included but should be)
- Areas likely to be challenged by finance`,
  },
  {
    id: "engagement-revenue-translator",
    title: "Engagement → Revenue Translator",
    category: "commercial",
    useCase: "Connecting engagement to commercial outcomes",
    content: `PROMPT:
For each engagement behaviour, answer:

- Does this influence retention?
- Does it influence upsell?
- Does it influence partner value?

If influence is unclear, do not monetise yet.`,
  },
  {
    id: "partner-readiness-test",
    title: "Partner / Sponsor Readiness Test",
    category: "commercial",
    useCase: "Assessing whether data is sponsor-ready",
    content: `PROMPT:
Would a partner trust this data enough to pay for outcomes rather than exposure?

If no, identify what is missing.`,
  },

  // ==========================================================================
  // EXECUTION & GOVERNANCE PROMPTS
  // ==========================================================================
  {
    id: "90-day-priority-filter",
    title: "90-Day Priority Filter",
    category: "execution",
    useCase: "Focusing on high-impact, low-risk actions",
    content: `PROMPT:
Which actions deliver the highest commercial impact with the lowest execution risk in the next 90 days?

RULE:
Defer anything that requires perfect data or complex AI.`,
  },
  {
    id: "what-not-to-do",
    title: "What NOT to Do (Critical)",
    category: "execution",
    useCase: "Identifying attractive but harmful distractions",
    content: `PROMPT:
List actions that feel attractive but should be avoided right now.

RULE:
If an action increases complexity without improving decisions, park it.`,
    whenNotToUse: "Don't use when genuinely exploring new opportunities.",
  },
  {
    id: "board-ready-update",
    title: "Board-Ready Update Generator",
    category: "execution",
    useCase: "Summarising progress for executives",
    content: `SYSTEM ROLE:
You summarise progress for a board or executive audience.

FORMAT:
- What changed
- Why it matters commercially
- What we learned
- What we will do next

RULE:
One page. No jargon.`,
  },
  {
    id: "red-flag-register",
    title: "Red-Flag Register",
    category: "execution",
    useCase: "Tracking and surfacing failure patterns",
    content: `PROMPT:
Identify which of these failure patterns are present:

1. AI before decisions (implementing AI before clarifying what decisions need support)
2. Weak consent models (collecting data without clear, specific consent)
3. Scaling before trust (rolling out widely before validating in controlled tests)
4. Vanity over value (measuring engagement without commercial attribution)
5. Speed over governance (moving fast without documenting decisions and risks)

For each flag present, explain:
- Why this is a risk
- What to do about it`,
  },

  // ==========================================================================
  // REFLECTION & CONTINUOUS IMPROVEMENT
  // ==========================================================================
  {
    id: "monthly-decision-review",
    title: "Monthly Decision Review",
    category: "reflection",
    useCase: "Learning from past decisions",
    content: `PROMPT:
What decision did we make this month that would have been better with clearer data or insight?

ACTION:
Design the system to support that decision next time.`,
  },
  {
    id: "stack-usage-check",
    title: "Wellness Genius Stack Usage Check",
    category: "reflection",
    useCase: "Ensuring you're using the products in sequence",
    content: `CHECK YOUR PROGRESS:

1. AI Readiness Score → Have you established reality?
2. Build vs Buy → Have you chosen the right path?
3. Wellness AI Builder → Have you defined what to build?
4. Engagement Systems Playbook → Have you fixed engagement properly?
5. Engagement → Revenue Framework → Can you translate value commercially?
6. 90-Day Activation Playbook → Are you executing with discipline?

RULE:
If you've skipped steps, go back. Skipping increases risk and wasted effort.

CORE PRINCIPLE:
Clarity before tools. Behaviour before automation. Control before scale.`,
  },
];

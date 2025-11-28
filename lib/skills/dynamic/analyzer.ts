// Job Description Analyzer - AI-powered analysis engine

import type { JDAnalysis, SkillRecommendation } from '../../storage/types';

// System prompt for JD analysis
const JD_ANALYSIS_SYSTEM_PROMPT = `You are an expert job description analyzer. Your task is to deeply analyze job descriptions and extract structured information that will be used to generate AI-powered productivity skills.

You must respond with ONLY valid JSON (no markdown, no explanation, just the JSON object).

Analyze the job description and extract:

1. **Role Classification**: Title, department, seniority level, role type
2. **Responsibilities**: Each task with frequency and automation potential
3. **Tools & Platforms**: Software, platforms, and technologies mentioned or implied
4. **Workflows**: Identifiable business processes and their pain points
5. **Stakeholders**: Who this role interacts with
6. **Skills**: Technical, soft, and domain skills required
7. **Automation Opportunities**: Areas where AI could help automate or augment work

For automation potential, consider:
- HIGH: Repetitive, rule-based, data processing, document generation, analysis
- MEDIUM: Requires some judgment but follows patterns, communication tasks
- LOW: Highly creative, strategic, relationship-dependent

Output JSON Schema:
{
  "role": {
    "title": "string",
    "department": "string",
    "level": "Entry|Mid|Senior|Lead|Manager|Director|Executive",
    "type": "Analyst|Engineer|Designer|Marketing|Sales|Operations|Creative|Management|Other"
  },
  "responsibilities": [
    {
      "task": "string - specific responsibility",
      "frequency": "daily|weekly|monthly|quarterly|ad-hoc",
      "automationPotential": "high|medium|low",
      "category": "string - e.g., reporting, communication, analysis, documentation"
    }
  ],
  "toolsAndPlatforms": [
    {
      "name": "string",
      "category": "string - e.g., CRM, Analytics, Design, Database",
      "proficiencyRequired": "basic|intermediate|advanced"
    }
  ],
  "workflows": [
    {
      "name": "string - workflow name",
      "steps": ["string array of steps"],
      "painPoints": ["string array of potential inefficiencies"]
    }
  ],
  "stakeholders": [
    {
      "type": "string - e.g., executives, clients, team members",
      "interactionType": "string - e.g., presentations, reports, collaboration"
    }
  ],
  "skills": [
    {
      "name": "string",
      "category": "technical|soft|domain",
      "importance": "required|preferred|nice-to-have"
    }
  ],
  "automationOpportunities": [
    {
      "area": "string - area of work",
      "currentProcess": "string - how it's likely done now",
      "proposedSkill": "string - what AI skill could help",
      "impactEstimate": "string - estimated time/effort saved"
    }
  ]
}`;

// System prompt for skill recommendations
const SKILL_RECOMMENDATION_SYSTEM_PROMPT = `You are an AI skill architect. Based on a job description analysis, you will recommend 10 specific AI-powered skills that would be most valuable for someone in this role.

You must respond with ONLY valid JSON (no markdown, no explanation, just the JSON array).

Each skill should:
1. Address a specific, recurring task or workflow from the role
2. Have clear, measurable value (time saved, quality improved)
3. Be implementable as an AI prompt-based tool
4. Be distinct from other recommended skills

Skill Categories:
- automation: Automates repetitive tasks
- analysis: Analyzes data or content
- generation: Creates content, documents, or outputs
- optimization: Improves existing processes or content
- communication: Helps with stakeholder communication

Output JSON Schema (array of exactly 10 skills):
[
  {
    "id": "string - kebab-case-id",
    "name": "string - Display Name",
    "description": "string - One sentence description",
    "category": "automation|analysis|generation|optimization|communication",
    "automationPotential": "high|medium|low",
    "complexity": "simple|moderate|complex",
    "estimatedTimeSaved": "string - e.g., 2-3 hours per week",
    "valueProposition": "string - specific benefit statement"
  }
]

Prioritize skills by:
1. Highest time savings / impact
2. Most frequent use cases
3. Clear, actionable outputs
4. Realistic AI capabilities`;

export async function analyzeJobDescription(
  jobDescription: string,
  apiKey: string,
  provider: 'gemini' | 'claude'
): Promise<JDAnalysis> {
  const userPrompt = `Analyze this job description and extract structured information:\n\n${jobDescription}`;

  let responseText: string;

  if (provider === 'gemini') {
    responseText = await callGemini(apiKey, JD_ANALYSIS_SYSTEM_PROMPT, userPrompt);
  } else {
    responseText = await callClaude(apiKey, JD_ANALYSIS_SYSTEM_PROMPT, userPrompt);
  }

  // Parse JSON response
  try {
    const cleaned = cleanJsonResponse(responseText);
    return JSON.parse(cleaned) as JDAnalysis;
  } catch (error) {
    console.error('Failed to parse JD analysis:', error, responseText);
    throw new Error('Failed to parse job description analysis. Please try again.');
  }
}

export async function generateSkillRecommendations(
  jdAnalysis: JDAnalysis,
  originalJD: string,
  apiKey: string,
  provider: 'gemini' | 'claude'
): Promise<SkillRecommendation[]> {
  const userPrompt = `Based on this job description analysis, recommend 10 AI-powered skills that would be most valuable for this role.

## Original Job Description
${originalJD}

## Analysis Results
${JSON.stringify(jdAnalysis, null, 2)}

Generate exactly 10 skill recommendations as a JSON array.`;

  let responseText: string;

  if (provider === 'gemini') {
    responseText = await callGemini(apiKey, SKILL_RECOMMENDATION_SYSTEM_PROMPT, userPrompt);
  } else {
    responseText = await callClaude(apiKey, SKILL_RECOMMENDATION_SYSTEM_PROMPT, userPrompt);
  }

  // Parse JSON response
  try {
    const cleaned = cleanJsonResponse(responseText);
    const recommendations = JSON.parse(cleaned) as SkillRecommendation[];
    // Ensure we have exactly 10 (or at least some)
    return recommendations.slice(0, 10);
  } catch (error) {
    console.error('Failed to parse skill recommendations:', error, responseText);
    throw new Error('Failed to generate skill recommendations. Please try again.');
  }
}

// Helper to clean JSON from potential markdown wrapping
function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();

  // Remove markdown code blocks if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }

  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }

  return cleaned.trim();
}

// Gemini API call (non-streaming for JSON responses)
async function callGemini(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');

  console.log('Calling Gemini API with @google/generative-ai SDK...');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 8192,
    }
  });

  const text = result.response.text() || '';
  console.log('Gemini response length:', text.length);
  console.log('Gemini response preview:', text.substring(0, 500));

  return text;
}

// Claude API call (non-streaming for JSON responses)
async function callClaude(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

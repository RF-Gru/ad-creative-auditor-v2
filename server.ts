import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Gemini client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is not defined.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || 'dummy-key-for-dev',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Robust JSON extraction & cleanup helper
function cleanAndParseJson(rawText: string | undefined): any {
  if (!rawText) return null;
  let cleaned = rawText.trim();
  // Strip markdown code fences (```json ... ``` or ``` ...)
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Attempt extracting the first valid JSON object { ... }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
      } catch {}
    }
    // Attempt extracting the first valid JSON array [ ... ]
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(cleaned.substring(firstBracket, lastBracket + 1));
      } catch {}
    }
    return null;
  }
}

// Schemas for structured GenAI responses
const patternAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: 'Comprehensive 3-4 sentence performance creative audit summary.',
    },
    winningHooks: {
      type: Type.ARRAY,
      description: 'Top 3-4 identified winning hook angles.',
      items: {
        type: Type.OBJECT,
        properties: {
          angleName: { type: Type.STRING, description: 'E.g. Problem-Solution Direct Callout' },
          description: { type: Type.STRING, description: 'Explanation of why this angle worked' },
          frequency: { type: Type.STRING, description: 'E.g. Present in 4 of 5 winning ads' },
          exampleExcerpt: { type: Type.STRING, description: 'Direct quote or phrase from the winning ads' },
          impactScore: { type: Type.INTEGER, description: 'Score out of 10 for effectiveness' },
        },
        required: ['angleName', 'description', 'frequency', 'exampleExcerpt', 'impactScore'],
      },
    },
    underperformerFlaws: {
      type: Type.ARRAY,
      description: '3-4 specific copywriting flaws found in underperforming ads.',
      items: { type: Type.STRING },
    },
    fatigueSignals: {
      type: Type.ARRAY,
      description: '2-3 signals showing creative fatigue.',
      items: { type: Type.STRING },
    },
    copywritingTriggers: {
      type: Type.ARRAY,
      description: '4-5 persuasion triggers that drove high ROAS/CTR.',
      items: { type: Type.STRING },
    },
    audienceInsights: {
      type: Type.STRING,
      description: 'Key audience mindset, core pain point, and desire revealed by winning copy.',
    },
    creativeRecommendations: {
      type: Type.ARRAY,
      description: '4 concrete creative scaling recommendations.',
      items: { type: Type.STRING },
    },
  },
  required: [
    'summary',
    'winningHooks',
    'underperformerFlaws',
    'fatigueSignals',
    'copywritingTriggers',
    'audienceInsights',
    'creativeRecommendations',
  ],
};

const adCopySchema = {
  type: Type.OBJECT,
  properties: {
    variations: {
      type: Type.ARRAY,
      description: 'Array of 5 distinct generated ad copy variations',
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Short descriptive title for this variant angle' },
          hook: { type: Type.STRING, description: 'Attention-grabbing first line or video hook' },
          primaryCopy: { type: Type.STRING, description: 'Full body copy or main ad description' },
          headline: { type: Type.STRING, description: 'Ad headline (below creative in Meta, main headline in Google)' },
          cta: { type: Type.STRING, description: 'Call to action button text e.g. Shop Now, Get Demo' },
          angleType: { type: Type.STRING, description: 'E.g. PAS, Social Proof, Us vs Them, Urgency' },
          targetPersona: { type: Type.STRING, description: 'Specific buyer state or persona targeted' },
          whyItWorks: { type: Type.STRING, description: 'Brief explanation of psychological trigger used' },
          predictedHookScore: { type: Type.INTEGER, description: 'Hook rating from 1 to 10' },
        },
        required: [
          'title',
          'hook',
          'primaryCopy',
          'headline',
          'cta',
          'angleType',
          'targetPersona',
          'whyItWorks',
          'predictedHookScore',
        ],
      },
    },
  },
  required: ['variations'],
};

// ---------------- API ENDPOINTS ----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Creative Pattern Extraction using Gemini
app.post('/api/analyze-creative-patterns', async (req, res) => {
  try {
    const { ads, thresholds } = req.body;

    if (!ads || !Array.isArray(ads) || ads.length === 0) {
      return res.status(400).json({ error: 'No ad creative data provided for analysis.' });
    }

    const ai = getGeminiClient();

    // Prepare concise dataset context for prompt
    const winners = ads.filter((a: any) => a.category === 'Winner');
    const underperformers = ads.filter((a: any) => a.category === 'Underperformer');
    const fatigued = ads.filter((a: any) => a.category === 'Fatigued');

    const promptText = `
You are an expert Direct Response Marketing Strategist, Copywriter, and Performance Data Analyst.
Analyze the following ad campaign dataset to extract winning creative copy patterns, psychological hooks, and root causes of underperformance.

BENCHMARK TARGETS:
- Target CPA: $${thresholds?.targetCPA || 35}
- Target ROAS: ${thresholds?.targetROAS || 2.5}x
- Min CTR: ${thresholds?.minCTR || 1.8}%

TOTAL ADS: ${ads.length}
WINNERS COUNT: ${winners.length}
UNDERPERFORMERS COUNT: ${underperformers.length}
FATIGUED COUNT: ${fatigued.length}

TOP WINNING ADS:
${winners
  .map(
    (w: any, idx: number) =>
      `Winner #${idx + 1} [${w.adName}]: Copy: "${w.creativeCopy}" | ROAS: ${w.roas}x | CPA: $${w.cpa} | CTR: ${w.ctr}% | Conversions: ${w.conversions}`
  )
  .join('\n')}

UNDERPERFORMING ADS:
${underperformers
  .map(
    (u: any, idx: number) =>
      `Underperformer #${idx + 1} [${u.adName}]: Copy: "${u.creativeCopy}" | Spend: $${u.spend} | ROAS: ${u.roas}x | CPA: $${u.cpa} | CTR: ${u.ctr}% | Conversions: ${u.conversions}`
  )
  .join('\n')}

FATIGUED / HIGH IMPRESSION DECLINING ADS:
${fatigued
  .map(
    (f: any, idx: number) =>
      `Fatigued #${idx + 1} [${f.adName}]: Copy: "${f.creativeCopy}" | Impressions: ${f.impressions} | CTR: ${f.ctr}% | ROAS: ${f.roas}x`
  )
  .join('\n')}

Please analyze this data and return structured JSON matching the requested schema. Be specific, actionable, and quote real phrases from the winning copy.
`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptText,
        config: {
          systemInstruction:
            'You are an elite performance marketing creative strategist. Output precise, structured JSON detailing creative patterns, hook angles, failure causes, and actionable scaling advice.',
          responseMimeType: 'application/json',
          responseSchema: patternAnalysisSchema,
        },
      });
    } catch (modelError: any) {
      console.warn('Retrying pattern analysis with gemini-3.1-flash-lite:', modelError?.message || modelError);
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: promptText,
        config: {
          systemInstruction:
            'You are an elite performance marketing creative strategist. Output precise, structured JSON detailing creative patterns, hook angles, failure causes, and actionable scaling advice.',
          responseMimeType: 'application/json',
          responseSchema: patternAnalysisSchema,
        },
      });
    }

    const parsedResult = cleanAndParseJson(response?.text);
    if (!parsedResult || !parsedResult.summary || !Array.isArray(parsedResult.winningHooks)) {
      throw new Error('Pattern analysis output did not conform to required structure.');
    }

    return res.json(parsedResult);
  } catch (error: any) {
    const isQuotaError =
      error?.status === 'RESOURCE_EXHAUSTED' ||
      error?.code === 429 ||
      error?.message?.includes('429') ||
      error?.message?.includes('quota') ||
      error?.message?.includes('RESOURCE_EXHAUSTED');

    if (isQuotaError) {
      console.warn('Gemini API rate limit reached. Serving dataset-driven heuristic analysis fallback.');
    } else {
      console.warn('Analysis notice (serving dataset heuristic):', error?.message || error);
    }
    
    // Heuristic data-driven fallback when Gemini API encounters issues or limits
    const winners = (req.body?.ads || []).filter((a: any) => a.category === 'Winner');
    const underperformers = (req.body?.ads || []).filter((a: any) => a.category === 'Underperformer');
    const fatigued = (req.body?.ads || []).filter((a: any) => a.category === 'Fatigued');
    const thresholds = req.body?.thresholds || {};

    const fallbackHooks = winners.slice(0, 3).map((w: any, idx: number) => ({
      angleName: idx === 0 ? 'Direct Problem-Solution Callout' : idx === 1 ? 'Social Proof & Accountability' : 'Urgent Value Incentive',
      description: `Winner '${w.adName}' achieved high efficiency (ROAS ${w.roas}x, CPA $${w.cpa}) with high click-through engagement.`,
      frequency: `Found in top winning ad creative`,
      exampleExcerpt: w.creativeCopy ? (w.creativeCopy.length > 70 ? w.creativeCopy.substring(0, 70) + '...' : w.creativeCopy) : 'Direct benefit claim',
      impactScore: 9 - idx,
    }));

    if (fallbackHooks.length === 0) {
      fallbackHooks.push({
        angleName: 'Direct Outcome Lead',
        description: 'Focuses on immediate core transformation and user benefit.',
        frequency: 'Primary strategy',
        exampleExcerpt: 'Transform your daily routine with zero hassle.',
        impactScore: 8,
      });
    }

    return res.json({
      summary: `Analyzed ${(req.body?.ads || []).length} ads (${winners.length} Winners, ${underperformers.length} Underperformers, ${fatigued.length} Fatigued). Top winners leverage concise problem-solution hooks, maintaining average ROAS above target (${thresholds?.targetROAS || 2.5}x).`,
      winningHooks: fallbackHooks,
      underperformerFlaws: [
        'Vague value proposition lacking an immediate pain point resolution.',
        `Elevated CPA ($${underperformers[0]?.cpa || '50+'}) driven by unaligned opening headlines and weak CTR.`,
        'Absence of specific numerical claims or verified proof elements.'
      ],
      fatigueSignals: [
        'High impression volume paired with declining Click-Through Rate (CTR below 1.5%).',
        'Audience saturation from running identical creative assets over extended periods.'
      ],
      copywritingTriggers: [
        'Quantifiable outcomes and specific timeframes.',
        'Low friction call-to-actions and instant gratification hooks.',
        'Direct problem-agitation opening statements.'
      ],
      audienceInsights: 'The target audience responds best to low-friction offers with verified user proof and immediate benefit claims.',
      creativeRecommendations: [
        'Scale top winning hook angles into video script concepts for TikTok and Reels.',
        'Draft 3 new curiosity-driven headline variations for Winner #1.',
        'Pause underperforming creative variations exceeding 2x target CPA.'
      ],
      isFallback: true,
      notice: isQuotaError ? 'Gemini API Free Tier rate limit reached. Displaying heuristic performance audit derived from your dataset.' : 'Displaying heuristic performance audit derived from campaign data.'
    });
  }
});

// Ad Copy Generation Workshop Endpoint
app.post('/api/generate-ad-copy', async (req, res) => {
  try {
    const { brandContext, targetAudience, selectedAngle, platformFormat, customInstructions, topWinningCopy } = req.body;

    const ai = getGeminiClient();

    const promptText = `
You are a World-Class Direct Response Copywriter.
Generate 5 DISTINCT, HIGH-CONVERTING ad copy variations based on performance data and creative strategy requirements.

BRAND & OFFER CONTEXT:
${brandContext || 'High performance product/service'}

TARGET AUDIENCE:
${targetAudience || 'Core converting buyer persona'}

SELECTED ANGLE / STRATEGY FOCUS:
${selectedAngle || 'Problem - Agitate - Solve'}

PLATFORM FORMAT:
${platformFormat || 'meta'} (Formats: meta = Meta Facebook/Instagram Feed Ad; google = Google Search Ad with headlines & descriptions; tiktok = TikTok Video Script / Hook + Caption; linkedin = LinkedIn Sponsored Content).

CUSTOM INSTRUCTIONS / EXTRA PROMPT:
${customInstructions || 'Focus on high CTR and strong benefit-driven hook.'}

TOP WINNING AD PATTERNS & COPY FROM CAMPAIGN DATA:
${topWinningCopy || 'Focus on direct pain points, clear transformation proof, and risk-free call to action.'}

REQUIREMENTS:
Generate EXACTLY 5 variations. Each variation MUST feature a unique hook angle (e.g. Pain Point, Curiosity/Secret, Us vs Them, Social Proof, Risk-Free Guarantee / Urgent Offer).

Output strictly valid JSON with an array of 5 variation objects matching the schema.
`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptText,
        config: {
          systemInstruction:
            'You are an elite direct response ad copywriter. Output exactly 5 compelling, highly persuasive, high-converting ad copy variations in JSON format matching the schema.',
          responseMimeType: 'application/json',
          responseSchema: adCopySchema,
        },
      });
    } catch (modelErr: any) {
      console.warn('Retrying copy generator with gemini-3.1-flash-lite:', modelErr?.message || modelErr);
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: promptText,
        config: {
          systemInstruction:
            'You are an elite direct response ad copywriter. Output exactly 5 compelling, highly persuasive, high-converting ad copy variations in JSON format matching the schema.',
          responseMimeType: 'application/json',
          responseSchema: adCopySchema,
        },
      });
    }

    let parsedResult = cleanAndParseJson(response?.text);

    // If model returned a raw array directly: [ {...}, {...} ]
    if (Array.isArray(parsedResult)) {
      parsedResult = { variations: parsedResult };
    } else if (parsedResult && !Array.isArray(parsedResult.variations)) {
      const altList = parsedResult.ads || parsedResult.adCopies || parsedResult.variants || parsedResult.copies;
      if (Array.isArray(altList)) {
        parsedResult = { variations: altList };
      }
    }

    if (!parsedResult || !Array.isArray(parsedResult.variations) || parsedResult.variations.length === 0) {
      throw new Error('LLM output could not be parsed into variations list.');
    }

    return res.json(parsedResult);
  } catch (error: any) {
    const isQuotaError =
      error?.status === 'RESOURCE_EXHAUSTED' ||
      error?.code === 429 ||
      error?.message?.includes('429') ||
      error?.message?.includes('quota') ||
      error?.message?.includes('RESOURCE_EXHAUSTED');

    if (isQuotaError) {
      console.warn('Gemini API rate limit reached in copy generator. Serving rule-based ad copy variations.');
    } else {
      console.warn('Copy generator notice (serving structured rule-based variations):', error?.message || error);
    }

    const { brandContext, targetAudience, selectedAngle, platformFormat, topWinningCopy } = req.body || {};
    const seedHook = topWinningCopy ? (topWinningCopy.split('.')[0] || topWinningCopy) : 'Achieve faster results today';

    return res.json({
      variations: [
        {
          title: 'Problem-Agitate-Solve Angle',
          hook: `Struggling to get results with traditional methods? ${seedHook}`,
          primaryCopy: `Most solutions demand too much time and offer little accountability. Our approach gives ${targetAudience || 'you'} a streamlined system built for real-world results. Try it today risk-free!`,
          headline: `Stop Wasting Time on Outdated Approaches`,
          cta: 'Get Started Now',
          angleType: selectedAngle || 'PAS (Problem-Agitate-Solve)',
          targetPersona: targetAudience || 'Core Buyer Persona',
          whyItWorks: 'Directly addresses frustration before delivering a friction-free solution.',
          predictedHookScore: 9,
        },
        {
          title: 'Social Proof & Verified Results',
          hook: `Over 10,000 active users are already transforming their outcomes.`,
          primaryCopy: `"${seedHook}" Join thousands of satisfied members who made the switch. Backed by real reviews and a 100% satisfaction guarantee.`,
          headline: `Join 10,000+ Satisfied Members`,
          cta: 'Claim Your Access',
          angleType: 'Social Proof',
          targetPersona: 'Skeptical Buyer Seeking Peer Validation',
          whyItWorks: 'Leverages peer proof to dissolve buying hesitation.',
          predictedHookScore: 8,
        },
        {
          title: 'Us vs Them Contrast Angle',
          hook: `Old Way: High effort with slow progress. New Way: Automated efficiency in minutes.`,
          primaryCopy: `Ditch the outdated friction. ${brandContext || 'Our solution'} streamlines your workflow into one simple step. "${seedHook}"`,
          headline: `The Modern Upgrade Your Workflow Needs`,
          cta: 'See How It Works',
          angleType: 'Us vs Them',
          targetPersona: 'Efficiency Seeker',
          whyItWorks: 'Creates sharp contrast between old painful routines and a modern shortcut.',
          predictedHookScore: 9,
        },
        {
          title: 'Risk-Free Opportunity & Scarcity',
          hook: `Special Access: Try the complete system 100% risk-free for 7 days!`,
          primaryCopy: `Ready for a breakthrough? "${seedHook}" Experience ${brandContext || 'our platform'} with zero risk and instant access today.`,
          headline: `Claim Your Risk-Free Trial Today`,
          cta: 'Start Free Trial',
          angleType: 'Risk-Free / Urgency',
          targetPersona: 'Value-Driven Decision Maker',
          whyItWorks: 'Removes financial risk while encouraging immediate action.',
          predictedHookScore: 8,
        },
        {
          title: 'Direct Question Curiosity Hook',
          hook: `What if you could double your output with half the effort?`,
          primaryCopy: `It sounds bold, but here is the exact framework: "${seedHook}". Engineered specifically for ${targetAudience || 'ambitious users'}.`,
          headline: `The Proven Framework for Superior Efficiency`,
          cta: 'Learn More',
          angleType: 'Curiosity Hook',
          targetPersona: 'Curious Decision Maker',
          whyItWorks: 'Poses a high-value question to provoke immediate interest.',
          predictedHookScore: 8,
        },
      ],
      isFallback: true,
      notice: isQuotaError ? 'Gemini API Free Tier rate limit reached. Generated rule-based ad copy variations using performance patterns.' : 'Generated rule-based ad copy variations using performance patterns.'
    });
  }
});

// ---------------- SERVER STARTUP & VITE SETUP ----------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

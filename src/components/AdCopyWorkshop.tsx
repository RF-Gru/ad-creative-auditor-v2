import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, Wand2, Smartphone, LayoutGrid, Layers, Share2, ThumbsUp, MessageSquare, Bookmark, ExternalLink, RefreshCw, Star, Download, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GeneratedAdCopy, AdGeneratorConfig } from '../types';

interface AdCopyWorkshopProps {
  initialBrandContext?: string;
  initialWinningCopy?: string;
}

export const AdCopyWorkshop: React.FC<AdCopyWorkshopProps> = ({
  initialBrandContext = '',
  initialWinningCopy = '',
}) => {
  const [config, setConfig] = useState<AdGeneratorConfig>({
    brandContext: initialBrandContext || 'DTC Skincare Brand selling organic peptide serum that restores clear glow in 7 days.',
    targetAudience: 'Women aged 25-45 looking for anti-aging skincare solutions without harsh chemicals.',
    selectedAngle: 'Problem - Agitate - Solve (PAS)',
    platformFormat: 'meta',
    customInstructions: initialWinningCopy ? `Incorporate winning hook pattern: "${initialWinningCopy}"` : 'Emphasize fast results, social proof, and risk-free guarantee.',
  });

  const [loadedWinningSeed, setLoadedWinningSeed] = useState<string>(initialWinningCopy);

  useEffect(() => {
    if (initialWinningCopy) {
      setLoadedWinningSeed(initialWinningCopy);
      setConfig((prev) => ({
        ...prev,
        customInstructions: `Incorporate winning hook pattern: "${initialWinningCopy}"`,
      }));
    }
  }, [initialWinningCopy]);

  useEffect(() => {
    if (initialBrandContext) {
      setConfig((prev) => ({
        ...prev,
        brandContext: initialBrandContext,
      }));
    }
  }, [initialBrandContext]);

  const [variations, setVariations] = useState<GeneratedAdCopy[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewPlatform, setPreviewPlatform] = useState<'meta' | 'google' | 'tiktok' | 'linkedin'>('meta');
  const [savedVariations, setSavedVariations] = useState<GeneratedAdCopy[]>([]);

  const angles = [
    'Problem - Agitate - Solve (PAS)',
    'Before - After - Bridge (BAB)',
    'Social Proof & UGC Review Style',
    'Us vs. Them Direct Comparison',
    'Curiosity Gap & Secret Hook',
    'Urgent Offer & Risk-Free Guarantee',
  ];

  const generateAdCopy = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-ad-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandContext: config.brandContext,
          targetAudience: config.targetAudience,
          selectedAngle: config.selectedAngle,
          platformFormat: config.platformFormat,
          customInstructions: config.customInstructions,
          topWinningCopy: initialWinningCopy,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate ad copy.');
      }

      const data = await response.json();
      const rawList = Array.isArray(data)
        ? data
        : (Array.isArray(data?.variations)
            ? data.variations
            : (Array.isArray(data?.ads) ? data.ads : []));

      if (rawList && rawList.length > 0) {
        const varsWithIds = rawList.map((v: any, idx: number) => ({
          ...v,
          id: `var-${idx + 1}-${Date.now().toString(36)}`,
          format: config.platformFormat,
        }));
        setVariations(varsWithIds);
        setPreviewPlatform(config.platformFormat);

        // Trigger subtle celebration confetti
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.7 },
        });
      } else {
        throw new Error('Unable to parse ad copy variations. Please retry.');
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err?.message || 'Error executing AI ad copy generator.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const toggleSaveVariation = (v: GeneratedAdCopy) => {
    if (savedVariations.some((s) => s.id === v.id)) {
      setSavedVariations(savedVariations.filter((s) => s.id !== v.id));
    } else {
      setSavedVariations([...savedVariations, v]);
    }
  };

  const exportCopiesToCSV = () => {
    if (variations.length === 0) return;
    const headers = [
      'Variant Number',
      'Classification Level',
      'Diagnosis Notes & Strategy',
      'Angle Type',
      'Title',
      'Headline/Hook',
      'Primary Copy',
      'Call to Action (CTA)',
      'Target Persona',
      'Predicted Hook Score (Out of 10)',
      'Platform Format'
    ];

    const escapeCSV = (str: string | number) => {
      const val = String(str ?? '').replace(/"/g, '""');
      return `"${val}"`;
    };

    const rows = variations.map((v, index) => [
      index + 1,
      `AI Generated Copy Variation ${index + 1}`,
      v.whyItWorks || 'Engineered from top-performing hook angles and persuasion triggers',
      v.angleType,
      v.title,
      v.headline || v.hook,
      v.primaryCopy,
      v.cta,
      v.targetPersona,
      v.predictedHookScore,
      config.platformFormat
    ]);

    const csvContent = [headers.map(escapeCSV).join(','), ...rows.map(r => r.map(escapeCSV).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `generated_ai_ad_copies_${config.platformFormat}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-indigo-600 rounded-lg text-white shadow-2xs">
                <Wand2 className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                AI Ad Copy Generator Workshop
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Generate 5 high-converting ad copy variations engineered from your winning campaign patterns.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Format:</span>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              {(['meta', 'google', 'tiktok', 'linkedin'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setConfig({ ...config, platformFormat: fmt })}
                  className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all cursor-pointer ${
                    config.platformFormat === fmt
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Seeded Winning Copy Indicator Banner */}
        {loadedWinningSeed && (
          <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between text-xs text-indigo-900 shadow-2xs">
            <div className="flex items-center space-x-2 overflow-hidden">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="font-semibold shrink-0">Seeded Winner Copy Pattern:</span>
              <span className="truncate italic text-indigo-800">"{loadedWinningSeed}"</span>
            </div>
            <button
              onClick={() => {
                setLoadedWinningSeed('');
                setConfig(prev => ({ ...prev, customInstructions: 'Emphasize fast results, social proof, and risk-free guarantee.' }));
              }}
              className="ml-2 p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100 rounded-md transition-colors cursor-pointer shrink-0"
              title="Clear seeded winning copy"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {/* Brand & Offer Context */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Product / Brand Context
            </label>
            <textarea
              value={config.brandContext}
              onChange={(e) => setConfig({ ...config, brandContext: e.target.value })}
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              placeholder="E.g., Organic Peptide Serum that restores clear skin glow in 7 days..."
            />
          </div>

          {/* Target Audience Persona */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Audience & Persona
            </label>
            <textarea
              value={config.targetAudience}
              onChange={(e) => setConfig({ ...config, targetAudience: e.target.value })}
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              placeholder="E.g., Women aged 25-45 looking for clear skin without harsh chemical peels..."
            />
          </div>

          {/* Angle Strategy Focus */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Angle Strategy Focus
            </label>
            <select
              value={config.selectedAngle}
              onChange={(e) => setConfig({ ...config, selectedAngle: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white cursor-pointer"
            >
              {angles.map((ang) => (
                <option key={ang} value={ang}>
                  {ang}
                </option>
              ))}
            </select>

            <label className="block text-xs font-semibold text-slate-700 mt-2 mb-1">
              Custom Prompt / Winning Directives
            </label>
            <input
              type="text"
              value={config.customInstructions}
              onChange={(e) => setConfig({ ...config, customInstructions: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              placeholder="E.g. Include 20% discount code, emphasize 60-day money back guarantee"
            />
          </div>
        </div>

        {/* Submit Generation Button */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={generateAdCopy}
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2.5 px-6 rounded-lg shadow-xs transition-all cursor-pointer text-xs"
          >
            <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Generating 5 Ad Variations...' : 'Generate 5 AI Ad Copy Variations'}</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
          <span>Error generating ad copy: {error}</span>
          <button
            onClick={generateAdCopy}
            className="px-3 py-1 bg-rose-600 text-white rounded font-bold cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Generated Variations List */}
      {variations.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span>5 AI-Generated Ad Copy Variations</span>
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200 font-bold">
                  Ready for Campaign Launch
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Click "Copy to Clipboard" to instantly paste into Meta Ads Manager, Google Ads, or TikTok.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Export Copies Button */}
              <button
                onClick={exportCopiesToCSV}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
                title="Download generated ad copy variations as CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Copies CSV</span>
              </button>

              {/* Platform Preview Mode Selector */}
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 px-2 font-medium">Preview Mode:</span>
                {(['meta', 'google', 'tiktok', 'linkedin'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPreviewPlatform(mode)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase transition-all cursor-pointer ${
                      previewPlatform === mode
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {variations.map((item, idx) => {
              const fullFormattedText = `[HEADLINE / HOOK]\n${item.headline || item.hook}\n\n[PRIMARY COPY]\n${item.primaryCopy}\n\n[CALL TO ACTION]\n${item.cta}`;
              const isSaved = savedVariations.some((s) => s.id === item.id);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 relative group hover:border-indigo-300 transition-all"
                >
                  {/* Top Header */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white font-bold text-xs">
                          Variant #{idx + 1}
                        </span>
                        <span className="px-2 py-0.5 text-[11px] font-bold bg-slate-100 text-indigo-700 rounded border border-slate-200">
                          {item.angleType}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Hook Score: {item.predictedHookScore}/10
                        </span>
                        <button
                          onClick={() => toggleSaveVariation(item)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            isSaved
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:text-slate-800'
                          }`}
                          title="Save to favorites"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 italic mb-3">
                      Target Persona: {item.targetPersona}
                    </p>

                    {/* PLATFORM MOCKUP PREVIEW */}
                    {previewPlatform === 'meta' && (
                      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3 font-sans">
                        {/* Meta Header */}
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                            Ad
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">Your Brand Page</p>
                            <p className="text-[10px] text-slate-500">Sponsored • 🌐</p>
                          </div>
                        </div>

                        {/* Primary Copy */}
                        <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                          {item.primaryCopy}
                        </p>

                        {/* Meta Card Bottom Banner */}
                        <div className="bg-white rounded-lg p-3 border border-slate-200 flex items-center justify-between">
                          <div className="flex-1 pr-2">
                            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">yourbrand.com</p>
                            <p className="text-xs font-bold text-slate-900 line-clamp-1">{item.headline || item.hook}</p>
                          </div>
                          <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded">
                            {item.cta}
                          </span>
                        </div>
                      </div>
                    )}

                    {previewPlatform === 'google' && (
                      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-1.5 font-sans">
                        <div className="flex items-center space-x-1 text-[11px] text-slate-500">
                          <span className="font-bold text-slate-900">Sponsored</span>
                          <span>•</span>
                          <span className="text-slate-600">https://www.yourbrand.com</span>
                        </div>
                        <p className="text-sm font-bold text-indigo-600 hover:underline cursor-pointer">
                          {item.headline || item.hook} | Official Site
                        </p>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {item.primaryCopy}
                        </p>
                      </div>
                    )}

                    {previewPlatform === 'tiktok' && (
                      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2">
                        <div className="bg-indigo-50 p-2.5 rounded-lg border border-indigo-200 text-xs text-indigo-900">
                          <span className="font-bold uppercase text-[10px] text-indigo-700 block mb-0.5">🎬 Video Script / Hook:</span>
                          "{item.hook}"
                        </div>
                        <p className="text-xs text-slate-700">{item.primaryCopy}</p>
                        <div className="pt-2 flex justify-end">
                          <span className="px-3 py-1 bg-pink-600 text-white text-xs font-bold rounded-full">
                            {item.cta} ➔
                          </span>
                        </div>
                      </div>
                    )}

                    {previewPlatform === 'linkedin' && (
                      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded bg-sky-700 flex items-center justify-center text-white font-bold text-xs">
                            in
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">Company Name</p>
                            <p className="text-[10px] text-slate-500">Promoted</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-700 whitespace-pre-line">{item.primaryCopy}</p>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-900">{item.headline || item.hook}</span>
                          <span className="px-3 py-1 bg-sky-600 text-white text-xs font-bold rounded">
                            {item.cta}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Why it works trigger explanation */}
                    <div className="mt-3 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="font-bold text-indigo-700">💡 Psychological Trigger: </span>
                      {item.whyItWorks}
                    </div>
                  </div>

                  {/* Copy Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <button
                      onClick={() => copyToClipboard(item.primaryCopy, `${item.id}-body`)}
                      className="text-xs text-slate-600 hover:text-slate-900 flex items-center space-x-1 font-medium transition-colors cursor-pointer"
                    >
                      {copiedId === `${item.id}-body` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Body Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Body Text</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => copyToClipboard(fullFormattedText, `${item.id}-full`)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer"
                    >
                      {copiedId === `${item.id}-full` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Ad Package Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Full Ad Package</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

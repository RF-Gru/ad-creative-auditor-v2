import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Flame, ShieldAlert, Target, CheckCircle2, ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react';
import { AdCreative, BenchmarkThresholds, PatternAnalysisResult } from '../types';

interface CreativePatternAnalysisProps {
  ads: AdCreative[];
  thresholds: BenchmarkThresholds;
  onSelectWinningCopyForGenerator?: (winningCopyText: string) => void;
}

export const CreativePatternAnalysis: React.FC<CreativePatternAnalysisProps> = ({
  ads,
  thresholds,
  onSelectWinningCopyForGenerator,
}) => {
  const [analysis, setAnalysis] = useState<PatternAnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [lastSignature, setLastSignature] = useState<string>('');

  const runAnalysis = async () => {
    if (ads.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-creative-patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ads, thresholds }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to extract creative patterns from Gemini');
      }

      const data: PatternAnalysisResult = await response.json();
      setAnalysis(data);
    } catch (err: any) {
      console.warn('Analysis execution note:', err?.message || err);
      setError(err?.message || 'Error executing Gemini pattern analysis.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-trigger analysis whenever ads dataset signature changes
  const adsSignature = ads.map((a) => `${a.id}_${a.category}`).join('|');
  useEffect(() => {
    if (ads.length > 0 && adsSignature !== lastSignature) {
      setLastSignature(adsSignature);
      runAnalysis();
    }
  }, [adsSignature]);

  if (ads.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Gemini Creative Pattern Audit & Hook Extraction
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated AI audit of copywriting structures, psychological angles, and scaling recommendations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Analyzing...' : 'Re-Run Audit'}</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse AI Audit' : 'Expand AI Audit'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Notice Banner when Fallback active */}
      {analysis?.notice && isExpanded && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{analysis.notice}</span>
          </div>
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer shrink-0 ml-2"
          >
            Retry AI
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && isExpanded && (
        <div className="py-8 text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-50 text-indigo-600 rounded-xl animate-pulse">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-slate-700">
            Analyzing winning hook patterns and diagnostic flaws with Gemini...
          </p>
        </div>
      )}

      {/* Error View */}
      {error && !loading && isExpanded && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center justify-between">
          <span>Analysis notice: {error}</span>
          <button
            onClick={runAnalysis}
            className="px-2.5 py-1 bg-rose-600 text-white rounded font-medium cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content Grid */}
      {analysis && !loading && isExpanded && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1">
          {/* Left Column (7 cols): Summary & Winning Hooks */}
          <div className="lg:col-span-7 space-y-5">
            {/* Executive Summary */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block mb-1">
                Strategic Performance Summary
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {analysis.summary}
              </p>
            </div>

            {/* Winning Hooks */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-emerald-600" />
                  <span>Winning Hook Patterns</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {analysis.winningHooks?.length || 0} angles extracted
                </span>
              </div>

              <div className="space-y-2.5">
                {analysis.winningHooks?.map((hook, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">
                          #{index + 1}
                        </span>
                        <h4 className="font-semibold text-slate-900 text-xs">
                          {hook.angleName}
                        </h4>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                        Score {hook.impactScore}/10
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">{hook.description}</p>

                    <div className="bg-white p-2 rounded border border-slate-200 text-xs italic text-slate-600">
                      "{hook.exampleExcerpt}"
                    </div>

                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-[11px] text-slate-500 font-medium">
                        {hook.frequency}
                      </span>
                      {onSelectWinningCopyForGenerator && (
                        <button
                          onClick={() => onSelectWinningCopyForGenerator(`${hook.angleName}: "${hook.exampleExcerpt}"`)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Use in Ad Copy Workshop</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Flaws, Triggers, Recommendations */}
          <div className="lg:col-span-5 space-y-4">
            {/* Copy Flaws */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Underperformer Copy Flaws</span>
              </span>
              <div className="space-y-1.5 text-xs text-slate-600">
                {analysis.underperformerFlaws?.map((flaw, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 bg-white p-2 rounded border border-slate-200">
                    <span className="text-rose-500 font-bold shrink-0">•</span>
                    <span>{flaw}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Persuasion Triggers */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-600" />
                <span>Conversion Triggers</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {analysis.copywritingTriggers?.map((trigger, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded text-[11px] font-medium bg-white text-slate-700 border border-slate-200"
                  >
                    {trigger}
                  </span>
                ))}
              </div>
            </div>

            {/* Scaling Action Plan */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Scaling Action Recommendations</span>
              </span>
              <div className="space-y-1.5 text-xs text-slate-600">
                {analysis.creativeRecommendations?.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 bg-white p-2 rounded border border-slate-200">
                    <span className="text-indigo-600 font-bold shrink-0">{idx + 1}.</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

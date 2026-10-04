import React, { useState } from 'react';
import { DollarSign, TrendingUp, Target, Award, ShoppingCart, Zap, BarChart3, PieChart as PieIcon, Sparkles } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';
import { AdCreative, BenchmarkThresholds } from '../types';

interface KPIDiagnosticOverviewProps {
  ads: AdCreative[];
  thresholds: BenchmarkThresholds;
  onOpenThresholds: () => void;
}

export const KPIDiagnosticOverview: React.FC<KPIDiagnosticOverviewProps> = ({
  ads,
  thresholds,
  onOpenThresholds,
}) => {
  if (ads.length === 0) return null;

  // Aggregate Calculations
  const totalSpend = ads.reduce((acc, a) => acc + a.spend, 0);
  const totalConversions = ads.reduce((acc, a) => acc + a.conversions, 0);
  const totalRevenue = ads.reduce((acc, a) => acc + a.revenue, 0);
  const totalImpressions = ads.reduce((acc, a) => acc + a.impressions, 0);
  const totalClicks = ads.reduce((acc, a) => acc + a.clicks, 0);

  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const overallCPA = totalConversions > 0 ? totalSpend / totalConversions : totalSpend;
  const overallROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  const winnerCount = ads.filter((a) => a.category === 'Winner').length;
  const winRate = ads.length > 0 ? Math.round((winnerCount / ads.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
            Executive KPI Stat Cards
          </h2>
          <p className="text-xs text-slate-500">
            High-level performance summary across all {ads.length} analyzed creatives
          </p>
        </div>
      </div>

      {/* Section 1: Executive KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Total Spend */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium text-slate-500">Total Spend</span>
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 tabular-nums">
            ${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 tabular-nums truncate">
            {totalImpressions.toLocaleString()} impr · {totalClicks.toLocaleString()} clicks
          </p>
        </div>

        {/* Card 2: Avg CTR */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium text-slate-500">Avg CTR</span>
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 tabular-nums">
            {avgCTR.toFixed(2)}%
          </p>
          <div className="mt-1">
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-medium tabular-nums ${
                avgCTR >= thresholds.minCTR
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              Target: {thresholds.minCTR}%
            </span>
          </div>
        </div>

        {/* Card 3: Avg CPA */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium text-slate-500">Avg CPA</span>
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
              <Target className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 tabular-nums">
            ${overallCPA.toFixed(2)}
          </p>
          <div className="mt-1">
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-medium tabular-nums ${
                overallCPA <= thresholds.targetCPA
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              Target: ${thresholds.targetCPA.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Card 4: Overall ROAS */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium text-slate-500">Overall ROAS</span>
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 tabular-nums">
            {overallROAS.toFixed(2)}x
          </p>
          <div className="mt-1">
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-medium tabular-nums ${
                overallROAS >= thresholds.targetROAS
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              Target: {thresholds.targetROAS}x
            </span>
          </div>
        </div>

        {/* Card 5: Winning Ads Count */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium text-slate-500">Winning Ads</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold text-emerald-700 tabular-nums">
            {winnerCount}{' '}
            <span className="text-xs font-normal text-slate-400">/ {ads.length}</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1 tabular-nums">
            {winRate}% Win Rate
          </p>
        </div>

        {/* Card 6: Total Conversions */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium text-slate-500">Total Conversions</span>
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
              <ShoppingCart className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 tabular-nums">
            {totalConversions.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 tabular-nums truncate">
            ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 })} Revenue
          </p>
        </div>
      </div>
    </div>
  );
};

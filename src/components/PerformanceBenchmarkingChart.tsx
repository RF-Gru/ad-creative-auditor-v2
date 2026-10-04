import React, { useState } from 'react';
import { BarChart3, TrendingUp, Sliders, Sparkles, Award, AlertTriangle, BatteryLow, Flame, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';
import { AdCreative, BenchmarkThresholds } from '../types';

interface PerformanceBenchmarkingChartProps {
  ads: AdCreative[];
  thresholds: BenchmarkThresholds;
  onOpenThresholds: () => void;
  onSendToWorkshop?: (copyText: string) => void;
}

export const PerformanceBenchmarkingChart: React.FC<PerformanceBenchmarkingChartProps> = ({
  ads,
  thresholds,
  onOpenThresholds,
  onSendToWorkshop,
}) => {
  const [activeTab, setActiveTab] = useState<'roasCpa' | 'spendConv' | 'tiers'>('roasCpa');

  if (ads.length === 0) return null;

  const winnerCount = ads.filter((a) => a.category === 'Winner').length;
  const underperformerCount = ads.filter((a) => a.category === 'Underperformer').length;
  const fatiguedCount = ads.filter((a) => a.category === 'Fatigued').length;
  const moderateCount = ads.filter((a) => a.category === 'Moderate').length;

  const chartData = ads.map((a) => ({
    name: a.adName.length > 16 ? a.adName.substring(0, 16) + '...' : a.adName,
    fullAdName: a.adName,
    roas: a.roas,
    cpa: a.cpa,
    spend: a.spend,
    conversions: a.conversions,
    ctr: a.ctr,
    category: a.category,
    copy: a.creativeCopy,
  }));

  const pieData = [
    { name: 'Winners', value: winnerCount, color: '#10b981' },
    { name: 'Moderate', value: moderateCount, color: '#3b82f6' },
    { name: 'Underperformers', value: underperformerCount, color: '#ef4444' },
    { name: 'Fatigued', value: fatiguedCount, color: '#f59e0b' },
  ].filter((d) => d.value > 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span>Visual Performance Distribution & Benchmarking</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate ROAS vs. CPA efficiency against account benchmark targets ($ {thresholds.targetCPA} CPA · {thresholds.targetROAS}x ROAS)
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('roasCpa')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'roasCpa'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ROAS vs CPA
          </button>

          <button
            onClick={() => setActiveTab('spendConv')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'spendConv'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Spend vs Conversions
          </button>

          <button
            onClick={() => setActiveTab('tiers')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'tiers'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tier Breakdown
          </button>
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'roasCpa' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={11}
                angle={-15}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke="#059669"
                fontSize={11}
                tickFormatter={(v) => `${v}x`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#e11d48"
                fontSize={11}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-lg text-slate-900 space-y-1">
                        <p className="font-bold text-slate-900">{data.fullAdName}</p>
                        <p className="text-emerald-700 font-semibold tabular-nums">
                          ROAS: {data.roas}x (Target: {thresholds.targetROAS}x)
                        </p>
                        <p className="text-rose-700 font-semibold tabular-nums">
                          CPA: ${data.cpa} (Target: ${thresholds.targetCPA})
                        </p>
                        <p className="text-slate-500 tabular-nums">
                          CTR: {data.ctr}% · Conversions: {data.conversions} · Spend: ${data.spend}
                        </p>
                        <div className="pt-1 flex items-center justify-between gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              data.category === 'Winner'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : data.category === 'Underperformer'
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : data.category === 'Fatigued'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {data.category}
                          </span>
                          {onSendToWorkshop && data.copy && (
                            <button
                              onClick={() => onSendToWorkshop(data.copy)}
                              className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline"
                            >
                              Use in Workshop →
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar yAxisId="left" dataKey="roas" name="ROAS (x)" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.category === 'Winner'
                        ? '#059669'
                        : entry.category === 'Underperformer'
                        ? '#e11d48'
                        : entry.category === 'Fatigued'
                        ? '#d97706'
                        : '#3b82f6'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          ) : activeTab === 'spendConv' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} angle={-15} textAnchor="end" interval={0} />
              <YAxis yAxisId="left" orientation="left" stroke="#4f46e5" fontSize={11} tickFormatter={(v) => `$${v}`} />
              <YAxis yAxisId="right" orientation="right" stroke="#0284c7" fontSize={11} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-lg text-slate-900">
                        <p className="font-bold text-slate-900 mb-1">{data.fullAdName}</p>
                        <p className="text-indigo-700 font-semibold tabular-nums">Spend: ${data.spend}</p>
                        <p className="text-sky-700 font-semibold tabular-nums">Conversions: {data.conversions}</p>
                        <p className="text-slate-500 tabular-nums">CPA: ${data.cpa}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar yAxisId="left" dataKey="spend" name="Spend ($)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="conversions" name="Conversions" fill="#0284c7" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Benchmarking Legend & Guidance */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            <span>Winners ({winnerCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            <span>Moderate ({moderateCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
            <span>Underperformers ({underperformerCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Fatigued ({fatiguedCount})</span>
          </div>
        </div>

        <button
          onClick={onOpenThresholds}
          className="text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer inline-flex items-center gap-1"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Edit Benchmark Targets</span>
        </button>
      </div>
    </div>
  );
};

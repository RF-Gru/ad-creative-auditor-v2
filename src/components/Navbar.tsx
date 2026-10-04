import React from 'react';
import { Sparkles, Sliders } from 'lucide-react';
import { DatasetPreset } from '../types';
import { SAMPLE_DATASETS } from '../data/sampleDatasets';

interface NavbarProps {
  currentPresetId: string | null;
  onSelectPreset: (preset: DatasetPreset) => void;
  onOpenThresholds: () => void;
  hasData: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPresetId,
  onSelectPreset,
  onOpenThresholds,
  hasData,
}) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-base tracking-tight text-slate-900">
            Ad Creative Auditor
          </span>
        </div>

        {/* Zone 2: Navigation Links (visible when data is loaded) */}
        {hasData ? (
          <nav className="hidden md:flex items-center space-x-6 text-xs font-medium text-slate-600">
            <button
              onClick={() => scrollToSection('kpi-overview-section')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              KPI Overview
            </button>
            <button
              onClick={() => scrollToSection('performance-chart-section')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Benchmarking
            </button>
            <button
              onClick={() => scrollToSection('ad-directory-section')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Creative Directory
            </button>
            <button
              onClick={() => scrollToSection('ad-copy-workshop')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Copy Workshop
            </button>
          </nav>
        ) : (
          <div className="hidden sm:block text-xs text-slate-400">
            Campaign Data Cleaner, Diagnostics & Creative Generator
          </div>
        )}

        {/* Zone 3: Actions */}
        <div className="flex items-center space-x-2.5">
          {/* Preset Selector Dropdown */}
          <select
            value={currentPresetId || ''}
            onChange={(e) => {
              const preset = SAMPLE_DATASETS.find((p) => p.id === e.target.value);
              if (preset) onSelectPreset(preset);
            }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium py-1.5 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
          >
            <option value="" disabled>
              ⚡ Load Demo Data...
            </option>
            {SAMPLE_DATASETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>

          {/* Benchmarks Trigger */}
          <button
            onClick={onOpenThresholds}
            className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium py-1.5 px-3 rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            title="Adjust CPA, ROAS & CTR benchmark thresholds"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Benchmarks</span>
          </button>
        </div>
      </div>
    </header>
  );
};

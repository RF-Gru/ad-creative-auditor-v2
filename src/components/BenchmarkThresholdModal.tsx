import React, { useState } from 'react';
import { X, Sliders, Check } from 'lucide-react';
import { BenchmarkThresholds } from '../types';

interface BenchmarkThresholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  thresholds: BenchmarkThresholds;
  onSave: (newThresholds: BenchmarkThresholds) => void;
}

export const BenchmarkThresholdModal: React.FC<BenchmarkThresholdModalProps> = ({
  isOpen,
  onClose,
  thresholds,
  onSave,
}) => {
  const [targetCPA, setTargetCPA] = useState(thresholds.targetCPA);
  const [targetROAS, setTargetROAS] = useState(thresholds.targetROAS);
  const [minCTR, setMinCTR] = useState(thresholds.minCTR);
  const [minConversionsForWinner, setMinConversionsForWinner] = useState(thresholds.minConversionsForWinner);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      targetCPA: Number(targetCPA) || 35,
      targetROAS: Number(targetROAS) || 2.5,
      minCTR: Number(minCTR) || 1.8,
      minConversionsForWinner: Number(minConversionsForWinner) || 3,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-xl relative space-y-5 animate-in fade-in zoom-in duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Benchmark Target Rules</h3>
            <p className="text-xs text-slate-500">Configure parameters used to classify Winners and Underperformers.</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Target CPA ($)
            </label>
            <input
              type="number"
              step="0.5"
              value={targetCPA}
              onChange={(e) => setTargetCPA(parseFloat(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-semibold text-sm tabular-nums"
            />
            <p className="text-[11px] text-slate-400 mt-1">Maximum acceptable cost per conversion</p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Target ROAS (x)
            </label>
            <input
              type="number"
              step="0.1"
              value={targetROAS}
              onChange={(e) => setTargetROAS(parseFloat(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-semibold text-sm tabular-nums"
            />
            <p className="text-[11px] text-slate-400 mt-1">Minimum Return On Ad Spend required for Winners</p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Minimum Benchmark CTR (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={minCTR}
              onChange={(e) => setMinCTR(parseFloat(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-semibold text-sm tabular-nums"
            />
            <p className="text-[11px] text-slate-400 mt-1">Base Click-Through Rate expectation</p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Min Conversions for Winner Classification
            </label>
            <input
              type="number"
              value={minConversionsForWinner}
              onChange={(e) => setMinConversionsForWinner(parseInt(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-semibold text-sm tabular-nums"
            />
            <p className="text-[11px] text-slate-400 mt-1">Ensures statistical significance before declaring a Winner</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end space-x-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply Benchmarks</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { X, Copy, Check, ArrowRight } from 'lucide-react';
import { AdCreative } from '../types';

interface AdDetailModalProps {
  ad: AdCreative | null;
  onClose: () => void;
  onSendToWorkshop: (copyText: string) => void;
}

export const AdDetailModal: React.FC<AdDetailModalProps> = ({
  ad,
  onClose,
  onSendToWorkshop,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!ad) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(ad.creativeCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 shadow-xl relative space-y-5 animate-in fade-in zoom-in duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ad Title & Category Badge */}
        <div className="flex items-start justify-between pr-8">
          <div>
            <span
              className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-md mb-2 border ${
                ad.category === 'Winner'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : ad.category === 'Underperformer'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : ad.category === 'Fatigued'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {ad.category}
            </span>
            <h3 className="text-base font-bold text-slate-900">{ad.adName}</h3>
          </div>
        </div>

        {/* Categorization Rationale */}
        {ad.categoryReason && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed">
            <span className="font-semibold text-indigo-700">Diagnosis: </span>
            {ad.categoryReason}
          </div>
        )}

        {/* Creative Copy Text */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Creative Copy</span>
            <button
              onClick={handleCopy}
              className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 font-semibold cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Copy'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed">{ad.creativeCopy}</p>
        </div>

        {/* Key Performance Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium block mb-0.5">Spend</span>
            <span className="font-bold text-slate-900 text-sm tabular-nums">${ad.spend.toFixed(2)}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium block mb-0.5">ROAS</span>
            <span className="font-bold text-emerald-700 text-sm tabular-nums">{ad.roas.toFixed(2)}x</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium block mb-0.5">CPA</span>
            <span className="font-bold text-slate-900 text-sm tabular-nums">${ad.cpa.toFixed(2)}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium block mb-0.5">CTR</span>
            <span className="font-bold text-slate-900 text-sm tabular-nums">{ad.ctr.toFixed(2)}%</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium block mb-0.5">Conversions</span>
            <span className="font-bold text-slate-900 text-sm tabular-nums">{ad.conversions}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium block mb-0.5">Revenue</span>
            <span className="font-bold text-slate-900 text-sm tabular-nums">${ad.revenue.toFixed(2)}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium block mb-0.5">Impressions</span>
            <span className="font-bold text-slate-900 text-sm tabular-nums">{ad.impressions.toLocaleString()}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium block mb-0.5">Clicks</span>
            <span className="font-bold text-slate-900 text-sm tabular-nums">{ad.clicks.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end space-x-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => {
              onSendToWorkshop(ad.creativeCopy);
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <span>Iterate in Ad Copy Workshop</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

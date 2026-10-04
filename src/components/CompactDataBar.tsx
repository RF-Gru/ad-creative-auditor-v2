import React, { useRef } from 'react';
import { FileSpreadsheet, ShieldCheck, RefreshCw, Download, Trash2, Sliders } from 'lucide-react';

interface CompactDataBarProps {
  currentFileName: string | null;
  healthScore: number | null;
  adsCount: number;
  onFileUpload: (content: string, fileName: string) => void;
  onExportCSV: () => void;
  onOpenThresholds: () => void;
  onClearData: () => void;
}

export const CompactDataBar: React.FC<CompactDataBarProps> = ({
  currentFileName,
  healthScore,
  adsCount,
  onFileUpload,
  onExportCSV,
  onOpenThresholds,
  onClearData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          onFileUpload(content, file.name);
        }
      };
      reader.readAsText(file);
    }
    // Reset input so same file can be uploaded again if needed
    if (e.target) {
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
      {/* Hidden file input for Replace CSV */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Left: Metadata Badges */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        {/* File Name Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 font-semibold border border-slate-200">
          <FileSpreadsheet className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="truncate max-w-[200px] sm:max-w-[300px]">
            {currentFileName || 'Campaign_Export.csv'}
          </span>
          <span className="text-slate-400 font-normal tabular-nums">
            ({adsCount} creatives)
          </span>
        </div>

        {/* Health Score Badge */}
        {healthScore !== null && (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold border ${
              healthScore >= 80
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
            title="CSV Data Quality & Normalization Score"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="tabular-nums">Health Score: {healthScore}/100</span>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        {/* Benchmarks Trigger */}
        <button
          onClick={onOpenThresholds}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
          title="Adjust target CPA, ROAS, and CTR thresholds"
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-600" />
          <span>Benchmarks</span>
        </button>

        {/* Replace CSV Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
          title="Upload a new CSV file to replace current campaign data"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Replace CSV</span>
        </button>

        {/* Export CSV Button */}
        <button
          onClick={onExportCSV}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
          title="Export cleaned dataset with calculated metrics & diagnosis"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600" />
          <span>Export CSV</span>
        </button>

        {/* Reset / Unload Button */}
        <button
          onClick={onClearData}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          title="Unload current data and return to dropzone"
          aria-label="Unload data"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

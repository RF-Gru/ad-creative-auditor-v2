import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Download, Sparkles } from 'lucide-react';
import { DatasetPreset } from '../types';
import { SAMPLE_DATASETS } from '../data/sampleDatasets';

interface FileUploadAreaProps {
  onFileUpload: (csvContent: string, fileName: string) => void;
  onSelectPreset: (preset: DatasetPreset) => void;
}

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  onFileUpload,
  onSelectPreset,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      alert('Please upload a valid CSV file (.csv format).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onFileUpload(content, file.name);
      }
    };
    reader.readAsText(file);
  };

  const downloadSampleTemplate = () => {
    const template = `Ad Name,Creative Copy,Headline,CTA,Spend,Impressions,Clicks,Conversions,Revenue
"Ad_01_PainPoint","Stop wasting time on manual ad optimizations! Automate your workflow in 3 clicks.","Automate Workflow","Start Free",450.00,18500,620,18,1620.00
"Ad_02_SocialProof","Over 10,000 top e-commerce brands trust us daily. See why users rate us 4.9/5 stars!","Rated 4.9/5 Stars","Try Now",380.00,14200,480,12,1080.00
"Ad_03_Generic","Improve efficiency across your digital marketing campaigns with modern AI software.","Modern Solutions","Learn More",520.00,21000,290,2,180.00`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_raw_ad_campaign.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[68vh] flex flex-col items-center justify-center py-10 px-4">
      {/* Centered Modern Drag-and-Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full max-w-xl bg-white border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all shadow-xs group ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/40 scale-[1.01]'
            : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-5 border border-indigo-100 group-hover:scale-105 transition-transform shadow-2xs">
          <Upload className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
          Upload Your Campaign CSV
        </h2>

        <p className="text-sm text-slate-500 mb-6">
          Supports Meta, Google, and TikTok exports
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            Browse Computer
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              downloadSampleTemplate();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Sample Template</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400 mt-5">
          Missing CPA and ROAS will be calculated automatically upon upload.
        </p>
      </div>

      {/* Subtle Pill Buttons Underneath */}
      <div className="mt-8 flex flex-col items-center space-y-3">
        <span className="text-xs font-medium text-slate-400 tracking-wide">
          Or test with an instant demo dataset:
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={() => onSelectPreset(SAMPLE_DATASETS[0])}
            className="px-4 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
          >
            <span>DTC Skincare</span>
            <span className="text-[10px] text-slate-400">({SAMPLE_DATASETS[0].adCount} ads)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectPreset(SAMPLE_DATASETS[1])}
            className="px-4 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
          >
            <span>B2B SaaS</span>
            <span className="text-[10px] text-slate-400">({SAMPLE_DATASETS[1].adCount} ads)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectPreset(SAMPLE_DATASETS[2])}
            className="px-4 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
          >
            <span>Fitness App</span>
            <span className="text-[10px] text-slate-400">({SAMPLE_DATASETS[2].adCount} ads)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

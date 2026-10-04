/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { FileUploadArea } from './components/FileUploadArea';
import { CompactDataBar } from './components/CompactDataBar';
import { KPIDiagnosticOverview } from './components/KPIDiagnosticOverview';
import { PerformanceBenchmarkingChart } from './components/PerformanceBenchmarkingChart';
import { CreativePatternAnalysis } from './components/CreativePatternAnalysis';
import { AdCreativeTable } from './components/AdCreativeTable';
import { AdCopyWorkshop } from './components/AdCopyWorkshop';
import { AdDetailModal } from './components/AdDetailModal';
import { BenchmarkThresholdModal } from './components/BenchmarkThresholdModal';

import { AdCreative, BenchmarkThresholds, CleaningSummary, DatasetPreset } from './types';
import { cleanAndParseCSV, DEFAULT_THRESHOLDS, exportAdsToCSV } from './utils/csvCleaner';
import { SAMPLE_DATASETS } from './data/sampleDatasets';

export default function App() {
  const [thresholds, setThresholds] = useState<BenchmarkThresholds>(DEFAULT_THRESHOLDS);
  const [csvRawContent, setCsvRawContent] = useState<string>('');
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [currentPresetId, setCurrentPresetId] = useState<string | null>(null);

  const [ads, setAds] = useState<AdCreative[]>([]);
  const [summary, setSummary] = useState<CleaningSummary | null>(null);

  const [selectedAdForDetail, setSelectedAdForDetail] = useState<AdCreative | null>(null);
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState<boolean>(false);
  const [workshopSeedCopy, setWorkshopSeedCopy] = useState<string>('');

  // Process raw CSV when uploaded or when thresholds change
  const processCSVData = (content: string, fileName: string, currentThresh = thresholds) => {
    setCsvRawContent(content);
    setCurrentFileName(fileName);

    const { ads: cleanedAds, summary: cleanSummary } = cleanAndParseCSV(content, currentThresh);
    setAds(cleanedAds);
    setSummary(cleanSummary);
  };

  const handleFileUpload = (content: string, fileName: string) => {
    setCurrentPresetId(null);
    processCSVData(content, fileName);
  };

  const handleSelectPreset = (preset: DatasetPreset) => {
    setCurrentPresetId(preset.id);
    processCSVData(preset.csvContent, `${preset.name}.csv`);
  };

  const handleSaveThresholds = (newThresholds: BenchmarkThresholds) => {
    setThresholds(newThresholds);
    if (csvRawContent) {
      processCSVData(csvRawContent, currentFileName || 'campaign_data.csv', newThresholds);
    }
  };

  const handleExportCSV = () => {
    if (ads.length === 0) return;
    const csvOutput = exportAdsToCSV(ads);
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cleaned_${currentFileName || 'ad_campaign'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSendToWorkshop = (copyText: string) => {
    setWorkshopSeedCopy(copyText);
    const workshopEl = document.getElementById('ad-copy-workshop');
    if (workshopEl) {
      workshopEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleClearData = () => {
    setCsvRawContent('');
    setCurrentFileName(null);
    setCurrentPresetId(null);
    setAds([]);
    setSummary(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white pb-20">
      {/* Top Header Navbar */}
      <Navbar
        currentPresetId={currentPresetId}
        onSelectPreset={handleSelectPreset}
        onOpenThresholds={() => setIsThresholdModalOpen(true)}
        hasData={ads.length > 0}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* State 1: When no CSV is loaded -> Centered Drag-and-Drop Zone */}
        {ads.length === 0 ? (
          <FileUploadArea
            onFileUpload={handleFileUpload}
            onSelectPreset={handleSelectPreset}
          />
        ) : (
          /* State 2: When data is loaded -> Dashboard with 4-Section Logical Flow */
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Sleek, Compact Top Sub-Bar */}
            <CompactDataBar
              currentFileName={currentFileName}
              healthScore={summary ? summary.healthScore : null}
              adsCount={ads.length}
              onFileUpload={handleFileUpload}
              onExportCSV={handleExportCSV}
              onOpenThresholds={() => setIsThresholdModalOpen(true)}
              onClearData={handleClearData}
            />

            {/* Section 1: Executive KPI Stat Cards */}
            <section id="kpi-overview-section">
              <KPIDiagnosticOverview
                ads={ads}
                thresholds={thresholds}
                onOpenThresholds={() => setIsThresholdModalOpen(true)}
              />
            </section>

            {/* Section 2: Visual Performance Distribution & Benchmarking Chart */}
            <section id="performance-chart-section" className="space-y-6">
              <PerformanceBenchmarkingChart
                ads={ads}
                thresholds={thresholds}
                onOpenThresholds={() => setIsThresholdModalOpen(true)}
                onSendToWorkshop={handleSendToWorkshop}
              />

              {/* Gemini AI Creative Pattern Audit & Hook Extraction */}
              <CreativePatternAnalysis
                ads={ads}
                thresholds={thresholds}
                onSelectWinningCopyForGenerator={handleSendToWorkshop}
              />
            </section>

            {/* Section 3: Ad Creative Performance Directory Table */}
            <section id="ad-directory-section">
              <AdCreativeTable
                ads={ads}
                onSelectAd={(ad) => setSelectedAdForDetail(ad)}
                onSendToWorkshop={handleSendToWorkshop}
              />
            </section>

            {/* Section 4: AI Ad Copy Generator Workshop (Final Actionable Step at Bottom) */}
            <section id="ad-copy-workshop">
              <AdCopyWorkshop
                initialWinningCopy={workshopSeedCopy}
                initialBrandContext={
                  ads.length > 0
                    ? `Campaign: ${currentFileName || 'Campaign Data'}. Direct response creative optimization.`
                    : undefined
                }
              />
            </section>
          </div>
        )}
      </main>

      {/* Ad Detail Modal */}
      <AdDetailModal
        ad={selectedAdForDetail}
        onClose={() => setSelectedAdForDetail(null)}
        onSendToWorkshop={handleSendToWorkshop}
      />

      {/* Benchmark Threshold Rules Modal */}
      <BenchmarkThresholdModal
        isOpen={isThresholdModalOpen}
        onClose={() => setIsThresholdModalOpen(false)}
        thresholds={thresholds}
        onSave={handleSaveThresholds}
      />
    </div>
  );
}

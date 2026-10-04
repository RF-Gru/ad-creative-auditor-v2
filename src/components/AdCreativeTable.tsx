import React, { useState } from 'react';
import { Search, ArrowUpDown, Eye, Copy, Check, Sparkles } from 'lucide-react';
import { AdCategory, AdCreative } from '../types';

interface AdCreativeTableProps {
  ads: AdCreative[];
  onSelectAd: (ad: AdCreative) => void;
  onSendToWorkshop: (copyText: string) => void;
}

export const AdCreativeTable: React.FC<AdCreativeTableProps> = ({
  ads,
  onSelectAd,
  onSendToWorkshop,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortField, setSortField] = useState<keyof AdCreative>('roas');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (ads.length === 0) return null;

  // Filter ads
  const filteredAds = ads.filter((ad) => {
    const matchesSearch =
      ad.adName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.creativeCopy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || ad.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort ads
  const sortedAds = [...filteredAds].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];

    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    }
    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return 0;
  });

  const handleSort = (field: keyof AdCreative) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
      {/* Table Header Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Ad Creative Performance Directory
            </h2>
            <span className="text-xs text-slate-500 font-medium tabular-nums">
              ({filteredAds.length} creatives)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Search, filter, and inspect detailed unit economics for each creative variation
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search copy or name..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 overflow-x-auto">
            {['ALL', 'Winner', 'Underperformer', 'Fatigued', 'Moderate'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'ALL'
                  ? 'All'
                  : cat === 'Winner'
                  ? 'Winners'
                  : cat === 'Underperformer'
                  ? 'Underperformers'
                  : cat === 'Fatigued'
                  ? 'Fatigued'
                  : 'Moderate'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
            <tr>
              <th className="p-3">Ad Name</th>
              <th className="p-3 max-w-sm">Creative Copy</th>
              <th
                className="p-3 text-right cursor-pointer hover:text-slate-900 select-none"
                onClick={() => handleSort('spend')}
              >
                <div className="inline-flex items-center gap-1 justify-end">
                  <span>Spend</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="p-3 text-right cursor-pointer hover:text-slate-900 select-none"
                onClick={() => handleSort('ctr')}
              >
                <div className="inline-flex items-center gap-1 justify-end">
                  <span>CTR</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="p-3 text-right cursor-pointer hover:text-slate-900 select-none"
                onClick={() => handleSort('cpa')}
              >
                <div className="inline-flex items-center gap-1 justify-end">
                  <span>CPA</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="p-3 text-right cursor-pointer hover:text-slate-900 select-none"
                onClick={() => handleSort('roas')}
              >
                <div className="inline-flex items-center gap-1 justify-end">
                  <span>ROAS</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="p-3 text-right cursor-pointer hover:text-slate-900 select-none"
                onClick={() => handleSort('conversions')}
              >
                <div className="inline-flex items-center gap-1 justify-end">
                  <span>Conv</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-3 text-center">Category</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {sortedAds.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-500 text-xs">
                  No creatives match the specified search query or category filter.
                </td>
              </tr>
            ) : (
              sortedAds.map((ad) => (
                <tr key={ad.id} className="hover:bg-slate-50/80 transition-colors group">
                  {/* Ad Name */}
                  <td className="p-3">
                    <p className="font-semibold text-slate-900 line-clamp-1 max-w-[140px] sm:max-w-[180px]">
                      {ad.adName}
                    </p>
                  </td>

                  {/* Creative Copy Excerpt */}
                  <td className="p-3 max-w-sm">
                    <p className="line-clamp-2 text-slate-600 text-xs leading-relaxed">
                      "{ad.creativeCopy}"
                    </p>
                  </td>

                  {/* Numeric Data with tabular-nums and right alignment */}
                  <td className="p-3 text-right font-medium text-slate-900 tabular-nums">
                    ${ad.spend.toFixed(2)}
                  </td>
                  <td className="p-3 text-right font-medium text-slate-900 tabular-nums">
                    {ad.ctr.toFixed(2)}%
                  </td>
                  <td className="p-3 text-right font-medium text-slate-900 tabular-nums">
                    ${ad.cpa.toFixed(2)}
                  </td>
                  <td className="p-3 text-right font-bold text-emerald-700 tabular-nums">
                    {ad.roas.toFixed(2)}x
                  </td>
                  <td className="p-3 text-right font-medium text-slate-900 tabular-nums">
                    {ad.conversions}
                  </td>

                  {/* Category Status */}
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded whitespace-nowrap ${
                        ad.category === 'Winner'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : ad.category === 'Underperformer'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : ad.category === 'Fatigued'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {ad.category}
                    </span>
                  </td>

                  {/* Row Actions */}
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => onSendToWorkshop(ad.creativeCopy)}
                        className="px-2 py-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors cursor-pointer inline-flex items-center gap-1"
                        title="Use in Ad Copy Workshop below"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span className="hidden lg:inline">Use in Workshop</span>
                      </button>

                      <button
                        onClick={() => copyText(ad.creativeCopy, ad.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                        title="Copy ad text"
                      >
                        {copiedId === ad.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => onSelectAd(ad)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                        title="Inspect full creative breakdown"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

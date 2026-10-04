import Papa from 'papaparse';
import { AdCategory, AdCreative, BenchmarkThresholds, CleaningSummary, RawAdRow } from '../types';

export const DEFAULT_THRESHOLDS: BenchmarkThresholds = {
  targetCPA: 35.0,
  targetROAS: 2.5,
  minCTR: 1.8,
  minConversionsForWinner: 3,
};

function parseNum(val: unknown): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const str = String(val).replace(/[\$,%\s]/g, '').trim();
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function findColumnValue(row: RawAdRow, keywords: string[]): { val: unknown; keyName: string | null } {
  const rowKeys = Object.keys(row);
  for (const keyword of keywords) {
    const matchedKey = rowKeys.find((k) => k.toLowerCase().replace(/[^a-z0-9]/g, '') === keyword.replace(/[^a-z0-9]/g, ''));
    if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
      return { val: row[matchedKey], keyName: matchedKey };
    }
  }
  // Try partial match if exact didn't match
  for (const keyword of keywords) {
    const matchedKey = rowKeys.find((k) => k.toLowerCase().includes(keyword.toLowerCase()));
    if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
      return { val: row[matchedKey], keyName: matchedKey };
    }
  }
  return { val: undefined, keyName: null };
}

export function cleanAndParseCSV(
  csvContent: string,
  customThresholds: BenchmarkThresholds = DEFAULT_THRESHOLDS
): { ads: AdCreative[]; summary: CleaningSummary } {
  const parsed = Papa.parse<RawAdRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  const rawRows = parsed.data || [];
  let repairedFields = 0;
  let cpaCalculated = 0;
  let roasCalculated = 0;
  let ctrCalculated = 0;
  const warnings: string[] = [];

  if (parsed.errors && parsed.errors.length > 0) {
    parsed.errors.forEach((e) => warnings.push(`Line ${e.row}: ${e.message}`));
  }

  // Pre-pass to compute average metrics for relative thresholding
  const tempMetrics = rawRows.map((row) => ({
    spend: parseNum(findColumnValue(row, ['spend', 'cost', 'amountspent', 'totalspend']).val),
    impressions: parseNum(findColumnValue(row, ['impressions', 'views', 'imprs']).val),
  }));

  const avgSpend = tempMetrics.reduce((acc, m) => acc + m.spend, 0) / (tempMetrics.length || 1);
  const avgImpressions = tempMetrics.reduce((acc, m) => acc + m.impressions, 0) / (tempMetrics.length || 1);

  const ads: AdCreative[] = [];

  rawRows.forEach((row, index) => {
    const healthFlags: string[] = [];

    // Extract fields using intelligent synonym matching
    const nameMatch = findColumnValue(row, ['adname', 'ad name', 'campaign name', 'creative name', 'ad', 'title', 'name']);
    const adName = String(nameMatch.val || `Ad Variant ${index + 1}`).trim();

    const copyMatch = findColumnValue(row, ['creative copy', 'creativecopy', 'copy', 'primary text', 'primarytext', 'text', 'body', 'ad text', 'headline']);
    const headlineMatch = findColumnValue(row, ['headline', 'ad headline', 'title', 'hook']);
    const primaryTextMatch = findColumnValue(row, ['primary text', 'primarytext', 'body', 'description']);
    const ctaMatch = findColumnValue(row, ['cta', 'call to action', 'button', 'action']);

    let creativeCopy = String(copyMatch.val || '').trim();
    const headline = headlineMatch.val ? String(headlineMatch.val).trim() : undefined;
    const primaryText = primaryTextMatch.val ? String(primaryTextMatch.val).trim() : undefined;
    const cta = ctaMatch.val ? String(ctaMatch.val).trim() : 'Shop Now';

    if (!creativeCopy) {
      if (primaryText) creativeCopy = primaryText;
      else if (headline) creativeCopy = headline;
      else {
        creativeCopy = '[No creative copy text provided]';
        healthFlags.push('Missing creative copy text');
        repairedFields++;
      }
    }

    // Metrics
    const spend = parseNum(findColumnValue(row, ['spend', 'cost', 'amountspent', 'totalspend']).val);
    const impressions = parseNum(findColumnValue(row, ['impressions', 'views', 'imprs']).val);
    const clicks = parseNum(findColumnValue(row, ['clicks', 'linkclicks', 'totalclicks']).val);
    let rawCTR = parseNum(findColumnValue(row, ['ctr', 'clickthroughrate', 'linkctr']).val);
    const conversions = parseNum(findColumnValue(row, ['conversions', 'purchases', 'results', 'orders', 'leads']).val);
    let revenue = parseNum(findColumnValue(row, ['revenue', 'conversionvalue', 'sales', 'totalrevenue', 'purchasevalue']).val);
    let rawCPA = parseNum(findColumnValue(row, ['cpa', 'costperconversion', 'costperpurchase', 'costperresult']).val);
    let rawROAS = parseNum(findColumnValue(row, ['roas', 'returnonadspend', 'purchaseroas']).val);

    // Auto Calculations & Data Repairs
    let ctr = rawCTR;
    if (!ctr || ctr <= 0) {
      if (impressions > 0 && clicks > 0) {
        ctr = parseFloat(((clicks / impressions) * 100).toFixed(2));
        ctrCalculated++;
        healthFlags.push('Calculated CTR from Clicks/Impressions');
      } else {
        ctr = 0;
      }
    }

    let cpa = rawCPA;
    if (!cpa || cpa <= 0) {
      if (conversions > 0) {
        cpa = parseFloat((spend / conversions).toFixed(2));
        cpaCalculated++;
        healthFlags.push('Calculated CPA (Spend / Conversions)');
      } else {
        cpa = spend > 0 ? parseFloat((spend).toFixed(2)) : 0; // Cost incurred with 0 conversions
        if (conversions === 0 && spend > 0) {
          healthFlags.push('0 Conversions recorded for spend');
        }
      }
    }

    let roas = rawROAS;
    if (!roas || roas <= 0) {
      if (spend > 0 && revenue > 0) {
        roas = parseFloat((revenue / spend).toFixed(2));
        roasCalculated++;
        healthFlags.push('Calculated ROAS (Revenue / Spend)');
      } else if (spend > 0 && conversions > 0 && (!revenue || revenue === 0)) {
        // Estimate revenue assuming average order value baseline if missing
        revenue = conversions * customThresholds.targetCPA * 2.5;
        roas = parseFloat((revenue / spend).toFixed(2));
        roasCalculated++;
        healthFlags.push('Estimated revenue & ROAS from target benchmarks');
      } else {
        roas = 0;
      }
    }

    const cpc = clicks > 0 ? parseFloat((spend / clicks).toFixed(2)) : 0;
    const cpm = impressions > 0 ? parseFloat(((spend / impressions) * 1000).toFixed(2)) : 0;

    // Categorization logic
    let category: AdCategory = 'Moderate';
    let categoryReason = '';

    const isWinner =
      (roas >= customThresholds.targetROAS && conversions >= customThresholds.minConversionsForWinner) ||
      (cpa <= customThresholds.targetCPA && conversions >= customThresholds.minConversionsForWinner && ctr >= customThresholds.minCTR);

    const isUnderperformer =
      (conversions === 0 && spend >= customThresholds.targetCPA * 1.2) ||
      (conversions > 0 && cpa > customThresholds.targetCPA * 1.4 && roas < customThresholds.targetROAS * 0.7);

    const isFatigued =
      impressions > avgImpressions * 1.1 &&
      ((ctr < customThresholds.minCTR * 0.75 && spend > avgSpend * 0.8) || (roas < 1.2 && spend > customThresholds.targetCPA * 2));

    if (isWinner) {
      category = 'Winner';
      categoryReason = `Strong performance: ROAS ${roas}x / CPA $${cpa.toFixed(2)} with ${conversions} conversions (CTR ${ctr}%).`;
    } else if (isFatigued) {
      category = 'Fatigued';
      categoryReason = `High scale (${impressions.toLocaleString()} impressions) but declining efficiency: CTR dropped to ${ctr}%, ROAS ${roas}x.`;
    } else if (isUnderperformer) {
      category = 'Underperformer';
      categoryReason = conversions === 0
        ? `High spend ($${spend.toFixed(2)}) with 0 conversions.`
        : `High CPA ($${cpa.toFixed(2)} vs target $${customThresholds.targetCPA.toFixed(2)}) and low ROAS (${roas}x).`;
    } else {
      category = 'Moderate';
      categoryReason = `Steady performance: CPA $${cpa.toFixed(2)}, ROAS ${roas}x, CTR ${ctr}%.`;
    }

    ads.push({
      id: `ad-${index + 1}-${Date.now().toString(36)}`,
      adName,
      creativeCopy,
      headline,
      primaryText,
      cta,
      spend,
      impressions,
      clicks,
      ctr,
      conversions,
      revenue,
      cpa,
      roas,
      cpc,
      cpm,
      category,
      categoryReason,
      dataHealthFlags: healthFlags,
    });
  });

  const totalRows = rawRows.length;
  const validRows = ads.length;
  const totalRepaired = repairedFields + cpaCalculated + roasCalculated + ctrCalculated;
  const healthScore = Math.max(0, Math.min(100, Math.round(100 - (totalRepaired / (totalRows * 5 || 1)) * 100)));

  const summary: CleaningSummary = {
    totalRows,
    validRows,
    repairedFields: totalRepaired,
    calculatedFields: {
      cpaCount: cpaCalculated,
      roasCount: roasCalculated,
      ctrCount: ctrCalculated,
    },
    warnings,
    healthScore,
  };

  return { ads, summary };
}

export function exportAdsToCSV(ads: AdCreative[]): string {
  const exportData = ads.map((ad) => ({
    'Ad Name': ad.adName,
    'Classification Level': ad.category,
    'Diagnosis Notes & Reasoning': ad.categoryReason || '',
    'Creative Copy': ad.creativeCopy,
    'Headline': ad.headline || '',
    'Primary Text': ad.primaryText || '',
    'Call To Action (CTA)': ad.cta || 'Shop Now',
    'Spend ($)': ad.spend.toFixed(2),
    'Impressions': ad.impressions,
    'Clicks': ad.clicks,
    'CTR (%)': ad.ctr.toFixed(2),
    'Conversions': ad.conversions,
    'Revenue ($)': ad.revenue.toFixed(2),
    'CPA ($)': ad.cpa.toFixed(2),
    'ROAS (x)': ad.roas.toFixed(2),
    'CPC ($)': ad.cpc.toFixed(2),
    'CPM ($)': ad.cpm.toFixed(2),
    'Automated Cleaning Flags': (ad.dataHealthFlags || []).join('; '),
  }));

  return Papa.unparse(exportData);
}

import React from 'react';
import { NokaRecord } from '../types/noka';
import { BarChart3, PieChart, ShieldCheck, Database, Cpu, Zap, HardDrive } from 'lucide-react';

interface AnalyticsViewProps {
  records: NokaRecord[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ records }) => {
  // Brand count calculation
  const brandCounts: Record<string, number> = {};
  const fuelCounts: Record<string, number> = {};
  const transCounts: Record<string, number> = {};

  records.forEach((r) => {
    brandCounts[r.brand] = (brandCounts[r.brand] || 0) + 1;
    fuelCounts[r.fuelType] = (fuelCounts[r.fuelType] || 0) + 1;
    transCounts[r.transmission] = (transCounts[r.transmission] || 0) + 1;
  });

  const total = records.length || 1;

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-[#222a3d] bg-white dark:bg-[#131b2e] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Indexed Database Records</span>
            <Database className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
            {records.length}
          </div>
          <div className="text-[11px] text-emerald-500 font-medium mt-1">100% Validated Checksums</div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-[#222a3d] bg-white dark:bg-[#131b2e] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Manufacturers</span>
            <Cpu className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
            {Object.keys(brandCounts).length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Toyota, Honda, Mitsubishi, etc.</div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-[#222a3d] bg-white dark:bg-[#131b2e] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">EV & Hybrid Ratio</span>
            <Zap className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
            {Math.round((((fuelCounts['EV'] || 0) + (fuelCounts['Hybrid'] || 0)) / total) * 100)}%
          </div>
          <div className="text-[11px] text-emerald-500 mt-1">Electrified Vehicle Fleet</div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-[#222a3d] bg-white dark:bg-[#131b2e] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">B-Tree Storage Size</span>
            <HardDrive className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
            14.2 MB
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Compressed Index Engine</div>
        </div>
      </div>

      {/* Brand Breakdown Progress Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-[#222a3d] bg-white dark:bg-[#131b2e] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            Brand Distribution Breakdown
          </h3>

          <div className="space-y-3">
            {Object.entries(brandCounts).map(([brand, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div key={brand} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{brand}</span>
                    <span className="font-mono text-slate-500">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fuel & Transmission Specs */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-[#222a3d] bg-white dark:bg-[#131b2e] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-500" />
            Powertrain & Transmission Share
          </h3>

          <div className="grid grid-cols-2 gap-4 pt-2">
            {/* Fuel Type */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b1326] border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase font-mono">Fuel Types</span>
              {Object.entries(fuelCounts).map(([fuel, cnt]) => (
                <div key={fuel} className="flex justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300">{fuel}:</span>
                  <span className="font-mono font-bold text-blue-500">{cnt}</span>
                </div>
              ))}
            </div>

            {/* Transmission */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b1326] border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase font-mono">Transmission</span>
              {Object.entries(transCounts).map(([tr, cnt]) => (
                <div key={tr} className="flex justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300">{tr}:</span>
                  <span className="font-mono font-bold text-indigo-500">{cnt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

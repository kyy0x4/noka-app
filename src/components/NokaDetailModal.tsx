import React from 'react';
import { NokaRecord } from '../types/noka';
import { decodeNoka } from '../utils/nokaDecoder';
import { X, ShieldCheck, Cpu, Copy, Check, Hash, Calendar, Fuel, MapPin, Wrench, FileText } from 'lucide-react';

interface NokaDetailModalProps {
  record: NokaRecord | null;
  onClose: () => void;
}

export const NokaDetailModal: React.FC<NokaDetailModalProps> = ({ record, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!record) return null;

  const decoded = decodeNoka(record.noka);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(record, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#0b1326]/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                NOKA Chassis Verification Audit
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official Vehicle Identification Number Inspection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Banner with NOKA Monospace Card */}
          <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                VERIFIED NOMOR RANGKA (NOKA)
              </div>
              <div className="text-lg font-mono font-bold text-blue-400 tracking-wider mt-0.5">
                {record.noka}
              </div>
            </div>
            <button
              onClick={handleCopyJson}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-medium text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied JSON</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Record JSON</span>
                </>
              )}
            </button>
          </div>

          {/* VIN Structure Decoding Section */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-blue-500" />
              Chassis VIN Breakdown (3-Segment Structure)
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0b1326] border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-mono text-slate-400">WMI (POS 1-3)</div>
                <div className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400">{decoded.wmi}</div>
                <div className="text-[10px] text-slate-500 mt-1 truncate">{decoded.manufacturer}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0b1326] border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-mono text-slate-400">VDS (POS 4-9)</div>
                <div className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400">{decoded.vds}</div>
                <div className="text-[10px] text-slate-500 mt-1">Vehicle Spec Descriptor</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0b1326] border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-mono text-slate-400">VIS (POS 10-17)</div>
                <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">{decoded.vis}</div>
                <div className="text-[10px] text-slate-500 mt-1">Plant Code & Serial</div>
              </div>
            </div>
          </div>

          {/* Vehicle Specifications Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
              <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-blue-500" />
                Technical Specs
              </h5>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                  <span className="text-slate-400">Brand / Make:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{record.brand}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                  <span className="text-slate-400">Model Name:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{record.model}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                  <span className="text-slate-400">Engine Code:</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{record.engineCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Frame Chassis Code:</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{record.frameCode}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
              <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5 text-emerald-500" />
                Drive & Regional Metadata
              </h5>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                  <span className="text-slate-400">Fuel Type:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{record.fuelType}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                  <span className="text-slate-400">Transmission:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{record.transmission}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                  <span className="text-slate-400">Reg. Region:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{record.registrationRegion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Checksum Hash:</span>
                  <span className="font-mono text-emerald-500">{record.dataChecksum}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Audit trail */}
          {record.notes && (
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300">
              <span className="font-bold">System Inspection Note: </span>
              {record.notes}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0b1326]/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Close Audit View
          </button>
        </div>
      </div>
    </div>
  );
};

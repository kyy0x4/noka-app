import React, { useState } from 'react';
import { NokaRecord } from '../types/noka';
import { Copy, Eye, Check, AlertTriangle, ShieldCheck, Clock, ExternalLink, Trash2, Edit3, Plus } from 'lucide-react';

interface NokaTableProps {
  records: NokaRecord[];
  onSelectRecord: (record: NokaRecord) => void;
  onDeleteRecord: (id: string) => void;
  onEditRecord: (record: NokaRecord) => void;
  onOpenAddModal: () => void;
}

export const NokaTable: React.FC<NokaTableProps> = ({
  records,
  onSelectRecord,
  onDeleteRecord,
  onEditRecord,
  onOpenAddModal,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyNoka = (e: React.MouseEvent, noka: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(noka);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: NokaRecord['status']) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3" /> ACTIVE
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> PENDING
          </span>
        );
      case 'FLAGGED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-3 h-3" /> FLAGGED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            ARCHIVED
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[#222a3d] bg-white dark:bg-[#131b2e] shadow-sm overflow-hidden">
      {/* Table Header Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Vehicle Chassis Database Registry
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time verified vehicle identification records
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Record</span>
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b1326]/60 text-slate-500 dark:text-slate-400 font-mono uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4 font-semibold">NOKA Record</th>
              <th className="py-3 px-4 font-semibold">Vehicle Metadata</th>
              <th className="py-3 px-4 font-semibold">Entry Date & Region</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
            {records.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-400">
                  <p className="text-sm font-semibold">No NOKA records found</p>
                  <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or filters</p>
                </td>
              </tr>
            ) : (
              records.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelectRecord(item)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  {/* NOKA Record Monospace Badge */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs py-1 px-2.5 rounded bg-slate-100 dark:bg-[#0b1326] text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700/80 group-hover:border-blue-500/40 transition-colors">
                        {item.noka}
                      </span>
                      <button
                        onClick={(e) => handleCopyNoka(e, item.noka, item.id)}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        title="Copy NOKA"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Vehicle Metadata */}
                  <td className="py-3.5 px-4">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <span>{item.brand} {item.model}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {item.year}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                        Frame: <span className="text-slate-700 dark:text-slate-300">{item.frameCode}</span> | Engine: <span className="text-slate-700 dark:text-slate-300">{item.engineCode}</span> | {item.fuelType} ({item.transmission})
                      </div>
                    </div>
                  </td>

                  {/* Entry Date & Region */}
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                    <div>{item.entryDate}</div>
                    <div className="text-[10px] text-slate-400 font-sans">{item.registrationRegion}</div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    {getStatusBadge(item.status)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectRecord(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View Full Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditRecord(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Record"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteRecord(item.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
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

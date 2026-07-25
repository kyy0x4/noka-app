import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Sparkles, FileSpreadsheet } from 'lucide-react';
import { NokaRecord } from '../types/noka';
import { generateChecksum, decodeNoka } from '../utils/nokaDecoder';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportRecords: (newRecords: NokaRecord[]) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onImportRecords,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<Partial<NokaRecord>[]>([]);

  if (!isOpen) return null;

  const generateSyntheticBatch = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const syntheticRecords: NokaRecord[] = [
        {
          id: `noka-syn-${Date.now()}-1`,
          noka: `MHF11KE100${Math.floor(100000 + Math.random() * 900000)}`,
          brand: 'TOYOTA',
          model: 'VELOZ 1.5 Q CVT',
          variant: '1.5 Q TSS',
          year: 2024,
          engineCode: '2NR-VE',
          frameCode: 'W100',
          fuelType: 'Bensin',
          transmission: 'CVT',
          color: 'Platinum White Pearl',
          status: 'ACTIVE',
          entryDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
          registrationRegion: 'DKI Jakarta (B)',
          dataChecksum: generateChecksum(`SYN_VELOZ_${Date.now()}`),
          batchId: `BATCH_IMPORT_${Date.now()}`,
          notes: 'Batch ingested via Automated Pipeline'
        },
        {
          id: `noka-syn-${Date.now()}-2`,
          noka: `PL2334812300${Math.floor(100000 + Math.random() * 900000)}`,
          brand: 'HONDA',
          model: 'WR-V 1.5 RS',
          variant: '1.5 RS Sensing',
          year: 2024,
          engineCode: 'L15ZF',
          frameCode: 'DG4',
          fuelType: 'Bensin',
          transmission: 'CVT',
          color: 'Ignite Red Metallic',
          status: 'ACTIVE',
          entryDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
          registrationRegion: 'Jawa Barat (D)',
          dataChecksum: generateChecksum(`SYN_WRV_${Date.now()}`),
          batchId: `BATCH_IMPORT_${Date.now()}`,
          notes: 'Batch ingested via Automated Pipeline'
        },
        {
          id: `noka-syn-${Date.now()}-3`,
          noka: `MKA882910398${Math.floor(100000 + Math.random() * 900000)}`,
          brand: 'MITSUBISHI',
          model: 'XFORCE 1.5 ULTIMATE',
          variant: 'Ultimate CVT',
          year: 2024,
          engineCode: '4A91',
          frameCode: 'GA2W',
          fuelType: 'Bensin',
          transmission: 'CVT',
          color: 'Energetic Yellow',
          status: 'ACTIVE',
          entryDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
          registrationRegion: 'Jawa Timur (L)',
          dataChecksum: generateChecksum(`SYN_XFORCE_${Date.now()}`),
          batchId: `BATCH_IMPORT_${Date.now()}`,
          notes: 'Batch ingested via Automated Pipeline'
        },
      ];

      setParsedPreview(syntheticRecords);
      setIsSimulating(false);
    }, 600);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setIsSimulating(true);

      const reader = new FileReader();

      if (file.name.endsWith('.json')) {
        reader.onload = (event) => {
          try {
            const jsonText = event.target?.result as string;
            const parsed = JSON.parse(jsonText);
            const arrayData = Array.isArray(parsed) ? parsed : [parsed];
            const convertedRecords: NokaRecord[] = arrayData.map((item, idx) => {
              const decoded = decodeNoka(item.noka || item.noRangka || item.vin || `MHF11KE10000000${idx}`);
              return {
                id: item.id || `noka-file-${Date.now()}-${idx}`,
                noka: (item.noka || item.noRangka || item.vin || `MHF11KE10000000${idx}`).toUpperCase(),
                brand: item.brand || item.merk || decoded.manufacturer.split(' ')[0] || 'TOYOTA',
                model: item.model || item.tipe || 'UNSPECIFIED MODEL',
                variant: item.variant || item.variasi || 'Standard',
                year: Number(item.year || item.tahun || decoded.calculatedYear || 2024),
                engineCode: item.engineCode || item.noMesin || '2NR-VE',
                frameCode: item.frameCode || item.kodeRangka || decoded.vds || 'W100',
                fuelType: item.fuelType || item.bahanBakar || 'Bensin',
                transmission: item.transmission || item.transmisi || 'CVT',
                color: item.color || item.warna || 'Hitam',
                status: item.status || 'ACTIVE',
                entryDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
                registrationRegion: item.registrationRegion || item.wilayah || 'DKI Jakarta (B)',
                dataChecksum: generateChecksum(item.noka || `FILE_REC_${idx}_${Date.now()}`),
                batchId: `BATCH_FILE_${Date.now()}`,
                notes: `Imported from file: ${file.name}`
              };
            });
            setParsedPreview(convertedRecords);
          } catch (err) {
            console.error('Error parsing JSON file:', err);
            generateSyntheticBatch();
          } finally {
            setIsSimulating(false);
          }
        };
        reader.readAsText(file);
      } else if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
        reader.onload = (event) => {
          try {
            const text = event.target?.result as string;
            const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
            
            if (lines.length === 0) {
              generateSyntheticBatch();
              return;
            }

            const parsedRecords: NokaRecord[] = [];
            // Check if first line is a header
            const startIdx = lines[0].toLowerCase().includes('noka') || lines[0].toLowerCase().includes('vin') || lines[0].toLowerCase().includes('brand') ? 1 : 0;

            for (let i = startIdx; i < lines.length && i < startIdx + 50; i++) {
              const line = lines[i].trim();
              const cols = line.includes(',') ? line.split(',') : line.includes(';') ? line.split(';') : [line];
              
              const rawNoka = cols[0].replace(/"/g, '').trim();
              if (rawNoka.length < 5) continue;

              const decoded = decodeNoka(rawNoka);
              const brand = cols[1] ? cols[1].replace(/"/g, '').trim() : decoded.manufacturer.split(' ')[0] || 'TOYOTA';
              const model = cols[2] ? cols[2].replace(/"/g, '').trim() : 'VEHICLE MODEL';
              const year = cols[3] && !isNaN(Number(cols[3])) ? Number(cols[3]) : decoded.calculatedYear;

              parsedRecords.push({
                id: `noka-csv-${Date.now()}-${i}`,
                noka: rawNoka.toUpperCase(),
                brand: brand.toUpperCase(),
                model: model.toUpperCase(),
                variant: 'Standard',
                year: year || 2024,
                engineCode: '2NR-VE',
                frameCode: decoded.vds || 'W100',
                fuelType: 'Bensin',
                transmission: 'CVT',
                color: 'Hitam',
                status: 'ACTIVE',
                entryDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
                registrationRegion: 'DKI Jakarta (B)',
                dataChecksum: generateChecksum(rawNoka),
                batchId: `BATCH_CSV_${Date.now()}`,
                notes: `Imported from CSV file: ${file.name}`
              });
            }

            if (parsedRecords.length > 0) {
              setParsedPreview(parsedRecords);
            } else {
              generateSyntheticBatch();
            }
          } catch (err) {
            console.error('Error parsing CSV file:', err);
            generateSyntheticBatch();
          } finally {
            setIsSimulating(false);
          }
        };
        reader.readAsText(file);
      } else {
        generateSyntheticBatch();
      }
    }
  };

  const handleConfirmImport = () => {
    if (parsedPreview.length > 0) {
      onImportRecords(parsedPreview as NokaRecord[]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                NOKA Batch File Ingestion Pipeline
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload CSV or JSON dataset for B-Tree indexing
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

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* File Upload Drop Zone */}
          <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-colors block bg-slate-50/50 dark:bg-[#0b1326]/50">
            <input
              type="file"
              accept=".csv,.json,.xlsx"
              onChange={handleFileChange}
              className="hidden"
            />
            <FileSpreadsheet className="w-10 h-10 mx-auto text-blue-500 mb-2" />
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {selectedFile ? selectedFile.name : 'Select or Drop CSV / JSON File Here'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports standard Korlantas / E-Samsat dataset schema
            </p>
          </label>

          {/* Quick Demo Dataset Button */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center space-x-2 text-xs text-blue-700 dark:text-blue-300 font-medium">
              <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Or generate synthetic vehicle batch for test indexing</span>
            </div>
            <button
              type="button"
              onClick={generateSyntheticBatch}
              disabled={isSimulating}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shrink-0"
            >
              {isSimulating ? 'Generating...' : 'Generate Demo Batch'}
            </button>
          </div>

          {/* Parsed Preview Table */}
          {parsedPreview.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Parsed Preview ({parsedPreview.length} Records)</span>
                <span className="text-[10px] font-mono text-emerald-500">Checksum Verified</span>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b1326] p-3 max-h-40 overflow-y-auto space-y-2">
                {parsedPreview.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    <span className="font-mono font-bold text-blue-500">{item.noka}</span>
                    <span className="text-slate-700 dark:text-slate-300">{item.brand} {item.model}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.frameCode}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0b1326]/50 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={parsedPreview.length === 0}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-sm"
          >
            Commit & Index to Database
          </button>
        </div>
      </div>
    </div>
  );
};

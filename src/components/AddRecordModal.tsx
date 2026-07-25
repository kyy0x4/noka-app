import React, { useState, useEffect } from 'react';
import { X, Plus, Key, Wrench, Fuel, MapPin, Check } from 'lucide-react';
import { NokaRecord } from '../types/noka';
import { generateChecksum } from '../utils/nokaDecoder';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRecord: (record: NokaRecord) => void;
  initialData?: NokaRecord | null;
}

export const AddRecordModal: React.FC<AddRecordModalProps> = ({
  isOpen,
  onClose,
  onSaveRecord,
  initialData,
}) => {
  const [formData, setFormData] = useState<Partial<NokaRecord>>({
    noka: '',
    brand: 'TOYOTA',
    model: '',
    variant: '',
    year: 2024,
    engineCode: '',
    frameCode: '',
    fuelType: 'Bensin',
    transmission: 'CVT',
    color: '',
    status: 'ACTIVE',
    registrationRegion: 'DKI Jakarta (B)',
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        noka: 'MHF11KE100' + Math.floor(100000 + Math.random() * 900000),
        brand: 'TOYOTA',
        model: 'AVANZA 1.5 G',
        variant: '1.5 G MT',
        year: 2024,
        engineCode: '2NR-VE',
        frameCode: 'KE10',
        fuelType: 'Bensin',
        transmission: 'Manual',
        color: 'Black Metallic',
        status: 'ACTIVE',
        registrationRegion: 'DKI Jakarta (B)',
        notes: 'Manually registered chassis record',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.noka || !formData.model) return;

    const recordToSave: NokaRecord = {
      id: initialData?.id || `noka-man-${Date.now()}`,
      noka: formData.noka.trim().toUpperCase(),
      brand: formData.brand || 'TOYOTA',
      model: formData.model || 'MODEL UNKNOWN',
      variant: formData.variant || 'STANDARD',
      year: Number(formData.year) || 2024,
      engineCode: formData.engineCode || 'N/A',
      frameCode: formData.frameCode || 'N/A',
      fuelType: formData.fuelType as any || 'Bensin',
      transmission: formData.transmission as any || 'CVT',
      color: formData.color || 'Standard Color',
      status: formData.status as any || 'ACTIVE',
      entryDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      registrationRegion: formData.registrationRegion || 'DKI Jakarta (B)',
      dataChecksum: generateChecksum(formData.noka!),
      notes: formData.notes,
    };

    onSaveRecord(recordToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {initialData ? 'Edit NOKA Chassis Record' : 'Register New NOKA Chassis Record'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Vehicle Master Identification & Technical Profile
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* NOKA Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-mono uppercase">
              NOKA / Nomor Rangka (VIN) *
            </label>
            <input
              type="text"
              required
              value={formData.noka}
              onChange={(e) => setFormData({ ...formData, noka: e.target.value })}
              placeholder="e.g. MHF11KE1001234567"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0b1326] text-slate-900 dark:text-slate-100 font-mono text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Brand & Model Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Vehicle Brand / Make
              </label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0b1326] text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TOYOTA">TOYOTA</option>
                <option value="HONDA">HONDA</option>
                <option value="MITSUBISHI">MITSUBISHI</option>
                <option value="DAIHATSU">DAIHATSU</option>
                <option value="SUZUKI">SUZUKI</option>
                <option value="HYUNDAI">HYUNDAI</option>
                <option value="WULING">WULING</option>
                <option value="ISUZU">ISUZU</option>
                <option value="NISSAN">NISSAN</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Vehicle Model *
              </label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="e.g. AVANZA 1.5 G MT"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0b1326] text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Engine & Frame Code Row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-mono">
                Engine Code
              </label>
              <input
                type="text"
                value={formData.engineCode}
                onChange={(e) => setFormData({ ...formData, engineCode: e.target.value })}
                placeholder="2NR-VE"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0b1326] text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-mono">
                Frame Code
              </label>
              <input
                type="text"
                value={formData.frameCode}
                onChange={(e) => setFormData({ ...formData, frameCode: e.target.value })}
                placeholder="KE10"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0b1326] text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Year
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0b1326] text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Fuel, Transmission & Region */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Fuel Type
              </label>
              <select
                value={formData.fuelType}
                onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0b1326] text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Bensin">Bensin</option>
                <option value="Diesel">Diesel</option>
                <option value="EV">EV</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Transmission
              </label>
              <select
                value={formData.transmission}
                onChange={(e) => setFormData({ ...formData, transmission: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0b1326] text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CVT">CVT</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0b1326] text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING">PENDING</option>
                <option value="FLAGGED">FLAGGED</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Inspection Notes / Verification Remarks
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add optional notes..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0b1326] text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm"
            >
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

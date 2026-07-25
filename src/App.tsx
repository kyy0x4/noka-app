import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PipelineWorkflow } from './components/PipelineWorkflow';
import { SearchSection } from './components/SearchSection';
import { NokaTable } from './components/NokaTable';
import { TerminalLog } from './components/TerminalLog';
import { NokaDetailModal } from './components/NokaDetailModal';
import { UploadModal } from './components/UploadModal';
import { AddRecordModal } from './components/AddRecordModal';
import { BatchSearchModal } from './components/BatchSearchModal';
import { AnalyticsView } from './components/AnalyticsView';
import { PersistenceView } from './components/PersistenceView';
import { OcrUpload } from './components/OcrUpload';
import { OcrSearch } from './components/OcrSearch';

import { NokaRecord, LogEntry, ActiveTab, SearchMode } from './types/noka';
import { INITIAL_NOKA_RECORDS, INITIAL_LOG_ENTRIES } from './data/initialNokaData';

export default function App() {
  // Theme state with localStorage persistence
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('noka_theme');
    return saved ? saved === 'dark' : true;
  });

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('lookup');

  // NOKA Database records with localStorage persistence
  const [records, setRecords] = useState<NokaRecord[]>(() => {
    const saved = localStorage.getItem('noka_records_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_NOKA_RECORDS;
      }
    }
    return INITIAL_NOKA_RECORDS;
  });

  // Terminal log entries
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem('noka_logs_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_LOG_ENTRIES;
      }
    }
    return INITIAL_LOG_ENTRIES;
  });

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('exact');
  const [selectedBrand, setSelectedBrand] = useState('ALL');

  // Modal States
  const [selectedDetailRecord, setSelectedDetailRecord] = useState<NokaRecord | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<NokaRecord | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // Engine Status & Processing Simulation
  const [isProcessing, setIsProcessing] = useState(false);
  const [environmentStatus, setEnvironmentStatus] = useState('Ready');

  // Search input ref for Cmd+K shortcut
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Apply dark class to document element on theme toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('noka_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('noka_theme', 'light');
    }
  }, [darkMode]);

  // Persist records to localStorage
  useEffect(() => {
    localStorage.setItem('noka_records_v2', JSON.stringify(records));
  }, [records]);

  // Persist logs to localStorage
  useEffect(() => {
    localStorage.setItem('noka_logs_v2', JSON.stringify(logs));
  }, [logs]);

  // Keyboard shortcut Cmd+K / Ctrl+K focus search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Unique brands list for filter
  const brands = Array.from(new Set(records.map((r) => r.brand)));

  // Filtered NOKA Records logic
  const filteredRecords = records.filter((item) => {
    // Brand filter
    if (selectedBrand !== 'ALL' && item.brand !== selectedBrand) {
      return false;
    }

    if (!searchQuery.trim()) return true;

    const query = searchQuery.trim().toLowerCase();

    if (searchMode === 'exact') {
      return (
        item.noka.toLowerCase().includes(query) ||
        item.model.toLowerCase().includes(query) ||
        item.engineCode.toLowerCase().includes(query) ||
        item.frameCode.toLowerCase().includes(query)
      );
    } else {
      // Fuzzy mode
      const targetStr = `${item.noka} ${item.brand} ${item.model} ${item.engineCode} ${item.frameCode} ${item.fuelType} ${item.transmission}`.toLowerCase();
      return targetStr.includes(query);
    }
  });

  // Handlers for record operations
  const handleSaveRecord = (recordToSave: NokaRecord) => {
    setRecords((prev) => {
      const existsIndex = prev.findIndex((r) => r.id === recordToSave.id);
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = recordToSave;
        return copy;
      }
      return [recordToSave, ...prev];
    });

    // Add log
    addLog('SUCCESS', `Record saved: ${recordToSave.noka} (${recordToSave.brand} ${recordToSave.model})`, 'DATA_STORE');
  };

  const handleDeleteRecord = (id: string) => {
    const itemToDelete = records.find((r) => r.id === id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (itemToDelete) {
      addLog('WARN', `Record removed from index: ${itemToDelete.noka}`, 'DATA_STORE');
    }
  };

  const handleImportRecords = (newRecords: NokaRecord[]) => {
    setRecords((prev) => [...newRecords, ...prev]);
    addLog('INDEX', `Batch import complete: ${newRecords.length} records added to B-Tree index`, 'INGEST_PIPE');
    setActiveTab('lookup');
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const addLog = (level: LogEntry['level'], message: string, source = 'SYSTEM') => {
    const newEntry: LogEntry = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toTimeString().split(' ')[0],
      level,
      message,
      source,
    };
    setLogs((prev) => [newEntry, ...prev.slice(0, 100)]);
  };

  const handleSimulateNewLog = () => {
    const sampleLogs = [
      { level: 'INFO' as const, msg: 'Executing chassis checksum recalculation...', src: 'VALIDATOR' },
      { level: 'SUCCESS' as const, msg: 'B-Tree node balancing complete for NOKA_MASTER_V2', src: 'INDEXER' },
      { level: 'INDEX' as const, msg: 'Syncing E-Samsat regional registration cache...', src: 'SYNC_ENGINE' },
      { level: 'WARN' as const, msg: 'High query rate detected on VIN lookup API endpoint', src: 'MONITOR' },
    ];
    const picked = sampleLogs[Math.floor(Math.random() * sampleLogs.length)];
    addLog(picked.level, picked.msg, picked.src);
  };

  const handleResetToDefaults = () => {
    setRecords(INITIAL_NOKA_RECORDS);
    setLogs(INITIAL_LOG_ENTRIES);
    addLog('SUCCESS', 'Database restored to initial 10 verified seed records', 'CORE_ENGINE');
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-[#0b1326] text-[#dae2fd]' : 'bg-slate-50 text-slate-900'}`}>
      {/* Header */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        recordCount={records.length}
        environmentStatus={environmentStatus}
        onRefreshData={() => {
          setIsProcessing(true);
          addLog('INFO', 'Refreshing database pipeline & rebuilding index...', 'CORE_ENGINE');
          setTimeout(() => {
            setIsProcessing(false);
            addLog('SUCCESS', 'Engine status refreshed: All nodes green', 'CORE_ENGINE');
          }, 800);
        }}
        onOpenSettings={() => setActiveTab('persistence')}
      />

      {/* Main Layout Container */}
      <div className="flex">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenNewPipelineModal={() => setIsUploadModalOpen(true)}
          logCount={logs.length}
        />

        {/* Right Main Content Panel */}
        <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto space-y-6 overflow-x-hidden">
          {/* Top Pipeline 3-Stage Header */}
          <PipelineWorkflow
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onSelectTab={(tab) => setActiveTab(tab)}
            recentLog={logs[0]}
            totalRecords={records.length}
            isProcessing={isProcessing}
            onSimulateIngest={() => setIsUploadModalOpen(true)}
          />

          {/* Conditional View Rendering based on activeTab */}
          {activeTab === 'lookup' && (
            <>
              {/* Search Control Bar */}
              <SearchSection
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchMode={searchMode}
                onSearchModeChange={setSearchMode}
                selectedBrand={selectedBrand}
                onBrandSelect={setSelectedBrand}
                brands={brands}
                recordsFound={filteredRecords.length}
                activeIndexName="NOKA_MASTER_V2"
                onOpenBatchSearch={() => setIsBatchModalOpen(true)}
                inputRef={searchInputRef}
              />

              {/* Main NOKA Record Data Table */}
              <NokaTable
                records={filteredRecords}
                onSelectRecord={(r) => setSelectedDetailRecord(r)}
                onDeleteRecord={handleDeleteRecord}
                onEditRecord={(r) => {
                  setEditingRecord(r);
                  setIsAddModalOpen(true);
                }}
                onOpenAddModal={() => {
                  setEditingRecord(null);
                  setIsAddModalOpen(true);
                }}
              />
            </>
          )}

          {activeTab === 'ingest' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-[#222a3d] bg-white dark:bg-[#131b2e] shadow-sm">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Data Ingestion & Dataset Parsing Stage
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Import vehicle datasets from Korlantas, Samsat, or E-Faktur CSV files to index chassis records into the B-Tree database.
                </p>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  Open Ingestion Drag & Drop Modal
                </button>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <TerminalLog
              logs={logs}
              onClearLogs={() => setLogs([])}
              onSimulateNewLog={handleSimulateNewLog}
            />
          )}

          {activeTab === 'persistence' && (
            <PersistenceView
              records={records}
              onResetToDefaults={handleResetToDefaults}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView records={records} />
          )}

          {activeTab === 'ocr-upload' && <OcrUpload />}

          {activeTab === 'ocr-search' && <OcrSearch />}
        </main>
      </div>

      {/* Modals */}
      <NokaDetailModal
        record={selectedDetailRecord}
        onClose={() => setSelectedDetailRecord(null)}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onImportRecords={handleImportRecords}
      />

      <AddRecordModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingRecord(null);
        }}
        onSaveRecord={handleSaveRecord}
        initialData={editingRecord}
      />

      <BatchSearchModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        allRecords={records}
      />
    </div>
  );
}

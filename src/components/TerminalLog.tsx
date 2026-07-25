import React, { useState } from 'react';
import { Terminal, Copy, Check, Play, Pause, Trash2, Filter, Download } from 'lucide-react';
import { LogEntry, LogLevel } from '../types/noka';

interface TerminalLogProps {
  logs: LogEntry[];
  onClearLogs: () => void;
  onSimulateNewLog: () => void;
}

export const TerminalLog: React.FC<TerminalLogProps> = ({
  logs,
  onClearLogs,
  onSimulateNewLog,
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [copied, setCopied] = useState(false);
  const [isLiveStream, setIsLiveStream] = useState(true);

  const filteredLogs = logs.filter((log) => {
    if (filterLevel === 'ALL') return true;
    return log.level === filterLevel;
  });

  const handleCopyAllLogs = () => {
    const logText = logs.map((l) => `[${l.timestamp}] [${l.level}] [${l.source}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(logText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLevelBadge = (level: LogLevel) => {
    switch (level) {
      case 'INFO':
        return <span className="text-blue-400 font-bold">[INFO]</span>;
      case 'SUCCESS':
        return <span className="text-emerald-400 font-bold">[SUCCESS]</span>;
      case 'INDEX':
        return <span className="text-purple-400 font-bold">[INDEX]</span>;
      case 'WARN':
        return <span className="text-amber-400 font-bold">[WARN]</span>;
      case 'ERROR':
        return <span className="text-rose-400 font-bold">[ERROR]</span>;
      default:
        return <span className="text-slate-400">[LOG]</span>;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[#222a3d] bg-black text-slate-100 shadow-xl overflow-hidden font-mono">
      {/* Terminal Top Window Title Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            noka_process_engine.sh — Live Indexer Terminal
          </span>
        </div>

        {/* Terminal Controls */}
        <div className="flex items-center space-x-2">
          {/* Level Filter Dropdown */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded px-2 py-1 focus:outline-none"
          >
            <option value="ALL">All Levels</option>
            <option value="INFO">INFO</option>
            <option value="INDEX">INDEX</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
          </select>

          {/* Trigger Event Button */}
          <button
            onClick={onSimulateNewLog}
            className="px-2.5 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold transition-colors flex items-center gap-1"
          >
            <Play className="w-3 h-3" />
            <span>Emit Log Event</span>
          </button>

          {/* Copy Logs */}
          <button
            onClick={handleCopyAllLogs}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Copy Logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Clear Logs */}
          <button
            onClick={onClearLogs}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Clear Terminal"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="p-4 h-96 overflow-y-auto space-y-2 text-xs leading-relaxed bg-[#060e20]">
        {filteredLogs.length === 0 ? (
          <div className="text-slate-500 py-8 text-center italic">
            -- No terminal log stream available --
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start space-x-3 hover:bg-slate-900/50 p-1 rounded transition-colors">
              <span className="text-emerald-500 shrink-0">[{log.timestamp}]</span>
              <span className="shrink-0">{getLevelBadge(log.level)}</span>
              <span className="text-slate-400 shrink-0">[{log.source}]</span>
              <span className="text-slate-200">{log.message}</span>
            </div>
          ))
        )}
      </div>

      {/* Terminal Footer Status Bar */}
      <div className="bg-slate-900/90 border-t border-slate-800 px-4 py-2 text-[10px] text-slate-400 flex items-center justify-between font-mono">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            STDOUT READY
          </span>
          <span>● BUFFER: {logs.length} LINES</span>
        </div>
        <div>UTF-8 | UNIX (LF) | SH</div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { OcrUpload } from './components/OcrUpload';
import { OcrSearch } from './components/OcrSearch';
import { ActiveTab } from './types/noka';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('noka_theme');
    return saved ? saved === 'dark' : true;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('ocr-search');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('noka_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('noka_theme', 'light');
    }
  }, [darkMode]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-[#0b1326] text-[#dae2fd]' : 'bg-slate-50 text-slate-900'}`}>
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto space-y-6 overflow-x-hidden">
          {activeTab === 'ocr-search' && <OcrSearch inputRef={searchInputRef} />}
          {activeTab === 'ocr-upload' && <OcrUpload />}
        </main>
      </div>
    </div>
  );
}

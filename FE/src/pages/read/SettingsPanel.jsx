import React from 'react';
import { Button } from '@/components/ui/button';
import { Type, ZoomIn, ZoomOut } from 'lucide-react';

export default function SettingsPanel({ readerSettings, updateSetting, t }) {
  return (
    <div className="p-4 space-y-6">
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase text-slate-500">{t("layout.readpage.showSetting.bgColor")}</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => updateSetting('theme', 'light')}
            className={`py-2 rounded-md border font-medium transition-all duration-200 ${readerSettings.theme === 'light' ? 'border-blue-500 ring-1 ring-blue-500 shadow-md' : 'border-slate-200 hover:shadow-md hover:bg-slate-50'} bg-white text-slate-900`}
          >
            {t("layout.readpage.showSetting.lightBtn")}
          </button>
          <button
            onClick={() => updateSetting('theme', 'sepia')}
            className={`py-2 rounded-md border font-medium transition-all duration-200 ${readerSettings.theme === 'sepia' ? 'border-blue-500 ring-1 ring-blue-500 shadow-md' : 'border-[#d5c7a3] hover:shadow-md hover:bg-[#f9f4ed]'} bg-[#f4ecd8] text-[#5b4636]`}
          >
            Sepia
          </button>
          <button
            onClick={() => updateSetting('theme', 'dark')}
            className={`py-2 rounded-md border font-medium transition-all duration-200 ${readerSettings.theme === 'dark' ? 'border-blue-500 ring-1 ring-blue-500 shadow-md' : 'border-slate-700 hover:shadow-md hover:bg-slate-800'} bg-slate-900 text-slate-300`}
          >
            {t("layout.readpage.showSetting.darkBtn")}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase text-slate-500">{t("layout.readpage.showSetting.fontStyle")}</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => updateSetting('fontFamily', 'font-sans')}
            className={`py-2 rounded-md border font-medium transition-all duration-200 font-sans ${readerSettings.fontFamily === 'font-sans' ? 'border-blue-500 ring-1 ring-blue-500 shadow-md bg-slate-100 dark:bg-slate-800' : 'border-slate-200 dark:border-slate-700 hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-800'} text-slate-900 dark:text-slate-100`}
          >
            Sans-serif
          </button>
          <button
            onClick={() => updateSetting('fontFamily', 'font-serif')}
            className={`py-2 rounded-md border font-medium transition-all duration-200 font-serif ${readerSettings.fontFamily === 'font-serif' ? 'border-blue-500 ring-1 ring-blue-500 shadow-md bg-slate-100 dark:bg-slate-800' : 'border-slate-200 dark:border-slate-700 hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-800'} text-slate-900 dark:text-slate-100`}
          >
            Serif
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase text-slate-500">{t("layout.readpage.showSetting.fontSize")}</label>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateSetting('fontSize', Math.max(12, readerSettings.fontSize - 2))}
            className="transition-all duration-200 hover:shadow-md hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="flex-1 text-center font-medium text-inherit">{readerSettings.fontSize}px</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateSetting('fontSize', Math.min(32, readerSettings.fontSize + 2))}
            className="transition-all duration-200 hover:shadow-md hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
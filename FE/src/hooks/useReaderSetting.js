import { useState, useEffect, useRef } from 'react';

export const THEMES = {
  light: { container: "bg-slate-50", paper: "bg-white border-slate-100", heading: "text-slate-900", text: "text-slate-700" },
  sepia: { container: "bg-[#e9dec5]", paper: "bg-[#f4ecd8] border-[#e2d5b6]", heading: "text-[#433422]", text: "text-[#5b4636]" },
  dark: { container: "bg-slate-950", paper: "bg-slate-900 border-slate-800", heading: "text-slate-100", text: "text-slate-300" }
};

export default function useReaderSettings() {
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef(null);
  const DEFAULT_SETTINGS = {
    fontSize: 20,
    fontFamily: 'font-serif',
    theme: 'light'
  };
  const [readerSettings, setReaderSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('readerSettings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch (error) {
      console.warn("Không thể đọc từ localStorage, dùng setting mặc định.");
      return DEFAULT_SETTINGS;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('readerSettings', JSON.stringify(readerSettings));
    } catch (error) {
      // Bỏ qua lỗi nếu quota vượt quá hoặc ở chế độ ẩn danh hạn chế
      console.warn("Không thể lưu setting vào localStorage ở phiên làm việc này.");
    }
  }, [readerSettings]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);
  const updateSetting = (key, value) => {
    setReaderSettings(prev => ({ ...prev, [key]: value }));
  };

  const currentTheme = THEMES[readerSettings.theme] ?? THEMES['light'];
  return {
    showSettings,
    setShowSettings,
    settingsRef,
    readerSettings,
    updateSetting,
    currentTheme
  };
}
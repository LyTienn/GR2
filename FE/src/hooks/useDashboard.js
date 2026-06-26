import { useState, useEffect, useMemo, useRef } from 'react';

// Helper to normalize date keys without timezone-shifting date-only values
const toDateKey = (value) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return null;

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const day = String(parsedDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to fill missing dates in the last 30 days with 0 counts
const fillMissingDates = (data, daysCount = 30) => {
  const result = [];
  const dateMap = new Map();
  
  if (Array.isArray(data)) {
    data.forEach(item => {
      if (item && item.date) {
        const dateKey = toDateKey(item.date);
        if (dateKey) {
          dateMap.set(dateKey, parseInt(item.count) || 0);
        }
      }
    });
  }
  
  const now = new Date();
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dateKey = dateStr;
    
    result.push({
      date: dateStr,
      count: dateMap.has(dateKey) ? dateMap.get(dateKey) : 0
    });
  }
  
  return result;
};

// Helper to escape CSV cells and neutralize spreadsheet formulas
export const csvCell = (value) => {
  const raw = String(value ?? '');
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
};

export const csvRow = (values) => `${values.map(csvCell).join(',')}\n`;

export default function useDashboard(rawRegistrationData) {
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showQuickActionDropdown, setShowQuickActionDropdown] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');
  
  // Tooltip & Mouse Interaction States
  const svgRef = useRef(null);
  const [activeTooltipPoint, setActiveTooltipPoint] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // 1. Real-time clock
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const dateStr = now.toLocaleDateString('vi-VN');
      setCurrentDateTime(`${timeStr} - ${dateStr}`);
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000); // Update every second
    return () => clearInterval(interval);
  }, []);

  // 2. Processed registration data with filled dates
  const processedRegistrationData = useMemo(() => {
    return fillMissingDates(rawRegistrationData, 30);
  }, [rawRegistrationData]);

  // 3. Chart calculations
  const maxRegistrationCount = useMemo(() => {
    return Math.max(...processedRegistrationData.map(d => parseInt(d.count) || 0), 1);
  }, [processedRegistrationData]);

  const chartTicks = useMemo(() => {
    const maxVal = maxRegistrationCount;
    if (maxVal === 1) return [0, 1];
    if (maxVal === 2) return [0, 1, 2];
    if (maxVal === 3) return [0, 1, 2, 3];
    const rawTicks = [0, Math.round(maxVal * 0.25), Math.round(maxVal * 0.5), Math.round(maxVal * 0.75), maxVal];
    return [...new Set(rawTicks)].sort((a, b) => a - b);
  }, [maxRegistrationCount]);

  // 4. Mouse Event Handlers for SVG Chart Tooltip
  const handleMouseMove = (e) => {
    if (!svgRef.current || !processedRegistrationData.length) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Translate mouse X to SVG viewBox coordinates (width 800)
    const viewBoxX = (mouseX / rect.width) * 800;
    
    const paddingLeft = 60;
    const availableWidth = 720; // 800 - 60 (left) - 20 (right)
    
    // Find closest data point index
    const index = Math.round(((viewBoxX - paddingLeft) / availableWidth) * (processedRegistrationData.length - 1));
    const clampedIndex = Math.max(0, Math.min(processedRegistrationData.length - 1, index));
    
    const activePoint = processedRegistrationData[clampedIndex];
    
    // Compute exact SVG coordinates for drawing guide lines & circles
    const x = paddingLeft + (clampedIndex / (processedRegistrationData.length - 1 || 1)) * availableWidth;
    const ratio = (parseInt(activePoint.count) || 0) / maxRegistrationCount;
    const availableHeight = 200; // 250 - 25*2
    const y = 225 - ratio * availableHeight;
    
    setActiveTooltipPoint({
      ...activePoint,
      x,
      y
    });
    
    setTooltipPos({
      x: mouseX,
      y: mouseY
    });
  };

  const handleMouseLeave = () => {
    setActiveTooltipPoint(null);
  };

  return {
    showExportDropdown,
    setShowExportDropdown,
    showQuickActionDropdown,
    setShowQuickActionDropdown,
    currentDateTime,
    processedRegistrationData,
    chartTicks,
    maxRegistrationCount,
    svgRef,
    activeTooltipPoint,
    tooltipPos,
    handleMouseMove,
    handleMouseLeave
  };
}

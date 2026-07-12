import React, { useState, useEffect } from 'react';
import { Download, Plus, Users as UsersIcon, Library, UserPlus, MessageSquare, Crown, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminStatsService from '../../service/AdminStatsService';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import useDashboard, { csvCell, csvRow } from '../../hooks/useDashboard';

const fetchFontBase64 = async () => {
  try {
    const response = await fetch('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf');
    if (!response.ok) throw new Error('Network response was not ok');
    const arrayBuffer = await response.arrayBuffer();
    let binary = '';
    const bytes = new Uint8Array(arrayBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  } catch (error) {
    console.error('Failed to load Vietnamese font, falling back to standard font:', error);
    return null;
  }
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [subjectStats, setSubjectStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentComments, setRecentComments] = useState([]);
  const [registrationData, setRegistrationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const {
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
  } = useDashboard(registrationData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, subjectRes, usersRes, commentsRes, regRes] = await Promise.all([
          AdminStatsService.getDashboardStats(),
          AdminStatsService.getBooksBySubject(),
          AdminStatsService.getRecentUsers(5),
          AdminStatsService.getRecentComments(5),
          AdminStatsService.getRegistrationStats(30)
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (subjectRes.success) setSubjectStats(subjectRes.data);
        if (usersRes.success) setRecentUsers(usersRes.data.users);
        if (commentsRes.success) setRecentComments(commentsRes.data.comments);
        if (regRes.success) setRegistrationData(regRes.data.registrations);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const exportReport = async (format = 'csv') => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('vi-VN');
    const timeStr = now.toLocaleTimeString('vi-VN');
    const fileDateStr = now.toISOString().split('T')[0];
    
    setExporting(true);
    try {
      if (format === 'csv') {
        // --- CSV EXPORT ---
        let csvContent = "";
        csvContent += csvRow(["BÁO CÁO TỔNG QUAN HỆ THỐNG"]);
        csvContent += csvRow(["Ngày xuất", `${dateStr} ${timeStr}`]) + "\n";

        csvContent += csvRow(["=== THỐNG KÊ NGƯỜI DÙNG ==="]);
        csvContent += csvRow(["Tổng số thành viên", stats?.users?.total || 0]);
        csvContent += csvRow(["Thành viên Premium", stats?.users?.premium || 0]);
        csvContent += csvRow(["Thành viên Free", stats?.users?.free || 0]);
        csvContent += csvRow(["Đăng ký mới 24h", stats?.users?.newLast24h || 0]);
        csvContent += csvRow(["Đăng ký mới 7 ngày", stats?.users?.newLastWeek || 0]) + "\n";

        csvContent += csvRow(["=== THỐNG KÊ SÁCH ==="]);
        csvContent += csvRow(["Tổng số sách", stats?.books?.total || 0]);
        csvContent += csvRow(["Sách Premium", stats?.books?.premium || 0]);
        csvContent += csvRow(["Sách Free", stats?.books?.free || 0]) + "\n";

        csvContent += csvRow(["=== THỐNG KÊ BÌNH LUẬN ==="]);
        csvContent += csvRow(["Tổng số bình luận", stats?.comments?.total || 0]) + "\n";

        if (processedRegistrationData.length > 0) {
          csvContent += csvRow(["=== XU HƯỚNG ĐĂNG KÝ (30 NGÀY) ==="]);
          csvContent += csvRow(["Ngày", "Số lượng đăng ký"]);
          processedRegistrationData.forEach(item => {
            csvContent += csvRow([item.date, item.count]);
          });
          csvContent += "\n";
        }

        if (subjectStats?.distribution?.length > 0) {
          csvContent += csvRow(["=== PHÂN BỔ DANH MỤC SÁCH ==="]);
          csvContent += csvRow(["Thể loại", "Số lượng", "Phần trăm"]);
          subjectStats.distribution.forEach(item => {
            csvContent += csvRow([item.name, item.count, `${item.percent}%`]);
          });
          csvContent += "\n";
        }

        if (recentUsers.length > 0) {
          csvContent += csvRow(["=== THÀNH VIÊN MỚI NHẤT ==="]);
          csvContent += csvRow(["Tên", "Email", "Ngày đăng ký", "Gói"]);
          recentUsers.forEach(user => {
            csvContent += csvRow([
              user.full_name || 'Chưa đặt tên',
              user.email,
              formatDate(user.created_at),
              user.tier
            ]);
          });
        }

        const BOM = "\uFEFF";
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `bao-cao-he-thong_${fileDateStr}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

      } else if (format === 'excel') {
        // --- EXCEL EXPORT ---
        const wb = XLSX.utils.book_new();

        // Sheet 1: General Stats
        const summaryData = [
          ['BÁO CÁO TỔNG QUAN HỆ THỐNG'],
          ['Ngày xuất báo cáo:', `${dateStr} ${timeStr}`],
          [],
          ['Hạng mục thống kê', 'Giá trị', 'Chi tiết'],
          ['Tổng số thành viên', stats?.users?.total || 0, `Premium: ${stats?.users?.premium || 0} | Free: ${stats?.users?.free || 0}`],
          ['Đăng ký mới (24h)', stats?.users?.newLast24h || 0, 'Thành viên đăng ký trong ngày'],
          ['Đăng ký mới (7 ngày)', stats?.users?.newLastWeek || 0, 'Thành viên đăng ký trong tuần'],
          ['Tổng số sách', stats?.books?.total || 0, `Premium: ${stats?.books?.premium || 0} | Free: ${stats?.books?.free || 0}`],
          ['Tổng số bình luận', stats?.comments?.total || 0, 'Đánh giá từ người dùng']
        ];
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        
        // Simple column width configuration for clarity
        wsSummary['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 35 }];
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Tổng quan');

        // Sheet 2: Registration Trend
        if (processedRegistrationData.length > 0) {
          const regHeaders = [['Ngày', 'Số lượng đăng ký']];
          const regRows = processedRegistrationData.map(item => [item.date, parseInt(item.count) || 0]);
          const wsReg = XLSX.utils.aoa_to_sheet([...regHeaders, ...regRows]);
          wsReg['!cols'] = [{ wch: 15 }, { wch: 20 }];
          XLSX.utils.book_append_sheet(wb, wsReg, 'Xu hướng đăng ký');
        }

        // Sheet 3: Subject Distribution
        if (subjectStats?.distribution?.length > 0) {
          const subHeaders = [['Thể loại', 'Số lượng sách', 'Phần trăm']];
          const subRows = subjectStats.distribution.map(item => [item.name, item.count, `${item.percent}%`]);
          const wsSub = XLSX.utils.aoa_to_sheet([...subHeaders, ...subRows]);
          wsSub['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }];
          XLSX.utils.book_append_sheet(wb, wsSub, 'Phân bổ danh mục');
        }

        // Sheet 4: Recent Users
        if (recentUsers.length > 0) {
          const userHeaders = [['Tên người dùng', 'Email', 'Ngày đăng ký', 'Gói dịch vụ']];
          const userRows = recentUsers.map(user => [
            user.full_name || 'Chưa đặt tên',
            user.email,
            formatDate(user.created_at),
            user.tier
          ]);
          const wsUser = XLSX.utils.aoa_to_sheet([...userHeaders, ...userRows]);
          wsUser['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 15 }];
          XLSX.utils.book_append_sheet(wb, wsUser, 'Thành viên mới');
        }

        XLSX.writeFile(wb, `bao-cao-he-thong_${fileDateStr}.xlsx`);

      } else if (format === 'pdf') {
        // --- PDF EXPORT ---
        const doc = new jsPDF();
        
        // Load Unicode Font for Vietnamese support
        const fontBase64 = await fetchFontBase64();
        if (fontBase64) {
          doc.addFileToVFS('Roboto-Regular.ttf', fontBase64);
          doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
          doc.setFont('Roboto');
        }

        // Color palette
        const primaryColor = [19, 127, 236]; // #137fec (Blue)
        const darkSlate = [15, 23, 42]; // #0f172a
        
        // Title & Header Line
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 8, 'F'); // Top bar
        
        doc.setFontSize(22);
        doc.setTextColor(...darkSlate);
        doc.text('BÁO CÁO TỔNG QUAN HỆ THỐNG', 14, 25);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Ngày xuất báo cáo: ${dateStr} ${timeStr}`, 14, 32);
        doc.text(`Người xuất: Quản trị viên`, 14, 37);
        
        doc.setDrawColor(226, 232, 240);
        doc.line(14, 42, 196, 42); // Separator line

        let currentY = 48;

        // 1. General Stats Table
        doc.setFontSize(14);
        doc.setTextColor(...darkSlate);
        doc.text('1. Số liệu thống kê chung', 14, currentY);
        currentY += 6;

        const generalStatsRows = [
          ['Tổng số thành viên', `${stats?.users?.total || 0} thành viên`, `Premium: ${stats?.users?.premium || 0} · Free: ${stats?.users?.free || 0}`],
          ['Đăng ký mới 24h', `${stats?.users?.newLast24h || 0} thành viên`, 'Thành viên đăng ký mới trong ngày'],
          ['Đăng ký mới 7 ngày', `${stats?.users?.newLastWeek || 0} thành viên`, 'Thành viên đăng ký mới trong tuần'],
          ['Tổng số đầu sách', `${stats?.books?.total || 0} cuốn sách`, `Premium: ${stats?.books?.premium || 0} · Free: ${stats?.books?.free || 0}`],
          ['Tổng số bình luận', `${stats?.comments?.total || 0} bình luận`, 'Đánh giá từ người dùng hệ thống']
        ];

        autoTable(doc, {
          startY: currentY,
          head: [['Hạng mục', 'Số liệu', 'Chi tiết bổ sung']],
          body: generalStatsRows,
          theme: 'striped',
          styles: { font: fontBase64 ? 'Roboto' : 'helvetica', fontSize: 9 },
          headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'normal' },
          margin: { left: 14, right: 14 },
          didDrawPage: (data) => { currentY = data.cursor.y; }
        });

        currentY += 15;

        // 2. Subject Distribution Table
        if (subjectStats?.distribution?.length > 0) {
          if (currentY > 230) { doc.addPage(); currentY = 20; }
          doc.setFontSize(14);
          doc.setTextColor(...darkSlate);
          doc.text('2. Phân bổ danh mục sách', 14, currentY);
          currentY += 6;

          const subjectRows = subjectStats.distribution.map(item => [
            item.name,
            `${item.count} cuốn`,
            `${item.percent}%`
          ]);

          autoTable(doc, {
            startY: currentY,
            head: [['Thể loại sách', 'Số lượng', 'Tỷ lệ phân bổ']],
            body: subjectRows,
            theme: 'striped',
            styles: { font: fontBase64 ? 'Roboto' : 'helvetica', fontSize: 9 },
            headStyles: { fillColor: [147, 51, 234], textColor: [255, 255, 255], fontStyle: 'normal' }, // Purple
            margin: { left: 14, right: 14 },
            didDrawPage: (data) => { currentY = data.cursor.y; }
          });
          
          currentY += 15;
        }

        // 3. Recent Users Table
        if (recentUsers.length > 0) {
          if (currentY > 220) { doc.addPage(); currentY = 20; }
          doc.setFontSize(14);
          doc.setTextColor(...darkSlate);
          doc.text('3. Danh sách thành viên mới nhất', 14, currentY);
          currentY += 6;

          const userRows = recentUsers.map(user => [
            user.full_name || 'Chưa đặt tên',
            user.email,
            formatDate(user.created_at),
            user.tier
          ]);

          autoTable(doc, {
            startY: currentY,
            head: [['Tên thành viên', 'Địa chỉ Email', 'Ngày đăng ký', 'Gói dịch vụ']],
            body: userRows,
            theme: 'striped',
            styles: { font: fontBase64 ? 'Roboto' : 'helvetica', fontSize: 9 },
            headStyles: { fillColor: [249, 115, 22], textColor: [255, 255, 255], fontStyle: 'normal' }, // Orange
            margin: { left: 14, right: 14 },
            didDrawPage: (data) => { currentY = data.cursor.y; }
          });
        }

        // Page Numbers / Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(`Trang ${i} / ${pageCount}`, 196, 287, { align: 'right' });
          doc.text(`Hệ thống thư viện Lybrary — Báo cáo bảo mật nội bộ`, 14, 287);
        }

        doc.save(`bao-cao-he-thong_${fileDateStr}.pdf`);
      }
    } catch (err) {
      console.error('Lỗi khi xuất báo cáo:', err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statsCards = [
    {
      iconBg: 'bg-blue-50 dark:bg-blue-500/10',
      icon: <UsersIcon className="text-primary" size={20} />,
      title: 'Tổng thành viên',
      value: stats?.users?.total?.toLocaleString() || '0',
      note: `${stats?.users?.premium || 0} Premium · ${stats?.users?.free || 0} Free`,
      badge: stats?.users?.newLast24h > 0 ? `+${stats.users.newLast24h} hôm nay` : 'Không có mới',
      badgeColor: stats?.users?.newLast24h > 0
        ? 'text-green-500 bg-green-50 dark:bg-green-500/10'
        : 'text-slate-500 bg-slate-50 dark:bg-slate-500/10'
    },
    {
      iconBg: 'bg-purple-50 dark:bg-purple-500/10',
      icon: <Library className="text-purple-500" size={20} />,
      title: 'Tổng đầu sách',
      value: stats?.books?.total?.toLocaleString() || '0',
      note: `${stats?.books?.premium || 0} Premium · ${stats?.books?.free || 0} Free`,
      badge: 'Thư viện',
      badgeColor: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10'
    },
    {
      iconBg: 'bg-orange-50 dark:bg-orange-500/10',
      icon: <UserPlus className="text-orange-500" size={20} />,
      title: 'Đăng ký mới (7 ngày)',
      value: `+${stats?.users?.newLastWeek || 0}`,
      note: 'Thành viên mới trong tuần',
      badge: stats?.users?.newLast24h > 0 ? `+${stats.users.newLast24h} (24h)` : '0 (24h)',
      badgeColor: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10'
    },
    {
      iconBg: 'bg-teal-50 dark:bg-teal-500/10',
      icon: <MessageSquare className="text-teal-500" size={20} />,
      title: 'Tổng bình luận',
      value: stats?.comments?.total?.toLocaleString() || '0',
      note: 'Đánh giá từ người đọc',
      badge: 'Reviews',
      badgeColor: 'text-teal-500 bg-teal-50 dark:bg-teal-500/10'
    }
  ];

  const subjectColors = [
    'bg-blue-600',
    'bg-purple-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500'
  ];

  return (
    <>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            Chào mừng trở lại, Admin
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Tổng quan số liệu và báo cáo hệ thống.
            </p>
            {currentDateTime && (
              <div className="inline-flex items-center gap-2 self-start px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 text-blue-600 dark:text-blue-400 border border-blue-100/80 dark:border-blue-900/30 rounded-full text-xs font-semibold shadow-sm tracking-wide">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-mono">{currentDateTime}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Nút Thao tác nhanh */}
          <div className="relative w-fit">
            <button
              onClick={() => setShowQuickActionDropdown(!showQuickActionDropdown)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              <span>Thao tác nhanh</span>
            </button>

            {showQuickActionDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowQuickActionDropdown(false)}
                />
                <div className="absolute left-0 md:left-auto md:right-0 mt-2 w-48 bg-white dark:bg-[#1C252E] border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link
                    to="/admin/books"
                    state={{ openAddModal: true }}
                    onClick={() => setShowQuickActionDropdown(false)}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Thêm sách mới
                  </Link>
                  <Link
                    to="/admin/authors"
                    state={{ openAddModal: true }}
                    onClick={() => setShowQuickActionDropdown(false)}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    Thêm tác giả
                  </Link>
                  <Link
                    to="/admin/subjects"
                    state={{ openAddModal: true }}
                    onClick={() => setShowQuickActionDropdown(false)}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    Thêm chủ đề
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Nút Xuất báo cáo */}
          <div className="relative w-fit">
            <button
              onClick={() => !exporting && setShowExportDropdown(!showExportDropdown)}
              disabled={exporting}
              className="px-4 py-2 bg-white dark:bg-[#1C252E] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-500 dark:text-slate-400" />
              ) : (
                <Download size={18} />
              )}
              <span>{exporting ? 'Đang xuất...' : 'Xuất báo cáo'}</span>
            </button>

            {showExportDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowExportDropdown(false)}
                />
                <div className="absolute left-0 md:left-auto md:right-0 mt-2 w-fit min-w-40 bg-white dark:bg-[#1C252E] border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => {
                      exportReport('csv');
                      setShowExportDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Xuất CSV
                  </button>
                  <button
                    onClick={() => {
                      exportReport('excel');
                      setShowExportDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Xuất Excel
                  </button>
                  <button
                    onClick={() => {
                      exportReport('pdf');
                      setShowExportDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Xuất PDF
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map((c, idx) => (
          <div key={idx} className="bg-white dark:bg-card-dark rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-1">
            <div className="flex justify-between items-start mb-2">
              <div className={`p-2 ${c.iconBg} rounded-lg`}>
                {c.icon}
              </div>
              <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${c.badgeColor}`}>{c.badge}</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{c.title}</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{c.value}</h3>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">{c.note}</p>
          </div>
        ))}
      </div>

      {/* Chart and categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Xu hướng đăng ký</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Thống kê 30 ngày gần nhất</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">Tổng: </span>
              <span className="font-semibold text-primary">
                {registrationData.reduce((sum, d) => sum + parseInt(d.count || 0), 0)} đăng ký
              </span>
            </div>
          </div>
          <div className="relative w-full aspect-2/1 max-h-[300px]">
            {/* Chart Container */}
            <svg 
              ref={svgRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="w-full h-full cursor-crosshair" 
              preserveAspectRatio="none" 
              viewBox="0 0 800 300"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#137fec" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#137fec" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines and Labels */}
              {/* Grid Lines and Labels */}
              {chartTicks.map((val) => {
                const ratio = val / maxRegistrationCount;
                const availableHeight = 250 - (25 * 2); // paddingY = 25
                const y = 250 - 25 - (ratio * availableHeight);
                return (
                  <g key={val}>
                    {/* Horizontal Grid Line */}
                    <line
                      stroke="#334155"
                      strokeDasharray="4 4"
                      strokeOpacity="0.1"
                      x1="65" // Padding Left + 5
                      x2="800"
                      y1={y}
                      y2={y}
                    />
                    {/* Y-axis Label */}
                    <text
                      x="55"
                      y={y + 5} // Optical centering
                      textAnchor="end"
                      fontSize="12"
                      fill="#94a3b8"
                      fontWeight="500"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Y-axis Title */}
              <text x="10" y="20" fontSize="14" fill="#64748b" fontWeight="bold">SL</text>

              {processedRegistrationData.map((d, i) => {
                const maxCount = Math.max(...processedRegistrationData.map(item => parseInt(item.count) || 0), 1);
                const width = 800;
                const height = 250;
                const paddingLeft = 60;
                const paddingRight = 20;
                const paddingY = 25;
                const availableWidth = width - paddingLeft - paddingRight;
                const slotWidth = availableWidth / (processedRegistrationData.length - 1 || 1);
                
                const barWidth = Math.max(slotWidth * 0.6, 6);
                const x = paddingLeft + i * slotWidth - barWidth / 2;
                const availableHeight = height - (paddingY * 2);
                const barHeight = ((parseInt(d.count) || 0) / maxCount) * availableHeight;
                const y = height - paddingY - barHeight;
                const isHovered = activeTooltipPoint?.date === d.date;
                return (
                  <rect
                    key={i}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={Math.max(barHeight, 2)} 
                    fill={isHovered ? "#3b82f6" : "#137fec"} 
                    opacity={isHovered ? 1 : 0.8} 
                    rx={3} 
                    className="transition-all duration-150"
                  />
                );
              })}

              {/* Active Tooltip Guide Lines & Dots */}
              {activeTooltipPoint && (
                <g>
                  {/* Vertical Guide Line */}
                  <line
                    x1={activeTooltipPoint.x}
                    y1={25}
                    x2={activeTooltipPoint.x}
                    y2={225}
                    stroke="#64748b"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    strokeOpacity="0.4"
                  />
                  {/* Glowing active dot */}
                  <circle
                    cx={activeTooltipPoint.x}
                    cy={activeTooltipPoint.y}
                    r="8"
                    fill="#137fec"
                    fillOpacity="0.2"
                  />
                  <circle
                    cx={activeTooltipPoint.x}
                    cy={activeTooltipPoint.y}
                    r="4"
                    fill="#137fec"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </g>
              )}
            </svg>

            {/* HTML Tooltip Overlay */}
            {activeTooltipPoint && (
              <div 
                className="absolute bg-slate-900/90 dark:bg-slate-950/95 text-white text-xs rounded-lg p-2.5 shadow-xl border border-slate-700/50 pointer-events-none transition-all duration-75 z-30"
                style={{ 
                  left: `${tooltipPos.x}px`, 
                  top: `${tooltipPos.y}px`,
                  transform: 'translate(-50%, -120%)' // Center horizontally and place above cursor
                }}
              >
                <div className="font-semibold text-slate-200">{formatDate(activeTooltipPoint.date)}</div>
                <div className="text-[11px] text-blue-400 font-medium mt-0.5">
                  Đăng ký: <span className="font-bold text-white">{activeTooltipPoint.count}</span>
                </div>
              </div>
            )}

            {processedRegistrationData.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                Chưa có dữ liệu đăng ký
              </div>
            )}
          </div>
          <div className="flex justify-between mt-4 text-xs text-slate-400 font-medium">
            {processedRegistrationData.length > 0 ? (
              <>
                <span>{formatDate(processedRegistrationData[0]?.date)}</span>
                <span>{formatDate(processedRegistrationData[Math.floor(processedRegistrationData.length / 2)]?.date)}</span>
                <span>{formatDate(processedRegistrationData[processedRegistrationData.length - 1]?.date)}</span>
              </>
            ) : (
              <>
                <span>Tuần 1</span>
                <span>Tuần 2</span>
                <span>Tuần 3</span>
                <span>Tuần 4</span>
              </>
            )}
          </div>
        </div>

        {/* Subject distribution */}
        <div className="lg:col-span-1 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Phân bổ danh mục</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Các thể loại sách phổ biến</p>
          </div>
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[280px]">
            {subjectStats?.distribution?.slice(0, 6).map((item, idx) => (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-700 dark:text-slate-300 font-medium truncate mr-2">{item.name}</span>
                  <span className="text-slate-500 whitespace-nowrap">{item.count} ({item.percent}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${subjectColors[idx % subjectColors.length]} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(item.percent, 2)}%` }}
                  />
                </div>
              </div>
            ))}
            {(!subjectStats?.distribution || subjectStats.distribution.length === 0) && (
              <div className="text-center text-slate-400 py-8">Chưa có dữ liệu</div>
            )}
          </div>
        </div>
      </div>

      {/* Members + comments blocks */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Thành viên mới</h3>
            <Link to="/admin/users" className="text-sm text-primary font-medium hover:underline">Xem tất cả</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/30 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="px-6 py-4">Tên người dùng</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Ngày đăng ký</th>
                  <th className="px-6 py-4 text-center">Gói</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {recentUsers.map((user) => (
                  <tr key={user.user_id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xs font-bold">
                          {getInitials(user.full_name)}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {user.full_name || 'Chưa đặt tên'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{user.email}</td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(user.created_at)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.tier === 'PREMIUM'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                        {user.tier === 'PREMIUM' && <Crown size={12} />}
                        {user.tier}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                      Chưa có thành viên nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent comments */}
        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Bình luận gần đây</h3>
            <Link to="/admin/comments" className="text-sm text-primary font-medium hover:underline">Xem tất cả</Link>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[500px]">
            {recentComments.map((comment) => (
              <div key={comment.comment_id} className="p-5 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-slate-900 dark:text-white">
                      {comment.user_name || 'Ẩn danh'}
                    </span>
                    <span className="text-xs text-slate-500">• Sách: "{comment.book_title}"</span>
                  </div>
                  <span className="text-xs text-slate-400">{getTimeAgo(comment.created_at)}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{comment.content}</p>
                <div className="mt-2 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${star <= comment.rating ? 'text-yellow-400' : 'text-slate-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
            {recentComments.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                Chưa có bình luận nào
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}


import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Plus, Printer, MoreHorizontal, Edit, Trash2, Filter, ChevronRight, Calendar, ChevronDown, Download, Upload, KeyRound, Maximize2, CheckCircle2, AlertCircle, FileSpreadsheet, ArrowLeft, Loader2, X, MoreVertical, ToggleLeft as ToggleIcon, ArrowUp, ArrowDown, ChevronsUpDown, User as UserIcon, AlertTriangle } from 'lucide-react';
import { User } from '../types';
import AddUserModal from './AddUserModal';
import * as XLSX from 'xlsx';
import { generateUsername, formatExcelDate } from '../utils/userUtils';
import { supabase } from '../lib/supabase';
import { hashPassword } from '../utils/authUtils';

interface AdminUserManagementProps {
  users: User[];
  onRefresh?: () => void;
}

type SortConfig = {
  key: keyof User | 'classOrDept';
  direction: 'asc' | 'desc' | null;
};

const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ users, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');
  const [viewMode, setViewMode] = useState<'list' | 'import'>('list');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showInActive, setShowInActive] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [logs, setLogs] = useState<{msg: string, type: 'info' | 'success' | 'error'}[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: null });

  const [filters, setFilters] = useState({
    name: '',
    classOrDept: '',
    dob: '',
    cardCode: '',
    phone: '',
    status: 'all'
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSort = (key: SortConfig['key']) => {
    let direction: SortConfig['direction'] = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null;
    }
    setSortConfig({ key, direction });
  };

  const parseDate = (dateStr: string | undefined) => {
    if (!dateStr) return 0;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return 0;
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
  };

  const filteredAndSortedUsers = useMemo(() => {
    let result = users.filter(u => {
      if (u.role !== activeTab) return false;
      const nameMatch = u.name.toLowerCase().includes(filters.name.toLowerCase());
      const classMatch = (u.class_name || u.department || '').toLowerCase().includes(filters.classOrDept.toLowerCase());
      const cardMatch = (u.card_code || '').toLowerCase().includes(filters.cardCode.toLowerCase());
      return nameMatch && classMatch && cardMatch;
    });

    if (sortConfig.direction) {
      result.sort((a, b) => {
        let aVal: any = '';
        let bVal: any = '';
        if (sortConfig.key === 'classOrDept') {
          aVal = (a.class_name || a.department || '').toLowerCase();
          bVal = (b.class_name || b.department || '').toLowerCase();
        } else if (sortConfig.key === 'dob' || sortConfig.key === 'expiry_date') {
          aVal = parseDate(a[sortConfig.key] as string);
          bVal = parseDate(b[sortConfig.key] as string);
        } else {
          aVal = (a[sortConfig.key as keyof User] || '').toString().toLowerCase();
          bVal = (b[sortConfig.key as keyof User] || '').toString().toLowerCase();
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [users, activeTab, filters, sortConfig]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredAndSortedUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedUsers.map(u => u.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Xóa ${selectedIds.size} bạn đọc đã chọn?`)) return;
    try {
      const { error } = await supabase.from('profiles').delete().in('id', Array.from(selectedIds));
      if (error) throw error;
      setSelectedIds(new Set());
      onRefresh?.();
    } catch (err: any) { alert(err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Xóa bạn đọc này?")) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      onRefresh?.();
    } catch (err: any) { alert(err.message); }
  };

  const handleExportExcel = () => {
    const dataToExport = filteredAndSortedUsers.map(u => ({
      "Mã vạch": u.barcode,
      "Họ và tên": u.name,
      "Lớp/Phòng ban": u.class_name || u.department,
      "Ngày sinh": u.dob,
      "Giới tính": u.gender,
      "Mã thẻ": u.card_code,
      "Số điện thoại": u.phone,
      "Ngày hết hạn": u.expiry_date
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSach");
    XLSX.writeFile(wb, `DanhSach_${activeTab}.xlsx`);
  };

  const handleResetPasswords = async () => {
    if (selectedIds.size === 0) return;
    setImporting(true);
    try {
      for (const id of Array.from(selectedIds)) {
        const u = users.find(user => user.id === id);
        const hashed = await hashPassword(u?.dob || '123456');
        await supabase.from('profiles').update({ password: hashed, must_change_password: true }).eq('id', id);
      }
      alert("Đã reset mật khẩu");
    } catch (err: any) { alert(err.message); } finally { setImporting(false); }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  // --- IMPORT LOGIC ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        const headerRowIndex = data.findIndex(row => 
          row.some(cell => cell && cell.toString().includes("Họ và tên"))
        );

        if (headerRowIndex === -1) {
          setLogs(prev => [{msg: "Không tìm thấy dòng tiêu đề trong file!", type: 'error'}, ...prev]);
          setImporting(false);
          return;
        }

        const headers = data[headerRowIndex].map(h => h?.toString() || "");
        const rows = data.slice(headerRowIndex + 1);

        const getValue = (row: any[], keyword: string) => {
          const idx = headers.findIndex(h => h.toLowerCase().includes(keyword.toLowerCase()));
          return idx !== -1 ? row[idx] : "";
        };

        const mappedData = rows.filter(row => row.length > 0 && getValue(row, "Họ và tên")).map(row => {
          const rawClassName = getValue(row, "Lớp");
          const rawDeptName = getValue(row, "Phòng ban");
          const role = rawDeptName ? 'teacher' : 'student';

          return {
            barcode: getValue(row, "Mã vạch")?.toString() || "",
            full_name: getValue(row, "Họ và tên")?.toString() || "",
            class_or_dept: (rawClassName || rawDeptName)?.toString() || "",
            dob: formatExcelDate(getValue(row, "Ngày sinh")),
            gender: getValue(row, "Giới tính")?.toString() || "",
            card_code: getValue(row, "Mã thẻ")?.toString() || "",
            phone: getValue(row, "Số điện thoại")?.toString() || "",
            role: role,
            expiry_date: formatExcelDate(getValue(row, "Ngày hết hạn")) || '31/05/2025'
          };
        });

        setPreviewData(mappedData);
        setLogs(prev => [{msg: `Đã đọc ${mappedData.length} dòng dữ liệu`, type: 'success'}, ...prev]);
      } catch (err) { 
        setLogs(prev => [{msg: "Lỗi file!", type: 'error'}, ...prev]); 
      } finally { 
        setImporting(false); 
      }
    };
    reader.readAsBinaryString(file);
  };

  const saveImportToDatabase = async () => {
    if (previewData.length === 0) return;
    setImporting(true);
    try {
      for (const p of previewData) {
        const username = generateUsername(p.card_code, p.full_name);
        const { error } = await supabase.from('profiles').upsert({
          username: username.toUpperCase(),
          full_name: p.full_name,
          role: p.role,
          phone: p.phone,
          card_code: p.card_code,
          barcode: p.barcode,
          gender: p.gender,
          class_name: p.role === 'student' ? p.class_or_dept : null,
          department: p.role === 'teacher' ? p.class_or_dept : null,
          dob: p.dob,
          expiry_date: p.expiry_date
        }, { onConflict: 'username' });
        if (error) throw error;
      }
      onRefresh?.();
      setPreviewData([]);
      setViewMode('list');
      alert("Đã lưu thành công dữ liệu vào hệ thống!");
    } catch (err: any) { alert("Lỗi: " + err.message); } finally { setImporting(false); }
  };

  if (viewMode === 'import') {
    return (
      <div className="flex flex-col h-full bg-[#f4f6f8]">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setViewMode('list')} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 border border-transparent hover:border-slate-100 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
               <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Nhập liệu bạn đọc tập trung</h2>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hỗ trợ file Excel theo mẫu chuẩn của thư viện</p>
            </div>
          </div>
          {previewData.length > 0 && (
             <button onClick={saveImportToDatabase} disabled={importing} className="bg-[#00a651] text-white px-10 py-3 rounded-2xl font-black text-[12px] uppercase shadow-xl shadow-emerald-500/20 flex items-center gap-3 hover:bg-emerald-700 transition-all active:scale-95">
              {importing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              {importing ? "ĐANG LƯU DỮ LIỆU..." : "XÁC NHẬN NHẬP VÀO HỆ THỐNG"}
            </button>
          )}
        </div>

        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <div className="grid lg:grid-cols-12 gap-8 max-w-[1600px] mx-auto">
             
             {/* Cột trái: Chọn File */}
             <div className="lg:col-span-3 space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-0">
                  <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-500" /> Chọn file Excel
                  </h3>
                  <div className="relative border-2 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center bg-slate-50/50 hover:border-[#00a651] hover:bg-emerald-50/20 transition-all group">
                    <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <Upload className="w-12 h-12 text-slate-300 mb-4 group-hover:text-[#00a651] group-hover:-translate-y-1 transition-transform" />
                    <p className="text-xs font-black text-slate-500 text-center uppercase tracking-tighter leading-relaxed">Tải lên file dữ liệu <br/><span className="text-[10px] opacity-60">Kéo thả vào đây</span></p>
                  </div>
                  
                  {logs.length > 0 && (
                    <div className="mt-8 space-y-3">
                      {logs.map((log, i) => (
                        <div key={i} className={`text-[11px] font-bold p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-left-2 ${log.type === 'error' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                          {log.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          {log.msg}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-8 pt-8 border-t border-slate-100">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Mẹo nhỏ:</p>
                     <ul className="text-[11px] text-slate-500 space-y-2 italic leading-relaxed">
                        <li>- Nên sử dụng file mẫu để tránh lỗi định dạng.</li>
                        <li>- Ngày sinh nên để định dạng dd/mm/yyyy.</li>
                        <li>- Cột có dấu (*) là thông tin bắt buộc.</li>
                     </ul>
                  </div>
                </div>
             </div>

             {/* Cột phải: Preview Chi tiết */}
             <div className="lg:col-span-9 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-tight">Dữ liệu sẽ nhập vào Database</h3>
                      <span className="bg-[#00a651] text-white px-3 py-1 rounded-full text-[10px] font-black">{previewData.length} BẢN GHI</span>
                   </div>
                   <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                      <div className="w-2 h-2 bg-[#00a651] rounded-full"></div> Sẵn sàng nhập
                   </div>
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar relative">
                   <table className="w-full text-xs min-w-[1200px]">
                      <thead className="bg-white sticky top-0 z-10 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                        <tr>
                           <th className="px-4 py-5 text-center border-r border-slate-50 w-24">Mã vạch</th>
                           <th className="px-6 py-5 text-left border-r border-slate-50">Họ và tên</th>
                           <th className="px-4 py-5 text-center border-r border-slate-50 w-24">Lớp/Phòng</th>
                           <th className="px-4 py-5 text-center border-r border-slate-50 w-28">Ngày sinh</th>
                           <th className="px-4 py-5 text-center border-r border-slate-50 w-20">Giới tính</th>
                           <th className="px-4 py-5 text-center border-r border-slate-50 w-24">Mã thẻ</th>
                           <th className="px-4 py-5 text-center border-r border-slate-50 w-32">Số điện thoại</th>
                           <th className="px-4 py-5 text-center border-r border-slate-50 w-28">Ngày hết hạn</th>
                           <th className="px-4 py-5 text-center w-20">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {previewData.map((p, i) => {
                          const isInvalid = !p.full_name || !p.card_code;
                          return (
                            <tr key={i} className={`hover:bg-slate-50/80 transition-colors ${isInvalid ? 'bg-red-50/30' : ''}`}>
                               <td className="px-4 py-4 text-center text-slate-400 font-mono">{p.barcode || '-'}</td>
                               <td className="px-6 py-4 font-black text-slate-700">
                                  <div className="flex items-center gap-2">
                                     {p.full_name}
                                     {!p.full_name && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                  </div>
                               </td>
                               <td className="px-4 py-4 text-center font-bold text-slate-500">{p.class_or_dept}</td>
                               <td className="px-4 py-4 text-center text-slate-500">{p.dob}</td>
                               <td className="px-4 py-4 text-center font-bold text-slate-400">{p.gender}</td>
                               <td className="px-4 py-4 text-center font-black text-[#00a651]">{p.card_code}</td>
                               <td className="px-4 py-4 text-center text-slate-500">{p.phone || '-'}</td>
                               <td className="px-4 py-4 text-center text-red-400 font-bold">{p.expiry_date}</td>
                               <td className="px-4 py-4 text-center">
                                  <button onClick={() => setPreviewData(prev => prev.filter((_, idx) => idx !== i))} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><X className="w-4 h-4" /></button>
                               </td>
                            </tr>
                          );
                        })}
                        {previewData.length === 0 && (
                          <tr>
                             <td colSpan={9} className="py-40 text-center">
                                <FileSpreadsheet className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                                <p className="text-sm font-bold text-slate-300 italic">Vui lòng tải file để xem trước nội dung</p>
                             </td>
                          </tr>
                        )}
                      </tbody>
                   </table>
                </div>
                
                {previewData.length > 0 && (
                   <div className="p-6 bg-emerald-50/50 border-t border-emerald-100 flex items-center justify-between">
                      <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                         <CheckCircle2 className="w-4 h-4" /> Dữ liệu đã sẵn sàng để nhập vào hệ thống quản lý.
                      </p>
                      <button onClick={() => setPreviewData([])} className="text-[10px] font-black text-red-400 uppercase hover:text-red-600 transition-colors">Hủy toàn bộ</button>
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>
    );
  }

  const getSortIcon = (key: SortConfig['key']) => {
    if (sortConfig.key !== key || !sortConfig.direction) return <ChevronsUpDown className="w-3 h-3 text-slate-300" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-[#00a651]" /> : <ArrowDown className="w-3 h-3 text-[#00a651]" />;
  };

  return (
    <div className="flex flex-col h-full bg-[#f4f6f8] overflow-hidden">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200 flex items-center">
        <button onClick={() => {setActiveTab('student'); setSelectedIds(new Set());}} className={`px-8 py-4 text-[13px] font-bold transition-all relative ${activeTab === 'student' ? 'text-[#00a651] bg-slate-50/50' : 'text-slate-500 hover:text-slate-700'}`}>
          Học sinh {activeTab === 'student' && <div className="absolute top-0 left-0 w-full h-[3px] bg-[#00a651]"></div>}
        </button>
        <button onClick={() => {setActiveTab('teacher'); setSelectedIds(new Set());}} className={`px-8 py-4 text-[13px] font-bold transition-all relative ${activeTab === 'teacher' ? 'text-[#00a651] bg-slate-50/50' : 'text-slate-500 hover:text-slate-700'}`}>
          Giáo viên {activeTab === 'teacher' && <div className="absolute top-0 left-0 w-full h-[3px] bg-[#00a651]"></div>}
        </button>
      </div>

      {/* Action Bar */}
      <div className="p-4 flex items-center justify-end gap-4 bg-[#f8f9fa]">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input type="checkbox" checked={showInActive} onChange={(e) => setShowInActive(e.target.checked)} className="w-4 h-4 rounded border-slate-300 accent-[#00a651]" />
          <span className="text-[12px] font-medium text-slate-600 group-hover:text-slate-900">Hiển thị cả những bạn đọc ngừng theo dõi</span>
        </label>
        <button onClick={() => setShowAddModal(true)} className="bg-[#00a651] text-white px-5 py-2 rounded-md text-[13px] font-bold hover:bg-emerald-700 transition-colors shadow-sm">Thêm bạn đọc</button>
        <button onClick={handleExportExcel} className="p-2 bg-white border border-slate-200 rounded-md text-slate-400 hover:text-[#00a651] shadow-sm" title="Xuất Excel"><Printer className="w-4 h-4" /></button>
        <div className="relative" ref={menuRef}>
          <button onClick={() => setShowMoreMenu(!showMoreMenu)} className={`p-2 bg-white border border-slate-200 rounded-md transition-all shadow-sm ${showMoreMenu ? 'text-[#00a651] ring-2 ring-emerald-50' : 'text-slate-400'}`}>
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {showMoreMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-100 rounded-xl shadow-2xl z-[100] py-2 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-slate-200">
               <button onClick={handleDeleteSelected} className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-bold text-slate-600 hover:bg-emerald-50 hover:text-[#00a651]"><Trash2 className="w-5 h-5 text-emerald-500" /> Xóa hàng loạt</button>
               <button onClick={() => {setViewMode('import'); setShowMoreMenu(false);}} className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-bold text-slate-600 hover:bg-emerald-50 hover:text-[#00a651]"><Download className="w-5 h-5 text-emerald-500" /> Nhập khẩu từ Excel</button>
               <button onClick={handleExportExcel} className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-bold text-slate-600 hover:bg-emerald-50 hover:text-[#00a651]"><Upload className="w-5 h-5 text-emerald-500" /> Xuất khẩu Excel</button>
               <div className="h-px bg-slate-100 my-2 mx-4"></div>
               <button onClick={handleResetPasswords} className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-bold text-slate-600 hover:bg-emerald-50 hover:text-[#00a651]"><KeyRound className="w-5 h-5 text-emerald-500" /> Đặt lại mật khẩu mặc định</button>
               <button onClick={toggleFullscreen} className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-bold text-slate-600 hover:bg-emerald-50 hover:text-[#00a651]"><Maximize2 className="w-5 h-5 text-emerald-500" /> Toàn màn hình (F11)</button>
            </div>
          )}
        </div>
      </div>

      {/* Main Table Content */}
      <div className="flex-1 overflow-auto bg-white custom-scrollbar">
        <table className="w-full border-collapse min-w-[1200px]">
          <thead className="bg-[#f8f9fa] sticky top-0 z-20">
            <tr className="border-b border-slate-200">
              <th rowSpan={2} className="w-12 border-r border-slate-200 text-center">
                <input type="checkbox" className="w-4 h-4 accent-[#00a651]" onChange={toggleSelectAll} checked={selectedIds.size > 0 && selectedIds.size === filteredAndSortedUsers.length} />
              </th>
              <th colSpan={3} className="text-[12px] font-bold text-slate-800 py-2 border-r border-slate-200">Thông tin {activeTab === 'student' ? 'học sinh' : 'giáo viên'}</th>
              <th colSpan={4} className="text-[12px] font-bold text-slate-800 py-2 border-r border-slate-200">Thông tin thẻ</th>
              <th colSpan={activeTab === 'teacher' ? 2 : 1} className="text-[12px] font-bold text-slate-800 py-2 border-r border-slate-200">Thông tin tài khoản</th>
              <th rowSpan={2} className="text-[12px] font-bold text-slate-800 py-2 border-r border-slate-200 w-32">Trạng thái</th>
              <th rowSpan={2} className="text-[12px] font-bold text-slate-800 py-2 w-24">Thao tác</th>
            </tr>
            <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-800 uppercase">
              <th onClick={() => handleSort('name')} className="px-4 py-2 border-r border-slate-200 cursor-pointer hover:bg-slate-100"><div className="flex items-center justify-center gap-2">Họ tên {getSortIcon('name')}</div></th>
              <th onClick={() => handleSort('classOrDept')} className="px-4 py-2 border-r border-slate-200 cursor-pointer hover:bg-slate-100"><div className="flex items-center justify-center gap-2">{activeTab === 'student' ? 'Lớp' : 'Phòng ban'} {getSortIcon('classOrDept')}</div></th>
              <th onClick={() => handleSort('dob')} className="px-4 py-2 border-r border-slate-200 cursor-pointer hover:bg-slate-100"><div className="flex items-center justify-center gap-2">Ngày sinh {getSortIcon('dob')}</div></th>
              <th onClick={() => handleSort('card_code')} className="px-4 py-2 border-r border-slate-200 cursor-pointer hover:bg-slate-100"><div className="flex items-center justify-center gap-2">Mã thẻ {getSortIcon('card_code')}</div></th>
              <th className="px-4 py-2 border-r border-slate-200">Ngày cấp</th>
              <th className="px-4 py-2 border-r border-slate-200">Ngày hiệu lực</th>
              <th onClick={() => handleSort('expiry_date')} className="px-4 py-2 border-r border-slate-200 cursor-pointer hover:bg-slate-100"><div className="flex items-center justify-center gap-2">Ngày hết hạn {getSortIcon('expiry_date')}</div></th>
              <th className="px-4 py-2 border-r border-slate-200">Số điện thoại</th>
              {activeTab === 'teacher' && <th className="px-4 py-2 border-r border-slate-200 text-[10px]">Lưu thư viện</th>}
            </tr>
            <tr className="bg-white border-b border-slate-200">
              <td className="p-1 border-r border-slate-200"></td>
              <td className="p-1 border-r border-slate-200">
                <div className="relative flex items-center">
                  <Filter className="absolute left-2 w-3 h-3 text-slate-300" />
                  <input type="text" value={filters.name} onChange={(e) => setFilters({...filters, name: e.target.value})} className="w-full pl-6 pr-2 py-1 border border-slate-200 rounded text-xs" />
                </div>
              </td>
              <td className="p-1 border-r border-slate-200">
                <div className="relative flex items-center">
                  <Filter className="absolute left-2 w-3 h-3 text-slate-300" />
                  <input type="text" value={filters.classOrDept} onChange={(e) => setFilters({...filters, classOrDept: e.target.value})} className="w-full pl-6 pr-2 py-1 border border-slate-200 rounded text-xs" />
                </div>
              </td>
              <td className="p-1 border-r border-slate-200">
                <div className="relative flex items-center justify-center">
                   <Calendar className="w-4 h-4 text-[#00a651]" />
                </div>
              </td>
              <td className="p-1 border-r border-slate-200">
                <div className="relative flex items-center">
                   <Filter className="absolute left-2 w-3 h-3 text-slate-300" />
                   <input type="text" value={filters.cardCode} onChange={(e) => setFilters({...filters, cardCode: e.target.value})} className="w-full pl-6 pr-2 py-1 border border-slate-200 rounded text-xs" />
                </div>
              </td>
              <td colSpan={7} className="bg-slate-50/30"></td>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAndSortedUsers.map((u) => (
              <tr key={u.id} className={`hover:bg-emerald-50/30 transition-colors group text-[13px] text-slate-700 ${selectedIds.has(u.id) ? 'bg-emerald-50' : ''}`}>
                <td className="p-2 text-center border-r border-slate-50">
                  <input type="checkbox" className="w-4 h-4 accent-[#00a651] cursor-pointer" checked={selectedIds.has(u.id)} onChange={() => toggleSelectRow(u.id)} />
                </td>
                <td className="px-4 py-3 border-r border-slate-50 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><UserIcon className="w-4 h-4" /></div>
                   {u.name}
                </td>
                <td className="px-4 py-3 border-r border-slate-50 text-center font-bold text-slate-600">{u.class_name || u.department || '-'}</td>
                <td className="px-4 py-3 border-r border-slate-50 text-center">{u.dob || '-'}</td>
                <td className="px-4 py-3 border-r border-slate-50 text-center font-black text-[#00a651]">{u.card_code || '-'}</td>
                <td className="px-4 py-3 border-r border-slate-50 text-center">04/09/2023</td>
                <td className="px-4 py-3 border-r border-slate-50 text-center">05/09/2023</td>
                <td className="px-4 py-3 border-r border-slate-50 text-center text-red-500 font-bold">{u.expiry_date || '31/05/2025'}</td>
                <td className="px-4 py-3 border-r border-slate-50 text-center">{u.phone || '-'}</td>
                {activeTab === 'teacher' && (
                  <td className="px-4 py-3 border-r border-slate-50 text-center">
                    <input type="checkbox" className="w-4 h-4 accent-[#00a651]" />
                  </td>
                )}
                <td className="px-4 py-3 border-r border-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Đang theo dõi</span>
                    <button className="w-8 h-4 bg-[#00a651] rounded-full relative shadow-inner"><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div></button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button className="text-emerald-500 hover:bg-emerald-100 p-1.5 rounded transition-all"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(u.id)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest">
        <div>Hiển thị <span className="text-slate-900 mx-1">{filteredAndSortedUsers.length}</span> / <span className="text-slate-900 mx-1">{users.length}</span></div>
        {selectedIds.size > 0 && <div className="text-[#00a651]">Đã chọn {selectedIds.size} bạn đọc</div>}
      </div>

      {showAddModal && <AddUserModal role={activeTab} onClose={() => setShowAddModal(false)} onRefresh={onRefresh} />}
    </div>
  );
};

export default AdminUserManagement;

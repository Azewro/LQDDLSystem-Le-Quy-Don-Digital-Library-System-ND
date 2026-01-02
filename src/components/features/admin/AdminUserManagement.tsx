
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Plus, Printer, MoreHorizontal, Edit, Trash2, Filter, ChevronRight, Calendar, ChevronDown, Download, Upload, KeyRound, Maximize2, CheckCircle2, AlertCircle, FileSpreadsheet, ArrowLeft, Loader2, X, MoreVertical, ToggleLeft as ToggleIcon, ArrowUp, ArrowDown, ChevronsUpDown, User as UserIcon } from 'lucide-react';
import { User } from '@/types';
import AddUserModal from '@/components/common/AddUserModal';
import * as XLSX from 'xlsx';
import { generateUsername, formatExcelDate } from '@/utils/userUtils';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/utils/authUtils';

interface AdminUserManagementProps {
  users: User[];
  onRefresh?: () => void;
  currentUser?: User | null;
}

type SortConfig = {
  key: keyof User | 'classOrDept';
  direction: 'asc' | 'desc' | null;
};

const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ users, onRefresh, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'student' | 'teacher' | 'admin'>('student');
  const [viewMode, setViewMode] = useState<'list' | 'import'>('list');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showInActive, setShowInActive] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ total: 0, current: 0 });
  const [logs, setLogs] = useState<{ msg: string, type: 'info' | 'success' | 'error' }[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewPage, setPreviewPage] = useState(1);
  const [mainPage, setMainPage] = useState(1);
  const PAGE_SIZE = 50;
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'classOrDept', direction: 'asc' });

  const [filters, setFilters] = useState({
    name: '',
    classOrDept: '',
    dob: '',
    cardCode: '',
    phone: '',
    issueDate: '',
    effectiveDate: '',
    expiryDate: '',
    status: 'all'
  });

  useEffect(() => { setMainPage(1); }, [activeTab, filters]);

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
    // Helper to convert yyyy-mm-dd to dd/mm/yyyy for comparison
    const formatDateForCompare = (isoDate: string) => {
      if (!isoDate) return '';
      const [y, m, d] = isoDate.split('-');
      return `${d}/${m}/${y}`;
    };

    let result = users.filter(u => {
      if (u.role !== activeTab) return false;
      const nameMatch = u.name.toLowerCase().includes(filters.name.toLowerCase());
      const classMatch = (u.class_name || u.department || '').toLowerCase().includes(filters.classOrDept.toLowerCase());
      const cardMatch = (u.card_code || '').toLowerCase().includes(filters.cardCode.toLowerCase());
      const dobMatch = !filters.dob || (u.dob || '') === formatDateForCompare(filters.dob);
      const phoneMatch = !filters.phone || (u.phone || '').includes(filters.phone);
      const issueDateMatch = !filters.issueDate || (u.issue_date || '') === formatDateForCompare(filters.issueDate);
      const effectiveDateMatch = !filters.effectiveDate || (u.effective_date || '') === formatDateForCompare(filters.effectiveDate);
      const expiryDateMatch = !filters.expiryDate || (u.expiry_date || '') === formatDateForCompare(filters.expiryDate);
      return nameMatch && classMatch && cardMatch && dobMatch && phoneMatch && issueDateMatch && effectiveDateMatch && expiryDateMatch;
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

    const idsToDelete = Array.from(selectedIds);
    if (currentUser && idsToDelete.includes(currentUser.id)) {
      alert("Bạn không thể xóa tài khoản của chính mình trong lệnh xóa hàng loạt. Vui lòng bỏ chọn tài khoản của bạn.");
      return;
    }

    setImporting(true);
    setImportProgress({ total: idsToDelete.length, current: 0 });

    try {
      const BATCH_SIZE = 100;
      for (let i = 0; i < idsToDelete.length; i += BATCH_SIZE) {
        const batch = idsToDelete.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('profiles').delete().in('id', batch);
        if (error) throw error;
        setImportProgress(prev => ({ ...prev, current: Math.min(i + BATCH_SIZE, idsToDelete.length) }));
      }
      setSelectedIds(new Set());
      onRefresh?.();
      alert("Đã xóa thành công!");
    } catch (err: any) { alert("Lỗi khi xóa: " + err.message); }
    finally {
      setImporting(false);
      setImportProgress({ total: 0, current: 0 });
    }
  };

  const handleDelete = async (id: string) => {
    if (currentUser && id === currentUser.id) {
      alert("Bạn không thể tự xóa tài khoản của chính mình!");
      return;
    }
    if (!window.confirm("Xóa bạn đọc này?")) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      onRefresh?.();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowAddModal(true);
  };

  const handleExportExcel = () => {
    const isStudent = activeTab === 'student';
    const isTeacher = activeTab === 'teacher';
    const roleName = isStudent ? 'học sinh' : (isTeacher ? 'giáo viên' : 'quản trị viên');
    const classOrDeptHeader = isStudent ? 'Lớp (*)' : (isTeacher ? 'Phòng ban (*)' : 'Bộ phận (*)');

    // Row 1: Note
    const row1 = ["Lưu ý: Vui lòng nhập các thông tin ngày như Ngày sinh, Ngày cấp, Ngày hiệu lực, Ngày hết hạn ... theo định dạng ngày/tháng/năm (dd/mm/yyyy). Ví dụ: 22/02/2002"];

    // Row 2: Main Categories
    const row2 = [
      "Mã vạch (*)",
      `Thông tin ${roleName}`, "", "", "",
      "Thông tin thẻ", "", "", "",
      "Thông tin tài khoản"
    ];

    // Row 3: Sub Headers
    const row3 = [
      "",
      "Họ và tên (*)",
      classOrDeptHeader,
      "Ngày sinh",
      "Giới tính",
      "Mã thẻ (*)",
      "Ngày cấp",
      "Ngày hiệu lực",
      "Ngày hết hạn",
      "Số điện thoại"
    ];

    // Data Rows
    const dataRows = filteredAndSortedUsers.map(u => [
      u.barcode || "",
      u.name || "",
      u.class_name || u.department || "",
      u.dob || "",
      u.gender || "",
      u.card_code || "",
      u.issue_date || "",
      u.effective_date || "",
      u.expiry_date || "",
      u.phone || ""
    ]);

    const worksheetData = [row1, row2, row3, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Merges
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }, // Row 1: A1-J1
      { s: { r: 1, c: 0 }, e: { r: 2, c: 0 } }, // Mã vạch: A2-A3
      { s: { r: 1, c: 1 }, e: { r: 1, c: 4 } }, // Thông tin học sinh/gv: B2-E2
      { s: { r: 1, c: 5 }, e: { r: 1, c: 8 } }, // Thông tin thẻ: F2-I2
    ];

    // Column widths
    ws['!cols'] = [
      { wch: 15 }, // A
      { wch: 25 }, // B
      { wch: 15 }, // C
      { wch: 15 }, // D
      { wch: 10 }, // E
      { wch: 15 }, // F
      { wch: 15 }, // G
      { wch: 15 }, // H
      { wch: 15 }, // I
      { wch: 15 }, // J
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSach");
    XLSX.writeFile(wb, `DanhSach_${activeTab}.xlsx`);
  };

  const handleResetPasswords = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Đặt lại mật khẩu cho ${selectedIds.size} bạn đọc đã chọn?`)) return;

    const idsToReset = Array.from(selectedIds);
    setImporting(true);
    setImportProgress({ total: idsToReset.length, current: 0 });

    try {
      const BATCH_SIZE = 20; // Parallel batches
      for (let i = 0; i < idsToReset.length; i += BATCH_SIZE) {
        const batch = idsToReset.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (id) => {
          const u = users.find(user => user.id === id);
          const hashed = await hashPassword(u?.dob || '123456');
          const { error } = await supabase.from('profiles').update({ password: hashed, must_change_password: true }).eq('id', id);
          if (error) throw error;
        }));
        setImportProgress(prev => ({ ...prev, current: Math.min(i + BATCH_SIZE, idsToReset.length) }));
      }
      alert("Đã reset mật khẩu thành công!");
    } catch (err: any) { alert("Lỗi khi đặt lại mật khẩu: " + err.message); }
    finally {
      setImporting(false);
      setImportProgress({ total: 0, current: 0 });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await supabase.from('profiles').update({ is_active: !currentStatus }).eq('id', userId);
      onRefresh?.();
    } catch (err: any) { console.error(err); }
  };

  const toggleLibrarian = async (userId: string, currentValue: boolean) => {
    try {
      await supabase.from('profiles').update({ is_librarian: !currentValue }).eq('id', userId);
      onRefresh?.();
    } catch (err: any) { console.error(err); }
  };

  // --- IMPORT LOGIC CẬP NHẬT CHO MẪU ẢNH ---
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

        // Tìm dòng header (dòng chứa "Họ và tên")
        const headerRowIndex = data.findIndex(row =>
          row.some(cell => cell && cell.toString().includes("Họ và tên"))
        );

        if (headerRowIndex === -1) {
          setLogs(prev => [{ msg: "Không tìm thấy cột 'Họ và tên' trong file!", type: 'error' }, ...prev]);
          setImporting(false);
          return;
        }

        const currentHeaders = Array.from(data[headerRowIndex] || []).map(h => h?.toString().toLowerCase().trim() || "");
        const aboveHeaders = headerRowIndex > 0 ? Array.from(data[headerRowIndex - 1] || []).map(h => h?.toString().toLowerCase().trim() || "") : [];

        // Gộp header từ dòng hiện tại và dòng phía trên (xử lý merged cells)
        const headers = currentHeaders.map((h, i) => h || aboveHeaders[i] || "");
        const rows = data.slice(headerRowIndex + 1);

        // Hàm tiện ích để lấy giá trị theo từ khóa header (không phân biệt hoa thường, chấp nhận dấu *)
        const getValue = (row: any[], keyword: string) => {
          if (!row || !keyword) return "";
          const searchKey = keyword.toLowerCase();
          const idx = headers.findIndex(h => h.includes(searchKey));
          return idx !== -1 ? (row[idx] || "") : "";
        };

        const mappedData = rows.filter(row => row.length > 0 && getValue(row, "Họ và tên")).map(row => {
          const rawClassName = getValue(row, "Lớp");
          const rawDeptName = getValue(row, "Phòng ban");
          const role = rawDeptName ? 'teacher' : 'student';

          return {
            barcode: getValue(row, "Mã vạch"),
            full_name: getValue(row, "Họ và tên"),
            class_or_dept: rawClassName || rawDeptName,
            dob: formatExcelDate(getValue(row, "Ngày sinh")),
            gender: getValue(row, "Giới tính"),
            card_code: getValue(row, "Mã thẻ"),
            phone: getValue(row, "Số điện thoại"),
            role: role,
            issue_date: formatExcelDate(getValue(row, "Ngày cấp")),
            effective_date: formatExcelDate(getValue(row, "Ngày hiệu lực")),
            expiry_date: formatExcelDate(getValue(row, "Ngày hết hạn")),
            is_active: true
          };
        });

        setPreviewData(mappedData);
        setPreviewPage(1);
        setLogs(prev => [{ msg: `Đã đọc thành công ${mappedData.length} bản ghi`, type: 'success' }, ...prev]);
      } catch (err) {
        console.error('Excel import error:', err);
        setLogs(prev => [{ msg: "Lỗi xử lý file Excel!", type: 'error' }, ...prev]);
      } finally {
        setImporting(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const saveImportToDatabase = async () => {
    if (previewData.length === 0) return;
    setImporting(true);
    setImportProgress({ total: previewData.length, current: 0 });

    try {
      const BATCH_SIZE = 50;
      for (let i = 0; i < previewData.length; i += BATCH_SIZE) {
        const batch = previewData.slice(i, i + BATCH_SIZE);

        // Song song hóa việc hash mật khẩu trong batch
        const processedBatch = await Promise.all(batch.map(async (p) => {
          const username = generateUsername(p.card_code, p.full_name);
          const defaultPass = p.dob || '123456';
          const hashedPassword = await hashPassword(defaultPass);

          return {
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
            issue_date: p.issue_date,
            effective_date: p.effective_date,
            expiry_date: p.expiry_date,
            password: hashedPassword,
            must_change_password: true,
            is_active: p.is_active ?? true
          };
        }));

        const { error } = await supabase.from('profiles').upsert(processedBatch, { onConflict: 'username' });
        if (error) throw error;

        const newCurrent = Math.min(i + BATCH_SIZE, previewData.length);
        setImportProgress({ total: previewData.length, current: newCurrent });
      }

      onRefresh?.();
      setPreviewData([]);
      setViewMode('list');
      alert(`Đã nhập khẩu thành công ${previewData.length} bản ghi!`);
    } catch (err: any) {
      alert("Lỗi khi lưu dữ liệu theo lô: " + err.message);
    } finally {
      setImporting(false);
      setImportProgress({ total: 0, current: 0 });
    }
  };

  if (viewMode === 'import') {
    return (
      <div className="flex flex-col h-full bg-[#f4f6f8]">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setViewMode('list')} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Nhập liệu bạn đọc từ Excel</h2>
          </div>
          {previewData.length > 0 && (
            <button onClick={saveImportToDatabase} disabled={importing} className="bg-[#00a651] text-white px-8 py-2 rounded-xl font-black text-xs uppercase shadow-lg flex items-center gap-2">
              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {importing ? "ĐANG LƯU..." : "XÁC NHẬN NHẬP KHẨU"}
            </button>
          )}
        </div>
        <div className="flex-1 p-8 overflow-y-auto relative">
          {importing && importProgress.total > 0 && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-10 text-center animate-in fade-in">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <Loader2 className="w-10 h-10 text-[#00a651] animate-spin" />
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Đang xử lý dữ liệu</h3>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[11px] mb-8">Vui lòng không đóng trình duyệt hoặc chuyển trang</p>
              <div className="w-full max-w-md bg-slate-100 h-4 rounded-full overflow-hidden mb-4 border border-slate-200">
                <div
                  className="bg-[#00a651] h-full transition-all duration-300 shadow-lg shadow-emerald-500/20"
                  style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                ></div>
              </div>
              <div className="flex items-center gap-4 text-emerald-600 font-black text-sm">
                <span>{importProgress.current} / {importProgress.total}</span>
                <span className="opacity-30">|</span>
                <span>{Math.round((importProgress.current / importProgress.total) * 100)}%</span>
              </div>
            </div>
          )}
          <div className="grid lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <h3 className="text-[13px] font-black text-slate-800 uppercase mb-6">Chọn file dữ liệu</h3>
                <div className="relative border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center bg-slate-50/50 hover:border-[#00a651] transition-all group">
                  <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <Upload className="w-10 h-10 text-slate-300 mb-4 group-hover:text-[#00a651]" />
                  <p className="text-sm font-bold text-slate-500">Kéo thả hoặc click để tải lên</p>
                </div>
                <div className="mt-8 space-y-2">
                  {logs.map((log, i) => (
                    <div key={i} className={`text-[11px] font-bold p-3 rounded-xl flex items-center gap-2 ${log.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                      {log.msg}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Bản xem trước dữ liệu ({previewData.length})</h3>
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-xs">
                  <thead className="bg-white sticky top-0 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                    <tr>
                      <th className="px-4 py-4 text-center border-r border-slate-50">STT</th>
                      <th className="px-4 py-4 text-left border-r border-slate-50">Bạn đọc</th>
                      <th className="px-4 py-4 text-center border-r border-slate-50">Lớp/Phòng</th>
                      <th className="px-4 py-4 text-center border-r border-slate-50">Ngày sinh</th>
                      <th className="px-4 py-4 text-center border-r border-slate-50">Mã thẻ</th>
                      <th className="px-4 py-4 text-center border-r border-slate-50">Ngày cấp</th>
                      <th className="px-4 py-4 text-center border-r border-slate-50">Hiệu lực</th>
                      <th className="px-4 py-4 text-center border-r border-slate-50">Hết hạn</th>
                      <th className="px-4 py-4 text-center border-r border-slate-50">Trạng thái</th>
                      <th className="px-4 py-4 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {previewData.slice((previewPage - 1) * PAGE_SIZE, previewPage * PAGE_SIZE).map((p, i) => {
                      const globalIndex = (previewPage - 1) * PAGE_SIZE + i;
                      return (
                        <tr key={globalIndex} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-4 py-3 text-center border-r border-slate-50 text-slate-400 font-mono">{globalIndex + 1}</td>
                          <td className="px-4 py-3 border-r border-slate-50 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                              <UserIcon className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-slate-700">{p.full_name}</span>
                          </td>
                          <td className="px-4 py-3 border-r border-slate-50 text-center font-bold text-slate-600">{p.class_or_dept || '-'}</td>
                          <td className="px-4 py-3 border-r border-slate-50 text-center text-slate-500">{p.dob || '-'}</td>
                          <td className="px-4 py-3 border-r border-slate-50 text-center font-black text-[#00a651]">{p.card_code || '-'}</td>
                          <td className="px-4 py-3 border-r border-slate-50 text-center text-slate-500">{p.issue_date || '-'}</td>
                          <td className="px-4 py-3 border-r border-slate-50 text-center text-slate-500">{p.effective_date || '-'}</td>
                          <td className="px-4 py-3 border-r border-slate-50 text-center text-red-500 font-bold">{p.expiry_date || '-'}</td>
                          <td className="px-4 py-3 border-r border-slate-50 text-center">
                            <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Sẽ kích hoạt</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => setPreviewData(prev => prev.filter((_, idx) => idx !== globalIndex))} className="text-red-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination for Preview */}
              <div className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                <div>Hiển thị <span className="text-slate-900 mx-1">{Math.min(previewData.length - (previewPage - 1) * PAGE_SIZE, PAGE_SIZE)}</span> / <span className="text-slate-900 mx-1">{previewData.length}</span></div>

                {previewData.length > PAGE_SIZE && (
                  <div className="flex items-center gap-2">
                    <span className="mr-4 text-slate-400">Trang {previewPage} / {Math.ceil(previewData.length / PAGE_SIZE)}</span>
                    <button
                      disabled={previewPage === 1}
                      onClick={() => setPreviewPage(p => p - 1)}
                      className="px-3 py-1 bg-white border border-slate-200 rounded text-[10px] font-black disabled:opacity-30 hover:bg-slate-50 transition-colors"
                    >
                      Trình trước
                    </button>
                    <button
                      disabled={previewPage >= Math.ceil(previewData.length / PAGE_SIZE)}
                      onClick={() => setPreviewPage(p => p + 1)}
                      className="px-3 py-1 bg-white border border-slate-200 rounded text-[10px] font-black disabled:opacity-30 hover:bg-slate-50 transition-colors"
                    >
                      Trình sau
                    </button>
                  </div>
                )}
              </div>
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
    <div className="flex flex-col h-full bg-[#f4f6f8] relative z-20">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200 flex items-center">
        <button onClick={() => { setActiveTab('student'); setSelectedIds(new Set()); }} className={`px-8 py-4 text-[13px] font-bold transition-all relative ${activeTab === 'student' ? 'text-[#00a651] bg-slate-50/50' : 'text-slate-500 hover:text-slate-700'}`}>
          Học sinh {activeTab === 'student' && <div className="absolute top-0 left-0 w-full h-[3px] bg-[#00a651]"></div>}
        </button>
        <button onClick={() => { setActiveTab('teacher'); setSelectedIds(new Set()); }} className={`px-8 py-4 text-[13px] font-bold transition-all relative ${activeTab === 'teacher' ? 'text-[#00a651] bg-slate-50/50' : 'text-slate-500 hover:text-slate-700'}`}>
          Giáo viên {activeTab === 'teacher' && <div className="absolute top-0 left-0 w-full h-[3px] bg-[#00a651]"></div>}
        </button>
        <button onClick={() => { setActiveTab('admin'); setSelectedIds(new Set()); }} className={`px-8 py-4 text-[13px] font-bold transition-all relative ${activeTab === 'admin' ? 'text-[#00a651] bg-slate-50/50' : 'text-slate-500 hover:text-slate-700'}`}>
          Quản trị {activeTab === 'admin' && <div className="absolute top-0 left-0 w-full h-[3px] bg-[#00a651]"></div>}
        </button>
      </div>

      {/* Action Bar */}
      <div className="p-4 flex items-center justify-end gap-4 bg-[#f8f9fa] relative z-30">
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
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-100 rounded-xl shadow-2xl z-[100] py-2 animate-in fade-in zoom-in-95 duration-150">
              <button onClick={handleDeleteSelected} className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-bold text-slate-600 hover:bg-emerald-50 hover:text-[#00a651]"><Trash2 className="w-5 h-5 text-emerald-500" /> Xóa hàng loạt</button>
              <button onClick={() => { setViewMode('import'); setShowMoreMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-bold text-slate-600 hover:bg-emerald-50 hover:text-[#00a651]"><Download className="w-5 h-5 text-emerald-500" /> Nhập khẩu từ Excel</button>
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
              <th colSpan={3} className="text-[12px] font-bold text-slate-800 py-2 border-r border-slate-200">Thông tin {activeTab === 'student' ? 'học sinh' : activeTab === 'teacher' ? 'giáo viên' : 'quản trị viên'}</th>
              <th colSpan={4} className="text-[12px] font-bold text-slate-800 py-2 border-r border-slate-200">Thông tin thẻ</th>
              <th colSpan={activeTab === 'teacher' ? 2 : 1} className="text-[12px] font-bold text-slate-800 py-2 border-r border-slate-200">Thông tin tài khoản</th>
              <th rowSpan={2} className="text-[12px] font-bold text-slate-800 py-2 border-r border-slate-200 w-32">Trạng thái</th>
              <th rowSpan={2} className="text-[12px] font-bold text-slate-800 py-2 w-24">Thao tác</th>
            </tr>
            <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-800 uppercase">
              <th onClick={() => handleSort('name')} className="px-4 py-2 border-r border-slate-200 cursor-pointer hover:bg-slate-100"><div className="flex items-center justify-center gap-2">Họ tên {getSortIcon('name')}</div></th>
              <th onClick={() => handleSort('classOrDept')} className="px-4 py-2 border-r border-slate-200 cursor-pointer hover:bg-slate-100"><div className="flex items-center justify-center gap-2">{activeTab === 'student' ? 'Lớp' : activeTab === 'teacher' ? 'Phòng ban' : 'Bộ phận/Chức vụ'} {getSortIcon('classOrDept')}</div></th>
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
                  <input type="text" placeholder="Tìm..." value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} className="w-full pl-6 pr-2 py-1 border border-slate-200 rounded text-xs focus:border-emerald-400 focus:outline-none" />
                </div>
              </td>
              <td className="p-1 border-r border-slate-200">
                <div className="relative flex items-center">
                  <Filter className="absolute left-2 w-3 h-3 text-slate-300" />
                  <input type="text" placeholder="Tìm..." value={filters.classOrDept} onChange={(e) => setFilters({ ...filters, classOrDept: e.target.value })} className="w-full pl-6 pr-2 py-1 border border-slate-200 rounded text-xs focus:border-emerald-400 focus:outline-none" />
                </div>
              </td>
              <td className="p-1 border-r border-slate-200">
                <input
                  type="date"
                  value={filters.dob}
                  onChange={(e) => setFilters({ ...filters, dob: e.target.value })}
                  className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:border-emerald-400 focus:outline-none cursor-pointer"
                  title="Lọc ngày sinh"
                />
              </td>
              <td className="p-1 border-r border-slate-200">
                <div className="relative flex items-center">
                  <Filter className="absolute left-2 w-3 h-3 text-slate-300" />
                  <input type="text" placeholder="Tìm..." value={filters.cardCode} onChange={(e) => setFilters({ ...filters, cardCode: e.target.value })} className="w-full pl-6 pr-2 py-1 border border-slate-200 rounded text-xs focus:border-emerald-400 focus:outline-none" />
                </div>
              </td>
              <td className="p-1 border-r border-slate-200">
                <input
                  type="date"
                  value={filters.issueDate}
                  onChange={(e) => setFilters({ ...filters, issueDate: e.target.value })}
                  className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:border-emerald-400 focus:outline-none cursor-pointer"
                  title="Lọc ngày cấp"
                />
              </td>
              <td className="p-1 border-r border-slate-200">
                <input
                  type="date"
                  value={filters.effectiveDate}
                  onChange={(e) => setFilters({ ...filters, effectiveDate: e.target.value })}
                  className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:border-emerald-400 focus:outline-none cursor-pointer"
                  title="Lọc ngày hiệu lực"
                />
              </td>
              <td className="p-1 border-r border-slate-200">
                <input
                  type="date"
                  value={filters.expiryDate}
                  onChange={(e) => setFilters({ ...filters, expiryDate: e.target.value })}
                  className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:border-emerald-400 focus:outline-none cursor-pointer"
                  title="Lọc ngày hết hạn"
                />
              </td>
              <td className="p-1 border-r border-slate-200">
                <div className="relative flex items-center">
                  <Filter className="absolute left-2 w-3 h-3 text-slate-300" />
                  <input type="text" placeholder="SĐT..." value={filters.phone} onChange={(e) => setFilters({ ...filters, phone: e.target.value })} className="w-full pl-6 pr-2 py-1 border border-slate-200 rounded text-xs focus:border-emerald-400 focus:outline-none" />
                </div>
              </td>
              {activeTab === 'teacher' && <td className="p-1 border-r border-slate-200 bg-slate-50/30"></td>}
              <td className="p-1 border-r border-slate-200 bg-slate-50/30"></td>
              <td className="p-1 bg-slate-50/30"></td>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAndSortedUsers.slice((mainPage - 1) * PAGE_SIZE, mainPage * PAGE_SIZE).map((u) => (
              <tr key={u.id} className={`hover:bg-emerald-50/30 transition-colors group text-[13px] text-slate-700 ${selectedIds.has(u.id) ? 'bg-emerald-50' : ''}`}>
                <td className="p-2 text-center border-r border-slate-50">
                  <input type="checkbox" className="w-4 h-4 accent-[#00a651] cursor-pointer" checked={selectedIds.has(u.id)} onChange={() => toggleSelectRow(u.id)} />
                </td>
                <td className="px-4 py-3 border-r border-slate-50 flex items-center gap-3">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><UserIcon className="w-4 h-4" /></div>
                  )}
                  {u.name}
                </td>
                <td className="px-4 py-3 border-r border-slate-50 text-center font-bold text-slate-600">{u.class_name || u.department || '-'}</td>
                <td className="px-4 py-3 border-r border-slate-50 text-center">{u.dob || '-'}</td>
                <td className="px-4 py-3 border-r border-slate-50 text-center font-black text-[#00a651]">{u.card_code || '-'}</td>
                <td className="px-4 py-3 border-r border-slate-50 text-center">{u.issue_date || '-'}</td>
                <td className="px-4 py-3 border-r border-slate-50 text-center">{u.effective_date || '-'}</td>
                <td className="px-4 py-3 border-r border-slate-50 text-center text-red-500 font-bold">{u.expiry_date || '-'}</td>
                <td className="px-4 py-3 border-r border-slate-50 text-center">{u.phone || '-'}</td>
                {activeTab === 'teacher' && (
                  <td className="px-4 py-3 border-r border-slate-50 text-center">
                    <button
                      onClick={() => toggleLibrarian(u.id, u.is_librarian ?? false)}
                      className={`w-9 h-5 rounded-full relative shadow-inner transition-colors ${u.is_librarian ? 'bg-[#00a651]' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${u.is_librarian ? 'right-0.5' : 'left-0.5'}`}></div>
                    </button>
                  </td>
                )}
                <td className="px-4 py-3 border-r border-slate-50">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold uppercase ${u.is_active !== false ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {u.is_active !== false ? 'Đang theo dõi' : 'Ngừng theo dõi'}
                    </span>
                    <button
                      onClick={() => toggleUserStatus(u.id, u.is_active ?? true)}
                      className={`w-9 h-5 rounded-full relative shadow-inner transition-colors ${u.is_active !== false ? 'bg-[#00a651]' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${u.is_active !== false ? 'right-0.5' : 'left-0.5'}`}></div>
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => handleEdit(u)} className="text-emerald-500 hover:bg-emerald-100 p-1.5 rounded transition-all"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(u.id)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest">
        <div className="flex items-center gap-8">
          <div>Hiển thị <span className="text-slate-900 mx-1">{Math.min(filteredAndSortedUsers.length, PAGE_SIZE)}</span> / <span className="text-slate-900 mx-1">{filteredAndSortedUsers.length}</span></div>
          {selectedIds.size > 0 && <div className="text-[#00a651]">Đã chọn {selectedIds.size} bạn đọc</div>}
        </div>

        {filteredAndSortedUsers.length > PAGE_SIZE && (
          <div className="flex items-center gap-2">
            <span className="mr-4 text-slate-400">Trang {mainPage} / {Math.ceil(filteredAndSortedUsers.length / PAGE_SIZE)}</span>
            <button
              disabled={mainPage === 1}
              onClick={() => setMainPage(p => p - 1)}
              className="px-3 py-1 bg-white border border-slate-200 rounded text-[10px] font-black disabled:opacity-30 hover:bg-slate-50 transition-colors"
            >
              Trình trước
            </button>
            <button
              disabled={mainPage >= Math.ceil(filteredAndSortedUsers.length / PAGE_SIZE)}
              onClick={() => setMainPage(p => p + 1)}
              className="px-3 py-1 bg-white border border-slate-200 rounded text-[10px] font-black disabled:opacity-30 hover:bg-slate-50 transition-colors"
            >
              Trình sau
            </button>
          </div>
        )}
      </div>

      {showAddModal && <AddUserModal role={activeTab} userToEdit={editingUser} onClose={() => { setShowAddModal(false); setEditingUser(null); }} onRefresh={onRefresh} />}
    </div>
  );
};

export default AdminUserManagement;

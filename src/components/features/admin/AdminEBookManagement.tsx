import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Calendar, User, Image as ImageIcon, X, Save, ArrowLeft, Loader2, FileText, Tablet, ExternalLink, FolderOpen, ChevronRight, CloudDownload } from 'lucide-react';
import { EBook, EBookFolder } from '@/types';
import { supabase } from '@/lib/supabase';
import { uploadFile } from '@/services/storageService';
import DriveImportTool from './DriveImportTool';

interface AdminEBookManagementProps {
    ebooks: EBook[];
    folders: EBookFolder[];
    onRefresh?: () => void;
}

const AdminEBookManagement: React.FC<AdminEBookManagementProps> = ({ ebooks, folders, onRefresh }) => {
    const [view, setView] = useState<'list' | 'editor' | 'import'>('list');
    const [editingBook, setEditingBook] = useState<Partial<EBook> | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 20;

    // Build folder tree
    const folderTree = useMemo(() => {
        const rootFolders = folders.filter(f => !f.parent_id);
        const getChildren = (parentId: string): EBookFolder[] =>
            folders.filter(f => f.parent_id === parentId);
        return { rootFolders, getChildren };
    }, [folders]);

    // Filter ebooks
    const filteredBooks = useMemo(() => {
        let result = ebooks;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(b =>
                b.title.toLowerCase().includes(term) ||
                b.author?.toLowerCase().includes(term)
            );
        }
        if (selectedFolder) {
            result = result.filter(b => b.folder_id === selectedFolder);
        }
        return result;
    }, [ebooks, searchTerm, selectedFolder]);

    const handleCreate = () => {
        setEditingBook({
            title: '',
            author: '',
            publisher: '',
            publication_year: new Date().getFullYear(),
            drive_file_id: '',
            description: '',
            grade: 'Tất cả',
            views: 0,
            favorites: 0
        });
        setView('editor');
        setError(null);
    };

    const handleEdit = (book: EBook) => {
        setEditingBook({ ...book });
        setView('editor');
        setError(null);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa sách này?")) return;
        try {
            const { error } = await supabase.from('ebooks').delete().eq('id', id);
            if (error) throw error;
            onRefresh?.();
        } catch (err: any) {
            alert("Lỗi khi xóa: " + err.message);
        }
    };

    const handleSave = async () => {
        if (!editingBook?.title || !editingBook?.drive_file_id) {
            setError("Vui lòng nhập tiêu đề và ID file Google Drive");
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const payload = {
                title: editingBook.title,
                author: editingBook.author,
                publisher: editingBook.publisher,
                publication_year: editingBook.publication_year,
                cover_url: editingBook.cover_url,
                drive_file_id: editingBook.drive_file_id,
                description: editingBook.description,
                grade: editingBook.grade,
                folder_id: editingBook.folder_id,
                page_count: editingBook.page_count
            };

            let result;
            if (editingBook.id) {
                result = await supabase.from('ebooks').update(payload).eq('id', editingBook.id);
            } else {
                result = await supabase.from('ebooks').insert([payload]);
            }

            if (result.error) throw result.error;
            onRefresh?.();
            setView('list');
        } catch (err: any) {
            setError("Lỗi khi lưu: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsSaving(true);
        try {
            const url = await uploadFile('articles', file);
            if (url) setEditingBook({ ...editingBook, cover_url: url });
        } catch (err: any) {
            setError("Lỗi upload ảnh: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // Extract file ID from Google Drive URL
    const extractDriveId = (url: string): string => {
        const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        return match ? match[1] : url;
    };

    const getDrivePreviewUrl = (fileId: string) =>
        `https://drive.google.com/file/d/${fileId}/preview`;

    const getDriveThumbnail = (fileId: string) =>
        `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;

    // Editor View
    if (view === 'editor') {
        return (
            <div className="p-8 max-w-5xl mx-auto animate-in slide-in-from-right-10 duration-300">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => setView('list')} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                        {editingBook?.id ? 'Sửa sách điện tử' : 'Thêm sách điện tử mới'}
                    </h2>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold">
                        {error}
                    </div>
                )}

                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            Tiêu đề sách <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={editingBook?.title || ''}
                            onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a651] text-base font-bold"
                            placeholder="VD: Đột phá Ngữ văn 9"
                        />
                    </div>

                    {/* Google Drive ID */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            Link hoặc ID file Google Drive <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={editingBook?.drive_file_id || ''}
                                onChange={(e) => setEditingBook({ ...editingBook, drive_file_id: extractDriveId(e.target.value) })}
                                className="flex-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a651] text-sm font-medium font-mono"
                                placeholder="Paste link Drive hoặc ID file"
                            />
                            {editingBook?.drive_file_id && (
                                <a
                                    href={getDrivePreviewUrl(editingBook.drive_file_id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-3 bg-emerald-50 text-[#00a651] rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-100 transition-all"
                                >
                                    <ExternalLink className="w-4 h-4" /> Xem thử
                                </a>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-400">
                            Paste link dạng: https://drive.google.com/file/d/xxx/view hoặc chỉ ID file
                        </p>
                    </div>

                    {/* Author & Publisher */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tác giả</label>
                            <input
                                type="text"
                                value={editingBook?.author || ''}
                                onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a651] text-sm font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Nhà xuất bản</label>
                            <input
                                type="text"
                                value={editingBook?.publisher || ''}
                                onChange={(e) => setEditingBook({ ...editingBook, publisher: e.target.value })}
                                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a651] text-sm font-medium"
                            />
                        </div>
                    </div>

                    {/* Year & Grade */}
                    <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Năm xuất bản</label>
                            <input
                                type="number"
                                value={editingBook?.publication_year || ''}
                                onChange={(e) => setEditingBook({ ...editingBook, publication_year: parseInt(e.target.value) })}
                                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a651] text-sm font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Cấp lớp</label>
                            <select
                                value={editingBook?.grade || 'Tất cả'}
                                onChange={(e) => setEditingBook({ ...editingBook, grade: e.target.value })}
                                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a651] text-sm font-medium"
                            >
                                <option value="Tất cả">Tất cả</option>
                                <option value="Khối 6">Khối 6</option>
                                <option value="Khối 7">Khối 7</option>
                                <option value="Khối 8">Khối 8</option>
                                <option value="Khối 9">Khối 9</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Số trang</label>
                            <input
                                type="number"
                                value={editingBook?.page_count || ''}
                                onChange={(e) => setEditingBook({ ...editingBook, page_count: parseInt(e.target.value) })}
                                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a651] text-sm font-medium"
                            />
                        </div>
                    </div>

                    {/* Folder */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Thư mục</label>
                        <select
                            value={editingBook?.folder_id || ''}
                            onChange={(e) => setEditingBook({ ...editingBook, folder_id: e.target.value || undefined })}
                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a651] text-sm font-medium"
                        >
                            <option value="">-- Không chọn thư mục --</option>
                            {folders.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Cover Image */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Ảnh bìa</label>
                        <div className="flex items-start gap-6">
                            <div className="w-32 h-44 bg-slate-100 rounded-xl overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center">
                                {editingBook?.cover_url ? (
                                    <img src={editingBook.cover_url} className="w-full h-full object-cover" alt="Cover" />
                                ) : editingBook?.drive_file_id ? (
                                    <img src={getDriveThumbnail(editingBook.drive_file_id)} className="w-full h-full object-cover" alt="Cover" />
                                ) : (
                                    <ImageIcon className="w-8 h-8 text-slate-300" />
                                )}
                            </div>
                            <div className="space-y-3">
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                    Mặc định sẽ lấy thumbnail từ Google Drive.<br />
                                    Hoặc upload ảnh bìa riêng:
                                </p>
                                <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[11px] font-bold uppercase cursor-pointer hover:bg-slate-200 transition-all">
                                    <ImageIcon className="w-4 h-4" /> Upload ảnh
                                    <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                                </label>
                                {editingBook?.drive_file_id && !editingBook?.cover_url && (
                                    <button
                                        onClick={() => setEditingBook({ ...editingBook, cover_url: getDriveThumbnail(editingBook.drive_file_id!) })}
                                        className="block text-[10px] text-[#00a651] font-bold hover:underline"
                                    >
                                        Dùng thumbnail từ Drive
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Mô tả / Giới thiệu</label>
                        <textarea
                            rows={4}
                            value={editingBook?.description || ''}
                            onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a651] text-sm font-medium resize-none"
                            placeholder="Nhập mô tả ngắn về cuốn sách..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                        <button
                            onClick={() => setView('list')}
                            className="px-6 py-3 text-slate-500 font-bold text-sm hover:text-slate-700"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-8 py-3 bg-[#00a651] text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isSaving ? 'Đang lưu...' : 'Lưu sách'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Import View
    if (view === 'import') {
        return (
            <div className="p-8 space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => setView('list')} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                        Import từ Google Drive
                    </h2>
                </div>
                <DriveImportTool onImportComplete={() => { onRefresh?.(); setView('list'); }} />
            </div>
        );
    }

    // List View
    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-emerald-50 rounded-2xl">
                        <Tablet className="w-6 h-6 text-[#00a651]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Quản lý Sách điện tử</h1>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Tích hợp Google Drive</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setView('import')}
                        className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        <CloudDownload className="w-5 h-5" /> Import từ Drive
                    </button>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 bg-[#00a651] text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                    >
                        <Plus className="w-5 h-5" /> Thêm sách mới
                    </button>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-wrap items-center gap-6">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tiêu đề, tác giả..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                    />
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase">
                    <span>Tổng: {filteredBooks.length} sách</span>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <th className="px-6 py-5 text-left">Sách</th>
                            <th className="px-6 py-5 text-left w-40">Tác giả</th>
                            <th className="px-6 py-5 text-left w-32">Cấp lớp</th>
                            <th className="px-6 py-5 text-center w-24">Xem</th>
                            <th className="px-6 py-5 text-center w-32">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredBooks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((book) => (
                            <tr key={book.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-16 h-22 rounded-lg overflow-hidden shadow-sm flex-shrink-0 bg-slate-100">
                                            <img
                                                src={book.cover_url || getDriveThumbnail(book.drive_file_id)}
                                                className="w-full h-full object-cover"
                                                alt={book.title}
                                            />
                                        </div>
                                        <div>
                                            <h4 className="text-[13px] font-bold text-slate-800 line-clamp-1 group-hover:text-[#00a651] transition-colors">
                                                {book.title}
                                            </h4>
                                            <p className="text-[10px] text-slate-400 mt-1">{book.publisher || 'Chưa có NXB'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">{book.author || '-'}</td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 bg-emerald-50 text-[#00a651] rounded-full text-[10px] font-bold">
                                        {book.grade}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="text-sm font-bold text-slate-600">{book.views}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <a
                                            href={getDrivePreviewUrl(book.drive_file_id)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-white border border-slate-100 text-slate-400 hover:text-[#00a651] rounded-xl hover:shadow-lg transition-all"
                                            title="Xem sách"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </a>
                                        <button
                                            onClick={() => handleEdit(book)}
                                            className="p-2 bg-white border border-slate-100 text-emerald-500 rounded-xl hover:shadow-lg transition-all"
                                            title="Sửa"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(book.id)}
                                            className="p-2 bg-white border border-slate-100 text-slate-300 hover:text-red-500 rounded-xl hover:shadow-lg transition-all"
                                            title="Xóa"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredBooks.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <Tablet className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-400 font-bold">Chưa có sách điện tử nào</p>
                                    <p className="text-slate-300 text-sm mt-1">Nhấn "Thêm sách mới" để bắt đầu</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {filteredBooks.length > PAGE_SIZE && (
                <div className="flex justify-center gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold disabled:opacity-30 hover:bg-slate-50"
                    >
                        Trang trước
                    </button>
                    <span className="px-4 py-2 text-sm font-bold text-slate-500">
                        {page} / {Math.ceil(filteredBooks.length / PAGE_SIZE)}
                    </span>
                    <button
                        disabled={page >= Math.ceil(filteredBooks.length / PAGE_SIZE)}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold disabled:opacity-30 hover:bg-slate-50"
                    >
                        Trang sau
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminEBookManagement;

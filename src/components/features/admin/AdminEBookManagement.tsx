import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Calendar, User, Image as ImageIcon, X, Save, ArrowLeft, Loader2, FileText, Tablet, ExternalLink, FolderOpen, ChevronRight, CloudDownload } from 'lucide-react';
import { EBook, EBookFolder } from '@/types';
import { supabase } from '@/lib/supabase';
import { uploadFile } from '@/services/storageService';
import DriveImportTool from './DriveImportTool';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
const PDF_WORKER_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/build/pdf.worker.min.js';
pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
console.log('PDF Worker URL initialized:', PDF_WORKER_URL);

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

    // Inline filters
    const [titleFilter, setTitleFilter] = useState('');
    const [authorFilter, setAuthorFilter] = useState('');
    const [publisherFilter, setPublisherFilter] = useState('');

    // Calculate counts for folders
    const folderCounts = useMemo(() => {
        const counts: Record<string, number> = {};

        // 1. Count books directly in each folder
        ebooks.forEach(book => {
            if (book.folder_id) {
                counts[book.folder_id] = (counts[book.folder_id] || 0) + 1;
            }
        });

        // 2. Recursive function to aggregate counts from children to parents
        const getAggregatedCounts = (folderId: string): number => {
            let total = counts[folderId] || 0;
            const children = folders.filter(f => f.parent_id === folderId);
            children.forEach(child => {
                total += getAggregatedCounts(child.id);
            });
            return total;
        };

        const aggregated: Record<string, number> = {};
        folders.forEach(folder => {
            aggregated[folder.id] = getAggregatedCounts(folder.id);
        });

        return aggregated;
    }, [ebooks, folders]);

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

        // Global search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(b =>
                b.title.toLowerCase().includes(term) ||
                b.author?.toLowerCase().includes(term)
            );
        }

        // Sidebar folder selection
        if (selectedFolder) {
            const getAllSubFolderIds = (folderId: string): string[] => {
                const childIds = folders.filter(f => f.parent_id === folderId).map(f => f.id);
                let allIds = [folderId, ...childIds];
                childIds.forEach(id => {
                    allIds = [...allIds, ...getAllSubFolderIds(id)];
                });
                return Array.from(new Set(allIds));
            };

            const targetFolderIds = getAllSubFolderIds(selectedFolder);
            result = result.filter(b => b.folder_id && targetFolderIds.includes(b.folder_id));
        }

        // Inline filters
        if (titleFilter) {
            result = result.filter(b => b.title.toLowerCase().includes(titleFilter.toLowerCase()));
        }
        if (authorFilter) {
            result = result.filter(b => b.author?.toLowerCase().includes(authorFilter.toLowerCase()));
        }
        if (publisherFilter) {
            result = result.filter(b => b.publisher?.toLowerCase().includes(publisherFilter.toLowerCase()));
        }

        return result;
    }, [ebooks, folders, searchTerm, selectedFolder, titleFilter, authorFilter, publisherFilter]);

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
        if (!editingBook?.title) {
            setError("Vui lòng nhập tiêu đề sách");
            return;
        }

        if (!editingBook.drive_file_id && !editingBook.storage_path) {
            setError("Vui lòng nhập ID Google Drive HOẶC tải lên tài liệu");
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
                drive_file_id: editingBook.drive_file_id || null,
                storage_path: editingBook.storage_path || null,
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

    // Sanitize path for Supabase Storage (remove accents, spaces, special chars)
    const sanitizePath = (str: string) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .replace(/[^a-zA-Z0-9.\-_]/g, "_")
            .replace(/_+/g, "_")
            .toLowerCase();
    };

    const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSaving(true);
        setError(null);
        try {
            const gradePath = sanitizePath(editingBook?.grade || 'Generic');
            const fileName = sanitizePath(file.name);
            const fullPath = `${gradePath}/${Date.now()}-${fileName}`;

            const { data, error } = await supabase.storage
                .from('ebooks')
                .upload(fullPath, file);

            if (error) throw error;
            if (data) {
                setEditingBook({ ...editingBook, storage_path: data.path });
                // If it's a PDF, we can offer to generate a thumbnail
                if (file.type === 'application/pdf') {
                    // Logic to automatically generate thumbnail could go here
                }
            }
        } catch (err: any) {
            setError("Lỗi upload tài liệu: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleGenerateThumbnail = async () => {
        if (!editingBook?.storage_path) return;

        setIsSaving(true);
        setError(null);
        try {
            const { data } = supabase.storage.from('ebooks').getPublicUrl(editingBook.storage_path);
            const url = data.publicUrl;

            const loadingTask = pdfjsLib.getDocument(url);
            const pdfDoc = await loadingTask.promise;
            const page = await pdfDoc.getPage(1);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context!, viewport }).promise;

            // Convert canvas to blob
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
            if (!blob) throw new Error("Could not generate thumbnail blob");

            const fileName = `covers/pdf-thumb-${Date.now()}.jpg`;
            const file = new File([blob], fileName, { type: 'image/jpeg' });

            const coverUrl = await uploadFile('articles', file);
            if (coverUrl) {
                setEditingBook({ ...editingBook, cover_url: coverUrl });
            }
        } catch (err: any) {
            setError("Lỗi tạo ảnh bìa từ PDF: " + err.message);
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

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Nguồn tài liệu</h3>
                            <div className="text-[10px] text-slate-400 italic">Có thể lưu cả ID Drive và File tải lên cùng lúc</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Google Drive Section */}
                            <div className="space-y-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" className="w-4 h-4" alt="Drive" />
                                    <span className="text-[11px] font-black uppercase text-slate-500">Google Drive</span>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Link hoặc ID file</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={editingBook?.drive_file_id !== 'manual-upload' ? (editingBook?.drive_file_id || '') : ''}
                                            onChange={(e) => setEditingBook({ ...editingBook, drive_file_id: extractDriveId(e.target.value) })}
                                            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="ID file..."
                                        />
                                        {editingBook?.drive_file_id && editingBook.drive_file_id !== 'manual-upload' && (
                                            <a href={getDrivePreviewUrl(editingBook.drive_file_id)} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Manual Upload Section */}
                            <div className="space-y-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <CloudDownload className="w-4 h-4 text-emerald-500" />
                                    <span className="text-[11px] font-black uppercase text-slate-500">Tải lên hệ thống</span>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">File tài liệu (PDF, DOCS)</label>
                                    <div className="flex items-center gap-2">
                                        <label className="flex-1 flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-100">
                                            <FileText className="w-4 h-4 text-emerald-500" />
                                            <span className="text-xs text-slate-600 truncate flex-1">
                                                {editingBook?.storage_path ? editingBook.storage_path.split('/').pop() : 'Chọn file...'}
                                            </span>
                                            <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleDocumentUpload} />
                                        </label>
                                        {editingBook?.storage_path && (
                                            <button onClick={() => setEditingBook({ ...editingBook, storage_path: undefined })} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    {editingBook?.storage_path?.toLowerCase().endsWith('.pdf') && (
                                        <button
                                            onClick={handleGenerateThumbnail}
                                            className="w-full mt-2 py-1.5 bg-emerald-50 text-[#00a651] rounded-lg text-[10px] font-bold uppercase hover:bg-emerald-100 transition-all border border-emerald-100 flex items-center justify-center gap-2"
                                        >
                                            <ImageIcon className="w-3.5 h-3.5" /> Lấy ảnh bìa từ trang 1 PDF
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
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
        <div className="flex flex-col h-full bg-[#f8fafc]">
            {/* Header */}
            <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 rounded-xl">
                        <Tablet className="w-5 h-5 text-[#00a651]" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-800 uppercase tracking-tight">Quản lý Kho tài liệu số</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Sách điện tử / Tài liệu học tập</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setView('import')}
                        className="flex items-center gap-2 bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/10"
                    >
                        <CloudDownload className="w-4 h-4" /> Import Drive
                    </button>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 bg-[#00a651] text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/10"
                    >
                        <Plus className="w-4 h-4" /> Thêm sách mới
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - Category Tree */}
                <aside className="w-72 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
                    <div className="p-4 bg-slate-50/50 border-b border-slate-100">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Danh mục tài liệu</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                        <button
                            onClick={() => setSelectedFolder(null)}
                            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between mb-1 ${!selectedFolder ? 'bg-emerald-50 text-[#00a651]' : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <span>Tất cả tài liệu</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${!selectedFolder ? 'bg-[#00a651] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {ebooks.length}
                            </span>
                        </button>

                        <div className="space-y-1">
                            {folderTree.rootFolders.map(folder => (
                                <FolderItem
                                    key={folder.id}
                                    folder={folder}
                                    selectedId={selectedFolder}
                                    onSelect={setSelectedFolder}
                                    getChildren={folderTree.getChildren}
                                    counts={folderCounts}
                                    level={0}
                                />
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] overflow-hidden">
                    {/* Search & Stats bar */}
                    <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tiêu đề, tác giả..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                            />
                        </div>
                        <div className="flex-1"></div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Hiển thị {Math.min(filteredBooks.length, PAGE_SIZE)} / {filteredBooks.length} tài liệu
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="flex-1 overflow-auto p-6 custom-scrollbar">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-w-[800px]">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
                                        <th className="px-4 py-3 text-left border-r border-slate-200">
                                            <div className="mb-2">Nhan đề</div>
                                            <div className="relative font-normal lowercase tracking-normal">
                                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300" />
                                                <input
                                                    type="text"
                                                    value={titleFilter}
                                                    onChange={e => setTitleFilter(e.target.value)}
                                                    className="w-full pl-7 pr-2 py-1 bg-white border border-slate-200 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                    placeholder="Lọc nhan đề..."
                                                />
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-left border-r border-slate-200 w-48">
                                            <div className="mb-2">Tác giả</div>
                                            <div className="relative font-normal lowercase tracking-normal">
                                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300" />
                                                <input
                                                    type="text"
                                                    value={authorFilter}
                                                    onChange={e => setAuthorFilter(e.target.value)}
                                                    className="w-full pl-7 pr-2 py-1 bg-white border border-slate-200 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                    placeholder="Lọc tác giả..."
                                                />
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-left border-r border-slate-200 w-48">
                                            <div className="mb-2">Nhà xuất bản</div>
                                            <div className="relative font-normal lowercase tracking-normal">
                                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300" />
                                                <input
                                                    type="text"
                                                    value={publisherFilter}
                                                    onChange={e => setPublisherFilter(e.target.value)}
                                                    className="w-full pl-7 pr-2 py-1 bg-white border border-slate-200 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                    placeholder="Lọc NXB..."
                                                />
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-center border-r border-slate-200 w-24 align-top">
                                            <div className="mb-2">Năm xuất bản</div>
                                        </th>
                                        <th className="px-4 py-3 text-center w-32 align-top">
                                            <div className="mb-2">Thao tác</div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredBooks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((book) => (
                                        <tr key={book.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-4 py-3 border-r border-slate-200">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-14 rounded bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                                                        <img
                                                            src={book.cover_url || getDriveThumbnail(book.drive_file_id)}
                                                            className="w-full h-full object-cover"
                                                            alt=""
                                                        />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[13px] font-bold text-slate-800 line-clamp-1 group-hover:text-[#00a651] transition-colors leading-tight">
                                                            {book.title}
                                                        </h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-bold uppercase">{book.grade}</span>
                                                            <span className="text-[9px] text-slate-400"><Eye className="w-2.5 h-2.5 inline mr-1" />{book.views}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 border-r border-slate-200 text-xs font-bold text-slate-600">
                                                {book.author || '-'}
                                            </td>
                                            <td className="px-4 py-3 border-r border-slate-200 text-xs font-medium text-slate-500">
                                                {book.publisher || '-'}
                                            </td>
                                            <td className="px-4 py-3 border-r border-slate-200 text-center text-xs font-black text-slate-600">
                                                {book.publication_year || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <a
                                                        href={getDrivePreviewUrl(book.drive_file_id)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                                        title="Xem trực tiếp"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                    <button
                                                        onClick={() => handleEdit(book)}
                                                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(book.id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="p-4 bg-slate-100 rounded-full">
                                                        <Tablet className="w-8 h-8 text-slate-300" />
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500 text-sm font-bold">Không tìm thấy tài liệu phù hợp</p>
                                                        <p className="text-slate-400 text-xs mt-1">Vui lòng thử lại với từ khóa hoặc danh mục khác</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {filteredBooks.length > PAGE_SIZE && (
                            <div className="mt-8 flex items-center justify-center gap-4">
                                <button
                                    disabled={page === 1}
                                    onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}
                                    className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"
                                >
                                    Trang trước
                                </button>
                                <div className="flex items-center gap-2">
                                    <span className="w-8 h-8 flex items-center justify-center bg-[#00a651] text-white rounded-lg text-xs font-black">
                                        {page}
                                    </span>
                                    <span className="text-slate-400 text-xs font-bold uppercase">/ {Math.ceil(filteredBooks.length / PAGE_SIZE)}</span>
                                </div>
                                <button
                                    disabled={page >= Math.ceil(filteredBooks.length / PAGE_SIZE)}
                                    onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }}
                                    className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"
                                >
                                    Trang sau
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

interface FolderItemProps {
    folder: EBookFolder;
    selectedId: string | null;
    onSelect: (id: string | null) => void;
    getChildren: (parentId: string) => EBookFolder[];
    counts: Record<string, number>;
    level: number;
}

const FolderItem: React.FC<FolderItemProps> = ({ folder, selectedId, onSelect, getChildren, counts, level }) => {
    const [isOpen, setIsOpen] = useState(true);
    const children = getChildren(folder.id);
    const isSelected = selectedId === folder.id;

    return (
        <div className="space-y-0.5">
            <button
                onClick={() => onSelect(isSelected ? null : folder.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 group ${isSelected
                    ? 'bg-emerald-50 text-[#00a651]'
                    : 'text-slate-600 hover:bg-slate-50'
                    }`}
                style={{ paddingLeft: `${level * 16 + 12}px` }}
            >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {children.length > 0 ? (
                        <div
                            onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                            className="p-1 hover:bg-slate-200/50 rounded transition-colors"
                        >
                            <ChevronRight className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
                        </div>
                    ) : (
                        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                            <div className="w-1 h-1 bg-slate-300 rounded-full" />
                        </div>
                    )}
                    <span className="truncate flex-1">{folder.name}</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${isSelected ? 'bg-[#00a651] text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {counts[folder.id] || 0}
                </span>
            </button>

            {isOpen && children.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                    {children.map(child => (
                        <FolderItem
                            key={child.id}
                            folder={child}
                            selectedId={selectedId}
                            onSelect={onSelect}
                            getChildren={getChildren}
                            counts={counts}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminEBookManagement;

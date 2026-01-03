import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Calendar, User, Image as ImageIcon, X, Save, ArrowLeft, Loader2, FileText, Mic2, ExternalLink, FolderOpen, ChevronRight, Music, Play, Upload, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { Audiobook, AudiobookFolder, AudioTrack } from '@/types';
import { supabase } from '@/lib/supabase';
import { uploadFile } from '@/services/storageService';

interface AdminAudiobookManagementProps {
    audiobooks: Audiobook[];
    folders: AudiobookFolder[];
    onRefresh?: () => void;
}

const AdminAudiobookManagement: React.FC<AdminAudiobookManagementProps> = ({ audiobooks, folders, onRefresh }) => {
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [editingBook, setEditingBook] = useState<Partial<Audiobook> | null>(null);
    const [tracks, setTracks] = useState<Partial<AudioTrack>[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const [isAddingFolder, setIsAddingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [previewingTrackUrl, setPreviewingTrackUrl] = useState<string | null>(null);
    const [isFileLibraryOpen, setIsFileLibraryOpen] = useState(false);
    const [availableFiles, setAvailableFiles] = useState<{ name: string; url: string; created_at: string }[]>([]);
    const [librarySearch, setLibrarySearch] = useState('');
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

    // Folder counts
    const folderCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        audiobooks.forEach(book => {
            if (book.folder_id) counts[book.folder_id] = (counts[book.folder_id] || 0) + 1;
        });
        return counts;
    }, [audiobooks]);

    // Filter audiobooks
    const filteredBooks = useMemo(() => {
        let result = audiobooks;
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
    }, [audiobooks, searchTerm, selectedFolder]);

    const handleEdit = async (book: Audiobook) => {
        setEditingBook(book);
        setError(null);
        setView('editor');
        // Fetch tracks
        const { data } = await supabase.from('audio_tracks').select('*').eq('audiobook_id', book.id).order('track_number', { ascending: true });
        setTracks(data || []);
    };

    const handleAddNew = () => {
        setEditingBook({
            title: '',
            author: '',
            publisher: '',
            publication_year: new Date().getFullYear(),
            grade: '6',
            description: '',
            folder_id: selectedFolder || undefined,
            views: 0,
            favorites: 0
        });
        setTracks([]);
        setError(null);
        setView('editor');
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa sách nói này và toàn bộ các track liên quan?')) return;
        try {
            const { error } = await supabase.from('audiobooks').delete().eq('id', id);
            if (error) throw error;
            onRefresh?.();
        } catch (err: any) {
            alert('Lỗi khi xóa: ' + err.message);
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        try {
            const { error } = await supabase.from('audiobook_folders').insert([{
                name: newFolderName,
                display_order: folders.length + 1
            }]);
            if (error) throw error;
            setNewFolderName('');
            setIsAddingFolder(false);
            onRefresh?.();
        } catch (err: any) {
            alert('Lỗi tạo thư mục: ' + err.message);
        }
    };

    const handleDeleteFolder = async (e: React.MouseEvent, folderId: string) => {
        e.stopPropagation();
        if (!window.confirm('Xóa thư mục này? (Các sách trong thư mục sẽ không bị xóa nhưng sẽ mất phân loại)')) return;
        try {
            const { error } = await supabase.from('audiobook_folders').delete().eq('id', folderId);
            if (error) throw error;
            if (selectedFolder === folderId) setSelectedFolder(null);
            onRefresh?.();
        } catch (err: any) {
            alert('Lỗi xóa thư mục: ' + err.message);
        }
    };

    const handleSave = async () => {
        if (!editingBook?.title) {
            setError('Tiêu đề không được để trống');
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            let bookId = editingBook.id;

            if (bookId) {
                // Update
                const { error } = await supabase.from('audiobooks').update({
                    title: editingBook.title,
                    author: editingBook.author,
                    publisher: editingBook.publisher,
                    publication_year: editingBook.publication_year,
                    grade: editingBook.grade,
                    description: editingBook.description,
                    cover_url: editingBook.cover_url,
                    folder_id: editingBook.folder_id
                }).eq('id', bookId);
                if (error) throw error;
            } else {
                // Insert
                const { data, error } = await supabase.from('audiobooks').insert([{
                    title: editingBook.title,
                    author: editingBook.author,
                    publisher: editingBook.publisher,
                    publication_year: editingBook.publication_year,
                    grade: editingBook.grade,
                    description: editingBook.description,
                    cover_url: editingBook.cover_url,
                    folder_id: editingBook.folder_id
                }]).select().single();
                if (error) throw error;
                bookId = data.id;
            }

            // Save tracks (simplified for now: delete all and re-insert)
            await supabase.from('audio_tracks').delete().eq('audiobook_id', bookId);
            if (tracks.length > 0) {
                const tracksToInsert = tracks.map((t, index) => ({
                    audiobook_id: bookId,
                    title: t.title,
                    file_url: t.file_url,
                    duration: t.duration || '0:00',
                    display_order: index + 1
                }));
                const { error: trackErr } = await supabase.from('audio_tracks').insert(tracksToInsert);
                if (trackErr) throw trackErr;
            }

            setView('list');
            onRefresh?.();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
            const path = `covers/${Date.now()}_${sanitizedName}`;
            const url = await uploadFile('audiobooks', file, path);
            setEditingBook(prev => prev ? { ...prev, cover_url: url as string } : null);
        } catch (err: any) {
            alert('Lỗi upload ảnh: ' + err.message);
        }
    };

    const handleTrackFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files: File[] = Array.from(e.target.files || []);
        if (files.length === 0) return;

        for (const file of files) {
            const trackId = Math.random().toString(36).substring(7);
            setUploadProgress(prev => ({ ...prev, [trackId]: 10 }));

            try {
                const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
                const path = `tracks/${Date.now()}_${sanitizedName}`;
                const url = await uploadFile('audiobooks', file, path);

                const newTrack: Partial<AudioTrack> = {
                    title: file.name.replace(/\.[^/.]+$/, ""), // remove extension
                    file_url: url as string,
                    duration: '0:00',
                };

                setTracks(prev => [...prev, newTrack]);
                setUploadProgress(prev => {
                    const next = { ...prev };
                    delete next[trackId];
                    return next;
                });
            } catch (err: any) {
                alert(`Lỗi upload file ${file.name}: ` + err.message);
            }
        }
    };

    const handleOpenLibrary = async () => {
        setIsFileLibraryOpen(true);
        setIsLoadingLibrary(true);
        try {
            const { data, error } = await supabase.storage.from('audiobooks').list('tracks', {
                limit: 100,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' }
            });
            if (error) throw error;

            const files = data.map(f => ({
                name: f.name,
                url: supabase.storage.from('audiobooks').getPublicUrl(`tracks/${f.name}`).data.publicUrl,
                created_at: f.created_at
            }));
            setAvailableFiles(files);
        } catch (err: any) {
            alert('Lỗi khi tải danh sách file: ' + err.message);
        } finally {
            setIsLoadingLibrary(false);
        }
    };

    const handleSelectFromLibrary = (file: { name: string; url: string }) => {
        const newTrack: Partial<AudioTrack> = {
            title: file.name.replace(/\.[^/.]+$/, "").replace(/^\d+_/, ""), // clean name
            file_url: file.url,
            duration: '0:00',
        };
        setTracks(prev => [...prev, newTrack]);
        setIsFileLibraryOpen(false);
    };

    const moveTrack = (idx: number, direction: 'up' | 'down') => {
        const newTracks = [...tracks];
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= newTracks.length) return;

        [newTracks[idx], newTracks[targetIdx]] = [newTracks[targetIdx], newTracks[idx]];
        setTracks(newTracks);
    };

    if (view === 'editor') {
        return (
            <div className="p-8 max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold uppercase text-xs">
                        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
                    </button>
                    <div className="flex gap-4">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-[#00a651] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Lưu thay đổi
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold border border-red-100 flex items-center gap-3">
                        <X className="w-5 h-5" /> {error}
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left: Metadata */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-l-4 border-emerald-500 pl-4 mb-6">Thông tin cơ bản</h3>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Tiêu đề sách nói</label>
                                <input
                                    type="text"
                                    value={editingBook?.title}
                                    onChange={e => setEditingBook(prev => prev ? { ...prev, title: e.target.value } : null)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-800 font-bold focus:ring-2 focus:ring-[#00a651] focus:bg-white outline-none transition-all"
                                    placeholder="Nhập tiêu đề..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Tác giả</label>
                                    <input
                                        type="text"
                                        value={editingBook?.author || ''}
                                        onChange={e => setEditingBook(prev => prev ? { ...prev, author: e.target.value } : null)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-800 font-bold focus:ring-2 focus:ring-[#00a651] focus:bg-white outline-none transition-all"
                                        placeholder="Nhập tên tác giả..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nhà xuất bản</label>
                                    <input
                                        type="text"
                                        value={editingBook?.publisher || ''}
                                        onChange={e => setEditingBook(prev => prev ? { ...prev, publisher: e.target.value } : null)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-800 font-bold focus:ring-2 focus:ring-[#00a651] focus:bg-white outline-none transition-all"
                                        placeholder="Nhập nhà xuất bản..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Khối lớp</label>
                                    <select
                                        value={editingBook?.grade || '6'}
                                        onChange={e => setEditingBook(prev => prev ? { ...prev, grade: e.target.value } : null)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-800 font-bold focus:ring-2 focus:ring-[#00a651] focus:bg-white outline-none transition-all"
                                    >
                                        <option value="6">Khối 6</option>
                                        <option value="7">Khối 7</option>
                                        <option value="8">Khối 8</option>
                                        <option value="9">Khối 9</option>
                                        <option value="Tất cả">Tất cả</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Thư mục</label>
                                    <select
                                        value={editingBook?.folder_id || ''}
                                        onChange={e => setEditingBook(prev => prev ? { ...prev, folder_id: e.target.value || undefined } : null)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-800 font-bold focus:ring-2 focus:ring-[#00a651] focus:bg-white outline-none transition-all"
                                    >
                                        <option value="">-- Chọn thư mục --</option>
                                        {folders.map(f => (
                                            <option key={f.id} value={f.id}>{f.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Mô tả tóm tắt</label>
                                <textarea
                                    value={editingBook?.description || ''}
                                    onChange={e => setEditingBook(prev => prev ? { ...prev, description: e.target.value } : null)}
                                    rows={4}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-800 font-bold focus:ring-2 focus:ring-[#00a651] focus:bg-white outline-none transition-all resize-none"
                                    placeholder="Nhập mô tả tóm tắt..."
                                />
                            </div>
                        </div>

                        {/* Audio Tracks Section */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-l-4 border-blue-500 pl-4">Danh sách các track ({tracks.length})</h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleOpenLibrary}
                                        className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-slate-200 transition-colors flex items-center gap-2"
                                    >
                                        <FolderOpen className="w-4 h-4" /> Chọn từ kho
                                    </button>
                                    <label className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-black uppercase cursor-pointer hover:bg-blue-100 transition-colors flex items-center gap-2">
                                        <Upload className="w-4 h-4" /> Tải lên audio
                                        <input type="file" multiple accept="audio/*" className="hidden" onChange={handleTrackFileUpload} />
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {tracks.map((track, idx) => (
                                    <div key={idx} className="flex items-center gap-6 bg-slate-100/50 p-4 rounded-2xl border border-slate-200 group min-w-0">
                                        {/* Number & Reorder Controls */}
                                        <div className="flex flex-col items-center gap-2 flex-shrink-0 min-w-[48px]">
                                            <button
                                                disabled={idx === 0}
                                                onClick={() => moveTrack(idx, 'up')}
                                                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-md ${idx === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-blue-500/30'}`}
                                                title="Di chuyển lên"
                                            >
                                                <ArrowUp className="w-5 h-5" />
                                            </button>

                                            <div className="bg-white px-2 py-1 rounded-md border border-slate-200 shadow-inner">
                                                <span className="text-[11px] font-black text-slate-700 italic">#{idx + 1}</span>
                                            </div>

                                            <button
                                                disabled={idx === tracks.length - 1}
                                                onClick={() => moveTrack(idx, 'down')}
                                                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-md ${idx === tracks.length - 1 ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-blue-500/30'}`}
                                                title="Di chuyển xuống"
                                            >
                                                <ArrowDown className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => setPreviewingTrackUrl(previewingTrackUrl === track.file_url ? null : track.file_url || null)}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${previewingTrackUrl === track.file_url ? 'bg-emerald-500 text-white animate-pulse' : 'bg-white text-slate-400 hover:text-emerald-500 shadow-sm'}`}
                                        >
                                            {previewingTrackUrl === track.file_url ? <X className="w-5 h-5" /> : <Play className="w-4 h-4 ml-0.5" />}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <input
                                                type="text"
                                                value={track.title}
                                                onChange={e => {
                                                    const newTracks = [...tracks];
                                                    newTracks[idx].title = e.target.value;
                                                    setTracks(newTracks);
                                                }}
                                                className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 w-full truncate"
                                            />
                                            <span className="text-[10px] text-slate-400 ml-3 font-medium opacity-60 truncate block">{track.file_url}</span>
                                        </div>
                                        <button
                                            onClick={() => setTracks(prev => prev.filter((_, i) => i !== idx))}
                                            className="p-2 text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                {previewingTrackUrl && (
                                    <div className="mt-4 p-4 bg-slate-900 rounded-2xl border border-slate-800 animate-in slide-in-from-bottom-4 duration-300">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Đang nghe thử...</span>
                                            <button onClick={() => setPreviewingTrackUrl(null)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                                        </div>
                                        <audio
                                            autoPlay
                                            controls
                                            src={previewingTrackUrl}
                                            className="w-full h-8 bg-transparent"
                                        />
                                    </div>
                                )}

                                {Object.entries(uploadProgress).map(([id, progress]) => (
                                    <div key={id} className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center gap-4 animate-pulse">
                                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                        <div className="flex-1 h-2 bg-blue-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                        </div>
                                        <span className="text-[10px] font-black text-blue-500 uppercase">Đang tải...</span>
                                    </div>
                                ))}

                                {tracks.length === 0 && Object.keys(uploadProgress).length === 0 && (
                                    <div className="text-center py-10 opacity-30 italic text-sm">Chưa có track nào</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Cover Image */}
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-l-4 border-orange-500 pl-4 mb-6">Ảnh bìa</h3>
                            <div className="relative group aspect-[3/4] rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 hover:border-emerald-500 transition-colors flex flex-col items-center justify-center p-2">
                                {editingBook?.cover_url ? (
                                    <>
                                        <img src={editingBook.cover_url} className="w-full h-full object-cover rounded-xl" alt="Cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <label htmlFor="cover-upload" className="bg-white text-slate-800 px-6 py-3 rounded-xl font-bold text-xs uppercase cursor-pointer hover:bg-emerald-50 transition-colors">Thay đổi ảnh</label>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-3">
                                        <ImageIcon className="w-12 h-12 text-slate-200" />
                                        <label htmlFor="cover-upload" className="text-[10px] font-black text-[#00a651] uppercase tracking-widest cursor-pointer hover:underline">Tải ảnh bìa</label>
                                    </div>
                                )}
                                <input id="cover-upload" type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium italic text-center">Định dạng hỗ trợ: JPG, PNG. Kích thước đề xuất: 600x800px</p>
                        </div>
                    </div>
                </div>

                {/* Audio Library Modal */}
                {isFileLibraryOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Thư viện Audio</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Chọn file đã tải lên trước đó</p>
                                </div>
                                <button onClick={() => setIsFileLibraryOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
                            </div>

                            <div className="p-4 border-b border-slate-100">
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm file..."
                                        value={librarySearch}
                                        onChange={e => setLibrarySearch(e.target.value)}
                                        className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                {isLoadingLibrary ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                                        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Đang tải danh sách...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {availableFiles.filter(f => f.name.toLowerCase().includes(librarySearch.toLowerCase())).map((file, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSelectFromLibrary(file)}
                                                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all text-left group"
                                            >
                                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-white transition-colors">
                                                    <Music className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-700 truncate">{file.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">Tải lên: {new Date(file.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-[#00a651] opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Plus className="w-5 h-5" />
                                                </div>
                                            </button>
                                        ))}
                                        {availableFiles.length === 0 && (
                                            <div className="text-center py-20 opacity-30 italic text-sm">Kho hiện đang trống</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-[calc(100vh-80px)]">
            {/* Sidebar: Thư mục */}
            <aside className="w-72 border-r border-slate-100 bg-white/50 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-white/40 flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Phân loại</h3>
                    <button
                        onClick={() => setIsAddingFolder(true)}
                        className="p-2 hover:bg-emerald-50 text-slate-400 hover:text-emerald-500 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {isAddingFolder && (
                        <div className="mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100 animate-in fade-in slide-in-from-top-2 duration-300">
                            <input
                                autoFocus
                                type="text"
                                value={newFolderName}
                                onChange={e => setNewFolderName(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') handleCreateFolder();
                                    if (e.key === 'Escape') setIsAddingFolder(false);
                                }}
                                className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 mb-2"
                                placeholder="Tên thư mục..."
                            />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setIsAddingFolder(false)} className="text-[10px] font-black text-slate-400 uppercase hover:text-slate-600 px-2 py-1">Hủy</button>
                                <button onClick={handleCreateFolder} className="text-[10px] font-black text-emerald-600 uppercase hover:text-emerald-700 px-2 py-1">Lưu</button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <button
                            onClick={() => setSelectedFolder(null)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${!selectedFolder ? 'bg-emerald-50 text-[#00a651] shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <Mic2 className="w-4 h-4" />
                            <span>Tất cả sách nói</span>
                            <span className="ml-auto text-[10px] opacity-40">{audiobooks.length}</span>
                        </button>
                        {folders.map(folder => (
                            <div key={folder.id} className="group relative">
                                <button
                                    onClick={() => setSelectedFolder(folder.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm pr-10 ${selectedFolder === folder.id ? 'bg-emerald-50 text-[#00a651] shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    <FolderOpen className="w-4 h-4" />
                                    <span className="truncate">{folder.name}</span>
                                    <span className="ml-auto text-[10px] opacity-40">{folderCounts[folder.id] || 0}</span>
                                </button>
                                <button
                                    onClick={(e) => handleDeleteFolder(e, folder.id)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main: Audiobook List */}
            <main className="flex-1 p-10 bg-slate-50/30">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-2 uppercase">Kho Sách Nói</h1>
                        <p className="text-xs text-slate-500 font-medium">Quản lý các ấn phẩm âm thanh và danh sách chương mục.</p>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="bg-[#00a651] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                    >
                        <Plus className="w-6 h-6 border-2 border-white/30 rounded-lg" />
                        <span className="uppercase text-sm tracking-wider">Đăng sách mới</span>
                    </button>
                </div>

                {/* Toolbar */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 mb-8 flex items-center gap-6">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tiêu đề, tác giả..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-3.5 text-sm font-bold focus:ring-2 focus:ring-[#00a651]/10 outline-none transition-all placeholder:text-slate-300"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredBooks.map(book => (
                        <div key={book.id} className="group bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all">
                            <div className="relative aspect-[3/4] overflow-hidden">
                                <img src={book.cover_url || '/images/default-audio-cover.png'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={book.title} />
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button onClick={() => handleEdit(book)} className="p-3 bg-white/90 backdrop-blur shadow-xl rounded-xl text-slate-600 hover:text-emerald-600 transition-colors"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(book.id)} className="p-3 bg-white/90 backdrop-blur shadow-xl rounded-xl text-slate-600 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                                <div className="absolute bottom-4 left-4">
                                    <span className="px-3 py-1 bg-[#00a651] text-white text-[10px] font-black rounded-lg shadow-lg uppercase tracking-widest border border-white/20">Khối {book.grade}</span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-slate-800 line-clamp-2 h-10 mb-3 group-hover:text-emerald-600 transition-colors">{book.title}</h3>
                                <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">
                                    <User className="w-3.5 h-3.5" /> <span>{book.author}</span>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-4 text-slate-400">
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold"><Eye className="w-3.5 h-3.5" /> {book.views}</span>
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold"><Music className="w-3.5 h-3.5" /> Track: ...</span>
                                    </div>
                                    <button onClick={() => handleEdit(book)} className="text-[#00a651] text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-2">Chi tiết <ChevronRight className="w-3.5 h-3.5" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredBooks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-30">
                        <Mic2 className="w-20 h-20 mb-4" />
                        <p className="font-bold uppercase tracking-[0.2em] text-sm">Không tìm thấy sách nói nào</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminAudiobookManagement;

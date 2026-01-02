
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Calendar, User, Image as ImageIcon, X, Save, ArrowLeft, Loader2, CheckCircle2, FileText, BookMarked, MessageSquarePlus, MousePointer2, AlertCircle, ArrowUp, ArrowDown, ChevronsUpDown, Layout } from 'lucide-react';
import { NewsItem, BookIntroduction } from '@/types';
import { supabase } from '@/lib/supabase';
import { uploadFile, listFiles } from '@/services/storageService';

interface AdminArticleManagementProps {
  type: 'news' | 'introduction';
  items: (NewsItem | BookIntroduction)[];
  onRefresh?: () => void;
}

type SortConfig = {
  key: 'title' | 'author' | 'date' | 'views';
  direction: 'asc' | 'desc' | null;
};

const AdminArticleManagement: React.FC<AdminArticleManagementProps> = ({ type, items, onRefresh }) => {
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => { setPage(1); }, [searchTerm, type]);

  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });

  // Gallery state
  const [tempGallery, setTempGallery] = useState<string[]>([]);
  const [storageGallery, setStorageGallery] = useState<{ name: string, url: string }[]>([]);
  const [galleryTab, setGalleryTab] = useState<'session' | 'storage'>('session');
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  const title = type === 'news' ? 'Quản lý Tin tức' : 'Quản lý Giới thiệu sách';
  const tableName = type === 'news' ? 'news' : 'book_introductions';
  const icon = type === 'news' ? <FileText className="w-6 h-6 text-[#00a651]" /> : <BookMarked className="w-6 h-6 text-[#00a651]" />;

  const handleSort = (key: SortConfig['key']) => {
    let direction: SortConfig['direction'] = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null;
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortConfig['key']) => {
    if (sortConfig.key !== key || !sortConfig.direction) return <ChevronsUpDown className="w-3 h-3 text-slate-300" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-[#00a651]" /> : <ArrowDown className="w-3 h-3 text-[#00a651]" />;
  };

  const parseDate = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return 0;
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
  };

  const filteredAndSortedItems = useMemo(() => {
    // 1. Filter
    let result = items.filter(item =>
      (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.author || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Sort
    if (sortConfig.direction) {
      result.sort((a, b) => {
        let aVal: any;
        let bVal: any;

        if (sortConfig.key === 'date') {
          aVal = parseDate(a.date || '');
          bVal = parseDate(b.date || '');
        } else {
          aVal = a[sortConfig.key];
          bVal = b[sortConfig.key];
        }

        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = (bVal || '').toString().toLowerCase();
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [items, searchTerm, sortConfig]);

  const handleCreate = () => {
    setEditingItem({
      title: '',
      summary: '',
      content_html: '',
      image_url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1000',
      author: 'Quản trị viên',
      views: 0,
    });
    setTempGallery([]);
    setError(null);
    setView('editor');
  };

  const handleEdit = (item: any) => {
    setEditingItem({
      ...item,
      // Ensure we use image_url consistently
      image_url: item.image_url || item.image
    });
    setError(null);
    setView('editor');
  };

  const fetchStorageGallery = async () => {
    setIsLoadingGallery(true);
    try {
      const files = await listFiles('articles');
      setStorageGallery(files.map(f => ({ name: f.name, url: f.url })));
    } catch (err) {
      console.error('Failed to fetch gallery:', err);
    } finally {
      setIsLoadingGallery(false);
    }
  };

  useEffect(() => {
    if (view === 'editor') {
      fetchStorageGallery();
    }
  }, [view]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsSaving(true);
    setError(null);

    try {
      const uploadResults: string[] = [];
      const fileArray = Array.from(files) as File[];

      for (const file of fileArray) {
        // Try to upload to Supabase
        try {
          const uploadedUrl = await uploadFile('articles', file);

          if (uploadedUrl) {
            uploadResults.push(uploadedUrl);
          } else {
            throw new Error(`Supabase Storage từ chối tệp ${file.name}. Có thể do thiếu 'Storage Policy' (INSERT).`);
          }
        } catch (uploadErr: any) {
          console.error(`Error uploading ${file.name}:`, uploadErr);
          throw new Error(`Lỗi tải lên tệp ${file.name}: ${uploadErr.message || 'Kiểm tra chính sách (Policy) của bucket articles'}`);
        }
      }

      if (uploadResults.length > 0) {
        setTempGallery(prev => [...prev, ...uploadResults]);
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError('Lỗi khi tải ảnh: ' + (err.message || 'Vui lòng thử lại'));

      // Last resort: try local URLs for all files
      const fileArray = Array.from(files) as File[];
      const localUrls = fileArray.map((file: File) => URL.createObjectURL(file));
      if (localUrls.length > 0) {
        setTempGallery(prev => [...prev, ...localUrls]);
      }
    } finally {
      setIsSaving(false);
      // Reset input to allow re-selecting same file
      e.target.value = '';
    }
  };

  const insertImageToContent = (url: string) => {
    if (!contentRef.current) return;
    const textarea = contentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const imgTag = `\n<div class="my-8 flex flex-col items-center">\n  <img src="${url}" class="rounded-3xl shadow-xl max-w-full h-auto border-4 border-white" />\n  <p class="text-[11px] text-slate-400 mt-3 font-bold uppercase tracking-widest italic">Hình ảnh minh họa</p>\n</div>\n`;

    const newText = text.substring(0, start) + imgTag + text.substring(end);
    setEditingItem({ ...editingItem, content_html: newText });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + imgTag.length, start + imgTag.length);
    }, 10);
  };

  const handleSave = async () => {
    if (!editingItem.title) {
      setError("Vui lòng nhập tiêu đề bài viết");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        title: editingItem.title,
        summary: editingItem.summary,
        content_html: editingItem.content_html,
        image_url: editingItem.image_url,
        author: editingItem.author || 'Quản trị viên',
        views: editingItem.views || 0
      };

      let result;
      if (editingItem.id) {
        result = await supabase
          .from(tableName)
          .update(payload)
          .eq('id', editingItem.id);
      } else {
        result = await supabase
          .from(tableName)
          .insert([payload]);
      }

      if (result.error) throw result.error;

      if (onRefresh) onRefresh();
      setView('list');
    } catch (err: any) {
      setError("Lỗi khi lưu bài viết: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;

    try {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert("Lỗi khi xóa: " + err.message);
    }
  };

  if (view === 'editor') {
    return (
      <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-10 duration-300">
        <div className="px-8 py-4 border-b border-slate-200 bg-white flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('list')} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              {editingItem?.id ? 'Biên tập bài viết' : 'Viết bài mới'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase flex items-center gap-2 transition-all ${showPreview ? 'bg-emerald-50 text-[#00a651]' : 'bg-slate-100 text-slate-500'}`}
            >
              <Eye className="w-4 h-4" /> {showPreview ? 'Ẩn xem trước' : 'Xem trước'}
            </button>
            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            <button onClick={() => setView('list')} className="px-6 py-2 text-[12px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors">Hủy</button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#00a651] text-white px-8 py-2 rounded-xl text-[12px] font-black uppercase shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Đang lưu...' : 'Lưu bài viết'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-10 mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-in fade-in">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        <div className="flex-1 overflow-hidden flex">
          {/* Main Editor Section */}
          <div className={`flex-1 overflow-y-auto p-8 custom-scrollbar transition-all duration-300 ${showPreview ? 'w-1/2' : 'w-full max-w-5xl mx-auto'}`}>
            <div className="space-y-8">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-in fade-in">
                  <AlertCircle className="w-5 h-5" /> {error}
                </div>
              )}

              {/* Basic Info */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tiêu đề bài viết <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={editingItem?.title || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    placeholder="Nhập tiêu đề hấp dẫn..."
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a651] text-base font-bold text-slate-800 shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tác giả / Nguồn</label>
                    <input
                      type="text"
                      value={editingItem?.author || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, author: e.target.value })}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a651] text-sm font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Lượt xem ban đầu</label>
                    <input
                      type="number"
                      value={editingItem?.views || 0}
                      onChange={(e) => setEditingItem({ ...editingItem, views: parseInt(e.target.value) || 0 })}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a651] text-sm font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Ảnh đại diện bài viết</label>
                    <div className="flex items-start gap-4">
                      <div className="relative group w-40 h-28 bg-slate-100 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 flex-shrink-0">
                        {editingItem?.image_url ? (
                          <>
                            <img src={editingItem.image_url} alt="Cover" className="w-full h-full object-cover" />
                            <button onClick={() => setEditingItem({ ...editingItem!, image_url: '' })} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-slate-300">
                            <ImageIcon className="w-6 h-6 mb-1" />
                            <span className="text-[8px] font-black uppercase">Chưa chọn ảnh</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Để có kết quả tốt nhất, hãy chọn ảnh từ thư viện ảnh bên dưới sau khi tải lên.</p>
                        {editingItem?.image_url && <span className="inline-block px-2 py-1 bg-emerald-50 text-[#00a651] border border-emerald-100 rounded-lg text-[9px] font-black uppercase">Đã thiết lập ảnh</span>}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tóm tắt ngắn gọn</label>
                    <textarea
                      rows={3}
                      value={editingItem?.summary || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, summary: e.target.value })}
                      placeholder="Viết một đoạn ngắn giới thiệu bài viết..."
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a651] text-xs font-medium text-slate-600 resize-none leading-relaxed shadow-inner"
                    />
                  </div>
                </div>
              </div>

              {/* Editor & Gallery Control */}
              <div className="grid lg:grid-cols-12 gap-8">
                {/* Editor Area */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                    <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">Thanh công cụ:</span>
                        <div className="flex gap-1.5 font-black text-slate-500">
                          {['B', 'I', 'U'].map(btn => <button key={btn} className="w-8 h-8 rounded-lg hover:bg-emerald-50 hover:text-[#00a651] transition-all flex items-center justify-center border border-transparent hover:border-emerald-100 shadow-sm">{btn}</button>)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquarePlus className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-400 italic">Dùng phím tab để lùi dòng</span>
                      </div>
                    </div>
                    <textarea
                      ref={contentRef}
                      value={editingItem?.content_html || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, content_html: e.target.value })}
                      className="flex-1 w-full p-8 focus:outline-none text-sm font-medium text-slate-700 leading-relaxed custom-scrollbar bg-slate-50/30 font-mono"
                      placeholder="Nhập nội dung mã HTML cho bài viết..."
                    />
                  </div>
                </div>

                {/* Sidebar Gallery */}
                <div className="lg:col-span-4">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                    <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#00a651]" /> Thư viện ảnh
                    </h3>
                    <div className="relative">
                      <input type="file" multiple onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="Tải ảnh lên" />
                      <button className="px-3 py-1.5 bg-emerald-50 text-[#00a651] border border-emerald-100 rounded-lg text-[9px] font-black uppercase hover:bg-emerald-100 transition-all flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" /> Thêm ảnh
                      </button>
                    </div>
                  </div>

                  <div className="flex p-1 bg-slate-100 rounded-xl">
                    <button
                      onClick={() => setGalleryTab('session')}
                      className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${galleryTab === 'session' ? 'bg-white text-[#00a651] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Vừa tải lên
                    </button>
                    <button
                      onClick={() => { setGalleryTab('storage'); fetchStorageGallery(); }}
                      className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${galleryTab === 'storage' ? 'bg-white text-[#00a651] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Kho lưu trữ
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                    {galleryTab === 'session' ? (
                      tempGallery.length === 0 ? (
                        <div className="py-12 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                          <ImageIcon className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-4 leading-relaxed">Chưa có ảnh nào được tải lên trong phiên này.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {tempGallery.map((url, i) => (
                            <div key={i} className="group relative bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                              <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                                <img src={url} className="w-full h-full object-cover" alt="Gallery" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <button onClick={() => setEditingItem({ ...editingItem, image_url: url })} className="p-2 bg-emerald-500 text-white rounded-lg shadow-lg hover:scale-110 transition-transform" title="Làm ảnh đại diện"><Layout className="w-4 h-4" /></button>
                                  <button onClick={() => { if (window.confirm("Xóa ảnh này khỏi kho ảnh tạm?")) setTempGallery(prev => prev.filter((_, idx) => idx !== i)); }} className="p-2 bg-red-500 text-white rounded-lg shadow-lg hover:scale-110 transition-transform" title="Xóa ảnh"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </div>
                              <button
                                onClick={() => insertImageToContent(url)}
                                className="w-full py-2 bg-emerald-50 text-[#00a651] rounded-xl text-[9px] font-black uppercase hover:bg-emerald-100 transition-all shadow-sm border border-emerald-100/50 flex items-center justify-center gap-2"
                              >
                                <Plus className="w-3 h-3" /> Chèn vào bài
                              </button>
                            </div>
                          ))}
                        </div>
                      )
                    ) : isLoadingGallery ? (
                      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Đang tải kho ảnh...</span>
                      </div>
                    ) : storageGallery.length === 0 ? (
                      <div className="py-12 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                        <ImageIcon className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-4 leading-relaxed">Kho lưu trữ đang trống.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {storageGallery.map((file, i) => (
                          <div key={i} className="group relative bg-white p-2 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                            <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
                              <img src={file.url} className="w-full h-full object-cover" alt={file.name} title={file.name} />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-1.5 p-2">
                                <button
                                  onClick={() => insertImageToContent(file.url)}
                                  className="w-full py-1.5 bg-emerald-500 text-white rounded-lg text-[8px] font-black uppercase hover:bg-emerald-600 transition-colors shadow-sm"
                                >
                                  Chèn ảnh
                                </button>
                                <button
                                  onClick={() => setEditingItem({ ...editingItem, image_url: file.url })}
                                  className="w-full py-1.5 bg-white text-emerald-600 rounded-lg text-[8px] font-black uppercase hover:bg-slate-50 transition-colors shadow-sm"
                                >
                                  Làm Cover
                                </button>
                              </div>
                            </div>
                            <p className="text-[8px] text-slate-400 truncate font-bold uppercase">{file.name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="flex-1 bg-white border-l border-slate-200 overflow-y-auto p-12 custom-scrollbar animate-in slide-in-from-right-10 duration-500">
              <div className="max-w-2xl mx-auto space-y-10">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="px-4 py-1.5 bg-emerald-50 text-[#00a651] text-[10px] font-black uppercase tracking-widest rounded-full">Bản xem trước</span>
                  <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-emerald-500" /> {new Date().toLocaleDateString('vi-VN')}</span>
                    <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-emerald-500" /> {editingItem?.author || 'Quản trị viên'}</span>
                  </div>
                </div>

                <div className="space-y-8">
                  <h1 className="text-3xl font-black text-slate-800 leading-tight uppercase tracking-tight">{editingItem?.title || 'Tiêu đề bài viết của bạn'}</h1>

                  {editingItem?.image_url && (
                    <div className="w-full aspect-[16/9] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-emerald-900/10">
                      <img src={editingItem.image_url} className="w-full h-full object-cover" alt="Article Cover" />
                    </div>
                  )}

                  {editingItem?.summary && (
                    <p className="text-lg font-bold text-slate-400 italic border-l-4 border-emerald-500 pl-6 leading-relaxed">
                      {editingItem.summary}
                    </p>
                  )}

                  <article
                    className="prose prose-slate max-w-none 
                    prose-headings:font-black prose-headings:text-slate-800
                    prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-base
                    prose-strong:text-slate-800 prose-strong:font-bold
                    prose-img:rounded-3xl prose-img:shadow-xl prose-img:border-4 prose-img:border-white
                    "
                    dangerouslySetInnerHTML={{ __html: editingItem?.content_html || '<p class="text-slate-300 italic">Chưa có nội dung bài viết...</p>' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-emerald-50 rounded-2xl">
            {icon}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{title}</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Quản trị nội dung hệ thống</p>
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-[#00a651] text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
        >
          <MessageSquarePlus className="w-5 h-5" /> Viết bài mới
        </button>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-wrap items-center gap-6">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <th onClick={() => handleSort('title')} className="px-8 py-5 text-left cursor-pointer hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-2">Tiêu đề bài viết {getSortIcon('title')}</div>
              </th>
              <th onClick={() => handleSort('author')} className="px-8 py-5 text-left w-48 cursor-pointer hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-2">Tác giả {getSortIcon('author')}</div>
              </th>
              <th onClick={() => handleSort('date')} className="px-8 py-5 text-left w-40 cursor-pointer hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-2">Ngày tạo {getSortIcon('date')}</div>
              </th>
              <th onClick={() => handleSort('views')} className="px-8 py-5 text-center w-32 cursor-pointer hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-2 justify-center">Xem {getSortIcon('views')}</div>
              </th>
              <th className="px-8 py-5 text-center w-40">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredAndSortedItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex gap-6 items-center">
                    <div className="w-24 h-16 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-slate-100 uppercase text-[10px] font-bold text-slate-300 flex items-center justify-center">
                      {(item.image_url || item.image) ? (
                        <img src={item.image_url || item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.title} />
                      ) : (
                        <span>No cover</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-slate-800 line-clamp-1 group-hover:text-[#00a651] transition-colors">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1 italic mt-1 font-medium">{item.summary}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                    <User className="w-4 h-4 text-emerald-500" /> {item.author}
                  </div>
                </td>
                <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                  {item.date}
                </td>
                <td className="px-8 py-6 text-center">
                  <span className="px-4 py-1.5 bg-slate-50 text-slate-600 rounded-full text-xs font-black">
                    {item.views}
                  </span>
                </td>
                <td className="px-8 py-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => handleEdit(item)} className="p-2.5 bg-white border border-slate-100 text-emerald-500 rounded-xl hover:shadow-lg transition-all active:scale-90" title="Sửa">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-white border border-slate-100 text-slate-300 hover:text-red-500 rounded-xl hover:shadow-lg transition-all active:scale-90" title="Xóa">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredAndSortedItems.length === 0 && (
              <tr>
                <td colSpan={5} className="py-24 text-center opacity-30 italic font-medium">Chưa có dữ liệu bài viết</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="bg-white border-t border-slate-200 px-8 py-6 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest">
        <div>Hiển thị <span className="text-slate-900 mx-1">{Math.min(filteredAndSortedItems.length - (page - 1) * PAGE_SIZE, PAGE_SIZE)}</span> / <span className="text-slate-900 mx-1">{filteredAndSortedItems.length}</span> {type === 'news' ? 'tin tức' : 'sách'}</div>

        {filteredAndSortedItems.length > PAGE_SIZE && (
          <div className="flex items-center gap-2">
            <span className="mr-8 text-slate-400">Trang {page} / {Math.ceil(filteredAndSortedItems.length / PAGE_SIZE)}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black disabled:opacity-30 hover:bg-slate-50 transition-all active:scale-95"
              >
                Trình trước
              </button>
              <button
                disabled={page >= Math.ceil(filteredAndSortedItems.length / PAGE_SIZE)}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black disabled:opacity-30 hover:bg-slate-50 transition-all active:scale-95"
              >
                Trình sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminArticleManagement;

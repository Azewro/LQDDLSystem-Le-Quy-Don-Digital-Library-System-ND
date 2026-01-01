
import React, { useState, useRef, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Calendar, User, Image as ImageIcon, X, Save, ArrowLeft, Loader2, CheckCircle2, FileText, BookMarked, MessageSquarePlus, MousePointer2, AlertCircle, ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { NewsItem, BookIntroduction } from '../types';
import { supabase } from '../lib/supabase';

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
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  
  // Gallery tạm thời
  const [tempGallery, setTempGallery] = useState<string[]>([]);

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
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Sort
    if (sortConfig.direction) {
      result.sort((a, b) => {
        let aVal: any;
        let bVal: any;

        if (sortConfig.key === 'date') {
          aVal = parseDate(a.date);
          bVal = parseDate(b.date);
        } else {
          aVal = a[sortConfig.key];
          bVal = b[sortConfig.key];
        }

        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
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
      image_url: item.image
    });
    setError(null);
    setView('editor');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newUrls = Array.from(files).map(f => URL.createObjectURL(f));
    setTempGallery(prev => [...prev, ...newUrls]);
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
        views: editingItem.views || 0,
        updated_at: new Date().toISOString()
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
      <div className="flex flex-col h-full bg-white animate-in slide-in-from-right-10 duration-300">
        <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('list')} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              {editingItem?.id ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setView('list')} className="px-6 py-2 text-[12px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors">Hủy bỏ</button>
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

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-8">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tiêu đề bài viết <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={editingItem?.title || ''}
                  onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                  placeholder="Nhập tiêu đề thu hút..."
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00a651] text-lg font-bold text-slate-800 shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Nội dung chi tiết (Trình soạn thảo linh hoạt)</label>
                <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 min-h-[700px] flex flex-col shadow-inner">
                   <div className="flex items-center gap-4 border-b border-slate-200 pb-6 mb-6">
                      <div className="flex gap-2">
                        {['B', 'I', 'U'].map(btn => <button key={btn} className="w-10 h-10 font-black bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-emerald-50 hover:text-[#00a651] transition-all shadow-sm active:scale-90">{btn}</button>)}
                      </div>
                      <div className="h-6 w-px bg-slate-200"></div>
                      <p className="text-[11px] font-bold text-slate-400 italic">Đặt con trỏ vào vị trí muốn chèn ảnh rồi bấm nút ở cột bên phải</p>
                   </div>
                   <textarea 
                    ref={contentRef}
                    value={editingItem?.content_html || ''}
                    onChange={(e) => setEditingItem({...editingItem, content_html: e.target.value})}
                    className="flex-1 bg-transparent focus:outline-none text-sm leading-relaxed text-slate-700 resize-none font-mono custom-scrollbar"
                    placeholder="Bắt đầu viết nội dung bài giới thiệu sách hoặc tin tức tại đây..."
                   />
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
               <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6 sticky top-24 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-emerald-500" /> Thư viện ảnh
                    </h3>
                    <div className="relative">
                       <input type="file" multiple onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                       <button className="p-2.5 bg-white rounded-xl text-emerald-500 border border-slate-200 hover:bg-emerald-50 shadow-sm transition-all">
                          <Plus className="w-5 h-5" />
                       </button>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                     {tempGallery.length === 0 ? (
                        <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/50">
                           <ImageIcon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Chưa tải ảnh nào lên bài viết</p>
                        </div>
                     ) : (
                        tempGallery.map((url, i) => (
                           <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 group relative shadow-sm hover:shadow-md transition-all">
                              <img src={url} className="w-full aspect-video object-cover rounded-xl mb-4" />
                              <button 
                                onClick={() => insertImageToContent(url)}
                                className="w-full py-2.5 bg-[#00a651] text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
                              >
                                 <MousePointer2 className="w-4 h-4" /> Chèn vào bài
                              </button>
                              <button 
                                onClick={() => setTempGallery(prev => prev.filter((_, idx) => idx !== i))}
                                className="absolute top-6 right-6 p-2 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                           </div>
                        ))
                     )}
                  </div>
                  
                  <div className="pt-8 border-t border-slate-200 space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ảnh đại diện (URL)</label>
                      <input 
                        type="text" 
                        value={editingItem?.image_url || ''}
                        onChange={(e) => setEditingItem({...editingItem, image_url: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tóm tắt ngắn</label>
                      <textarea 
                        rows={3}
                        value={editingItem?.summary || ''}
                        onChange={(e) => setEditingItem({...editingItem, summary: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium italic leading-relaxed"
                      />
                    </div>
                  </div>
               </div>
            </div>
          </div>
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
            {filteredAndSortedItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex gap-6 items-center">
                    <div className="w-24 h-16 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-slate-100">
                      <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.title} />
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
    </div>
  );
};

export default AdminArticleManagement;

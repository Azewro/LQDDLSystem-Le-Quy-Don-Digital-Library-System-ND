import React, { useState, useRef } from 'react';
import { Layout, Save, ArrowLeft, Loader2, AlertCircle, FileText, Edit, Trash2, Plus, Image as ImageIcon, Search, Eye, X, Bold, Heading1, Heading2, List } from 'lucide-react';
import { StaticPage } from '@/types';
import { supabase } from '@/lib/supabase';
import { uploadFile } from '@/services/storageService';

interface AdminPageManagementProps {
    pages: StaticPage[];
    onRefresh?: () => void;
}

const AdminPageManagement: React.FC<AdminPageManagementProps> = ({ pages, onRefresh }) => {
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tempGallery, setTempGallery] = useState<string[]>([]);
    const contentRef = useRef<HTMLTextAreaElement>(null);
    const [showPreview, setShowPreview] = useState(true);

    const handleEdit = (page: StaticPage) => {
        setEditingPage({
            ...page,
            image_url: page.image_url || '',
            summary: page.summary || ''
        });
        setTempGallery([]);
        setView('editor');
        setError(null);
    };

    const handleCreate = () => {
        setEditingPage({
            id: '',
            slug: '',
            title: '',
            content: '',
            image_url: '',
            summary: '',
            updated_at: new Date().toISOString()
        });
        setTempGallery([]);
        setView('editor');
        setError(null);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isBanner: boolean = false) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSaving(true);
        setError(null);

        try {
            const uploadedUrl = await uploadFile('articles', file);
            if (uploadedUrl) {
                if (isBanner) {
                    setEditingPage({ ...editingPage!, image_url: uploadedUrl });
                } else {
                    setTempGallery(prev => [...prev, uploadedUrl]);
                }
            }
        } catch (err: any) {
            setError("Lỗi tải ảnh: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const insertToContent = (html: string) => {
        if (!contentRef.current) return;
        const textarea = contentRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;

        const newText = text.substring(0, start) + html + text.substring(end);
        setEditingPage({ ...editingPage!, content: newText });

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + html.length, start + html.length);
        }, 10);
    };

    const handleSave = async () => {
        if (!editingPage?.title || !editingPage?.slug) {
            setError("Vui lòng nhập tiêu đề và đường dẫn (slug)");
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const payload = {
                title: editingPage.title,
                slug: editingPage.slug,
                content: editingPage.content,
                image_url: editingPage.image_url,
                summary: editingPage.summary,
                updated_at: new Date().toISOString()
            };

            let result;
            if (editingPage.id) {
                result = await supabase
                    .from('site_pages')
                    .update(payload)
                    .eq('id', editingPage.id);
            } else {
                result = await supabase
                    .from('site_pages')
                    .insert([payload]);
            }

            if (result.error) throw result.error;

            onRefresh?.();
            setView('list');
        } catch (err: any) {
            setError("Lỗi khi lưu trang: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa trang này?")) return;
        try {
            const { error } = await supabase.from('site_pages').delete().eq('id', id);
            if (error) throw error;
            onRefresh?.();
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
                            {editingPage?.id ? 'Biên tập trang' : 'Tạo trang mới'}
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
                            {isSaving ? 'Đang lưu...' : 'Lưu trang'}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex">
                    {/* Toolbar & Input Section */}
                    <div className={`flex-1 overflow-y-auto p-8 custom-scrollbar transition-all duration-300 ${showPreview ? 'w-1/2' : 'w-full max-w-4xl mx-auto'}`}>
                        <div className="space-y-8">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-in fade-in">
                                    <AlertCircle className="w-5 h-5" /> {error}
                                </div>
                            )}

                            {/* Header Info */}
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tiêu đề trang <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={editingPage?.title || ''}
                                            onChange={(e) => setEditingPage({ ...editingPage!, title: e.target.value })}
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a651] text-sm font-bold text-slate-800"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Đường dẫn (Slug) <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={editingPage?.slug || ''}
                                            onChange={(e) => setEditingPage({ ...editingPage!, slug: e.target.value })}
                                            placeholder="huong-dan hoặc gioi-thieu"
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a651] text-sm font-bold text-slate-800"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tóm tắt ngắn gọn</label>
                                    <textarea
                                        rows={2}
                                        value={editingPage?.summary || ''}
                                        onChange={(e) => setEditingPage({ ...editingPage!, summary: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a651] text-sm font-bold text-slate-800 resize-none"
                                        placeholder="Nhập phần mô tả ngắn cho trang..."
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Ảnh Banner chính</label>
                                    <div className="flex items-start gap-6">
                                        <div className="relative group w-48 h-28 bg-slate-100 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200">
                                            {editingPage?.image_url ? (
                                                <>
                                                    <img src={editingPage.image_url} alt="Banner" className="w-full h-full object-cover" />
                                                    <button onClick={() => setEditingPage({ ...editingPage!, image_url: '' })} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                                    <ImageIcon className="w-6 h-6 mb-2" />
                                                    <span className="text-[10px] font-black uppercase">Chưa có ảnh</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <p className="text-[11px] text-slate-400 font-medium">Chọn ảnh chất lượng cao (1200x400) để làm banner cho chuyên mục.</p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                id="banner-upload"
                                                className="hidden"
                                                onChange={(e) => handleFileUpload(e, true)}
                                            />
                                            <label
                                                htmlFor="banner-upload"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-[#00a651] rounded-xl text-[11px] font-black uppercase cursor-pointer hover:bg-emerald-100 transition-colors"
                                            >
                                                <ImageIcon className="w-4 h-4" /> Tải lên ảnh mới
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content Editor */}
                            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                                <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => insertToContent('<h1>Tiêu đề lớn</h1>')} className="p-2 hover:bg-white rounded-lg text-slate-600 transition-all" title="Tiêu đề 1"><Heading1 className="w-4 h-4" /></button>
                                        <button onClick={() => insertToContent('<h2>Tiêu đề nhỏ</h2>')} className="p-2 hover:bg-white rounded-lg text-slate-600 transition-all" title="Tiêu đề 2"><Heading2 className="w-4 h-4" /></button>
                                        <button onClick={() => insertToContent('<strong>văn bản đậm</strong>')} className="p-2 hover:bg-white rounded-lg text-slate-600 transition-all" title="Chữ đậm"><Bold className="w-4 h-4" /></button>
                                        <button onClick={() => insertToContent('<ul>\n  <li>Mục 1</li>\n  <li>Mục 2</li>\n</ul>')} className="p-2 hover:bg-white rounded-lg text-slate-600 transition-all" title="Danh sách"><List className="w-4 h-4" /></button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id="content-img-upload"
                                            className="hidden"
                                            onChange={(e) => handleFileUpload(e, false)}
                                        />
                                        <label
                                            htmlFor="content-img-upload"
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#00a651] text-white rounded-lg text-[10px] font-black uppercase cursor-pointer hover:bg-emerald-700 transition-colors"
                                        >
                                            <Plus className="w-3 h-3" /> Chèn ảnh
                                        </label>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col">
                                    {/* Gallery preview inside editor */}
                                    {tempGallery.length > 0 && (
                                        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex gap-4 overflow-x-auto">
                                            {tempGallery.map((url, i) => (
                                                <div key={i} className="relative group flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden cursor-pointer border-2 border-white shadow-sm hover:border-[#00a651] transition-all" onClick={() => insertToContent(`\n<div class="my-8 flex justify-center"><img src="${url}" class="rounded-3xl shadow-xl max-w-full border-4 border-white" /></div>\n`)}>
                                                    <img src={url} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[8px] font-black uppercase text-center p-1">Nhấn để chèn</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <textarea
                                        ref={contentRef}
                                        value={editingPage?.content || ''}
                                        onChange={(e) => setEditingPage({ ...editingPage!, content: e.target.value })}
                                        className="flex-1 w-full p-8 focus:outline-none text-sm font-medium text-slate-700 leading-relaxed custom-scrollbar bg-slate-50/30"
                                        placeholder="Sử dụng thanh công cụ bên trên hoặc nhập trực tiếp văn bản/HTML..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview Section */}
                    {showPreview && (
                        <div className="flex-1 bg-white border-l border-slate-200 overflow-y-auto p-12 custom-scrollbar animate-in slide-in-from-right-10 duration-500">
                            <div className="max-w-2xl mx-auto">
                                <span className="inline-block px-4 py-1.5 bg-emerald-50 text-[#00a651] text-[10px] font-black uppercase tracking-widest rounded-full mb-6">Bản xem trước</span>

                                {editingPage?.image_url && (
                                    <div className="w-full h-64 rounded-[2.5rem] overflow-hidden shadow-2xl mb-8">
                                        <img src={editingPage.image_url} className="w-full h-full object-cover" />
                                    </div>
                                )}

                                <h1 className="text-4xl font-black text-slate-800 mb-4">{editingPage?.title || 'Tiêu đề trang'}</h1>
                                {editingPage?.summary && (
                                    <p className="text-lg font-bold text-slate-400 italic mb-8 border-l-4 border-emerald-500 pl-6">{editingPage.summary}</p>
                                )}

                                <article
                                    className="prose prose-slate max-w-none 
                                    prose-headings:font-black prose-headings:text-slate-800
                                    prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-base
                                    prose-strong:text-slate-800 prose-strong:font-bold
                                    prose-img:rounded-3xl prose-img:shadow-xl prose-img:border-4 prose-img:border-white
                                    "
                                    dangerouslySetInnerHTML={{ __html: editingPage?.content || '<p class="text-slate-300 italic">Chưa có nội dung...</p>' }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 bg-slate-50/30 min-h-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-emerald-50 rounded-2xl shadow-sm border border-emerald-100">
                        <FileText className="w-6 h-6 text-[#00a651]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Quản lý trang tĩnh</h1>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Nội dung trang Hướng dẫn, Giới thiệu và các trang thông tin khác...</p>
                    </div>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-[#00a651] text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                >
                    <Plus className="w-5 h-5" /> Tạo trang mẫu mới
                </button>
            </div>

            <div className="max-w-6xl mx-auto space-y-8">
                {/* Gợi ý tạo trang hệ thống nếu chưa có */}
                {(() => {
                    const hasIntro = pages.some(p => p.slug === 'gioi-thieu');
                    const hasGuide = pages.some(p => p.slug === 'huong-dan');
                    if (hasIntro && hasGuide) return null;

                    return (
                        <div className="p-8 bg-white border border-emerald-100 rounded-[2.5rem] flex items-center justify-between animate-in fade-in slide-in-from-top-4 shadow-sm shadow-emerald-500/5">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-[#00a651] border border-emerald-100 shadow-inner">
                                    <Layout className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-[17px] font-black text-slate-800 uppercase tracking-tight mb-1">Thiết lập dữ liệu Navbar</h3>
                                    <p className="text-[12px] text-slate-500 font-medium">Bạn cần khởi tạo nội dung cho các liên kết trên thanh menu để chúng hoạt động:</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                {!hasIntro && (
                                    <button
                                        onClick={() => {
                                            handleCreate();
                                            // Chờ state update rồi set thêm details
                                            setTimeout(() => {
                                                setEditingPage(prev => ({ ...prev!, title: 'Giới thiệu', slug: 'gioi-thieu', summary: 'Trang thông tin giới thiệu về thư viện THCS Lê Quý Đôn' }));
                                            }, 0);
                                        }}
                                        className="px-6 py-3 bg-emerald-50 text-[#00a651] border border-emerald-100 rounded-xl text-[11px] font-black uppercase hover:bg-emerald-100 transition-all shadow-sm flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Tạo trang Giới thiệu
                                    </button>
                                )}
                                {!hasGuide && (
                                    <button
                                        onClick={() => {
                                            handleCreate();
                                            setTimeout(() => {
                                                setEditingPage(prev => ({ ...prev!, title: 'Hướng dẫn', slug: 'huong-dan', summary: 'Trang hướng dẫn sử dụng thư viện điện tử cho học sinh và giáo viên' }));
                                            }, 0);
                                        }}
                                        className="px-6 py-3 bg-emerald-50 text-[#00a651] border border-emerald-100 rounded-xl text-[11px] font-black uppercase hover:bg-emerald-100 transition-all shadow-sm flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Tạo trang Hướng dẫn
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })()}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {pages.map((page) => {
                        const isNavbarPage = page.slug === 'gioi-thieu' || page.slug === 'huong-dan';
                        return (
                            <div key={page.id} className={`bg-white p-8 rounded-[2.5rem] border transition-all group relative overflow-hidden flex flex-col min-h-[320px] ${isNavbarPage ? 'border-emerald-200 shadow-xl shadow-emerald-500/5 ring-4 ring-emerald-50/50' : 'border-slate-100 hover:shadow-2xl hover:-translate-y-2'}`}>
                                {isNavbarPage && (
                                    <div className="absolute top-0 right-0 px-5 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-bl-[1.5rem] shadow-lg shadow-emerald-500/20 z-10 flex items-center gap-2">
                                        <Layout className="w-3.5 h-3.5" /> Link trên Navbar
                                    </div>
                                )}

                                <div className="flex items-center gap-5 mb-8">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isNavbarPage ? 'bg-emerald-50 text-[#00a651] shadow-inner' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-[#00a651]'}`}>
                                        <FileText className="w-8 h-8" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-[17px] font-black text-slate-800 uppercase tracking-tight truncate mb-1">{page.title}</h3>
                                        <div className="flex items-center gap-2">
                                            <code className="text-[10px] font-black px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors uppercase tracking-widest leading-none">
                                                /{page.slug}
                                            </code>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-[13px] text-slate-500 line-clamp-3 mb-8 font-medium leading-relaxed italic border-l-2 border-slate-100 pl-4 flex-1">
                                    {page.summary || 'Chưa có thông tin mô tả ngắn cho trang này...'}
                                </p>

                                <div className="flex items-center justify-between pt-8 border-t border-slate-50 mt-auto">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Cập nhật lúc</span>
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                            {new Date(page.updated_at).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleEdit(page)}
                                            className="p-3 bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-[#00a651] rounded-2xl transition-all hover:shadow-lg active:scale-90"
                                            title="Sửa nội dung"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        {!isNavbarPage && (
                                            <button
                                                onClick={() => handleDelete(page.id)}
                                                className="p-3 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all hover:shadow-lg active:scale-90"
                                                title="Xóa trang"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Nút tạo trang mới kiểu Card */}
                    <button
                        onClick={handleCreate}
                        className="group p-8 rounded-[2.5rem] border-4 border-dashed border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all flex flex-col items-center justify-center gap-4 text-slate-300 hover:text-emerald-500 grayscale hover:grayscale-0 min-h-[320px]"
                    >
                        <div className="w-16 h-16 rounded-full border-4 border-current flex items-center justify-center transition-transform group-hover:scale-110">
                            <Plus className="w-8 h-8" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-[0.2em]">Tạo thêm trang mới</span>
                        <p className="text-[10px] font-medium text-center max-w-[200px] leading-relaxed">Nhấn để bổ sung thêm các trang thông tin phụ khác cho Thư viện.</p>
                    </button>
                </div>

                {pages.length === 0 && (
                    <div className="py-32 text-center animate-in zoom-in-95 duration-700">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                            <FileText className="w-12 h-12" />
                        </div>
                        <h2 className="text-xl font-black text-slate-300 uppercase tracking-widest">Hệ thống trang đang trống</h2>
                        <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto leading-relaxed">Sử dụng thanh gợi ý phía trên để khởi tạo nhanh các trang Menu chính cho website.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPageManagement;

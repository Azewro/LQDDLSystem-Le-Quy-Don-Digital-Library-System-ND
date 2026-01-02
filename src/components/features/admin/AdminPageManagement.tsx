
import React, { useState } from 'react';
import { Layout, Save, ArrowLeft, Loader2, AlertCircle, FileText, Edit, Trash2, Plus } from 'lucide-react';
import { StaticPage } from '@/types';
import { supabase } from '@/lib/supabase';

interface AdminPageManagementProps {
    pages: StaticPage[];
    onRefresh?: () => void;
}

const AdminPageManagement: React.FC<AdminPageManagementProps> = ({ pages, onRefresh }) => {
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleEdit = (page: StaticPage) => {
        setEditingPage(page);
        setView('editor');
        setError(null);
    };

    const handleCreate = () => {
        setEditingPage({
            id: '',
            slug: '',
            title: '',
            content: '',
            updated_at: new Date().toISOString()
        });
        setView('editor');
        setError(null);
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

    if (view === 'editor') {
        return (
            <div className="flex flex-col h-full bg-white animate-in slide-in-from-right-10 duration-300">
                <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView('list')} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                            {editingPage?.id ? 'Chỉnh sửa trang tĩnh' : 'Tạo trang mới'}
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
                            {isSaving ? 'Đang lưu...' : 'Lưu trang'}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-in fade-in">
                                <AlertCircle className="w-5 h-5" /> {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tiêu đề trang <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={editingPage?.title || ''}
                                    onChange={(e) => setEditingPage({ ...editingPage!, title: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00a651] text-sm font-bold text-slate-800 shadow-inner"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Đường dẫn (Slug) <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={editingPage?.slug || ''}
                                    onChange={(e) => setEditingPage({ ...editingPage!, slug: e.target.value })}
                                    placeholder="huong-dan hoặc gioi-thieu"
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00a651] text-sm font-bold text-slate-800 shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Nội dung (HTML)</label>
                            <textarea
                                value={editingPage?.content || ''}
                                onChange={(e) => setEditingPage({ ...editingPage!, content: e.target.value })}
                                className="w-full h-[600px] p-8 bg-slate-50 border border-slate-100 rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-[#00a651] text-sm font-mono text-slate-700 leading-relaxed shadow-inner"
                                placeholder="Nhập mã HTML nội dung trang..."
                            />
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
                        <FileText className="w-6 h-6 text-[#00a651]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Quản lý trang tĩnh</h1>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Nội dung trang Hướng dẫn, Giới thiệu...</p>
                    </div>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-[#00a651] text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                >
                    <Plus className="w-5 h-5" /> Tạo trang mới
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <th className="px-8 py-5 text-left">Tiêu đề trang</th>
                            <th className="px-8 py-5 text-left w-64">Slug</th>
                            <th className="px-8 py-5 text-left w-48">Cập nhật cuối</th>
                            <th className="px-8 py-5 text-center w-40">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {pages.map((page) => (
                            <tr key={page.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-6">
                                    <h4 className="text-[14px] font-bold text-slate-800 group-hover:text-[#00a651] transition-colors">{page.title}</h4>
                                </td>
                                <td className="px-8 py-6">
                                    <code className="text-[11px] font-black bg-slate-100 text-slate-400 px-2 py-1 rounded-md">{page.slug}</code>
                                </td>
                                <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                                    {new Date(page.updated_at).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => handleEdit(page)} className="p-2.5 bg-white border border-slate-100 text-emerald-500 rounded-xl hover:shadow-lg transition-all" title="Sửa">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {pages.length === 0 && (
                            <tr>
                                <td colSpan={4} className="py-24 text-center opacity-30 italic font-medium">Chưa có trang tĩnh nào</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPageManagement;

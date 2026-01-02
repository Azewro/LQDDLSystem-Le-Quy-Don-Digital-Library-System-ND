import React, { useEffect } from 'react';
import { Eye, Heart, BookOpen, Calendar, User, ArrowLeft, Download, ExternalLink, FileText, Tablet } from 'lucide-react';
import { EBook } from '@/types';
import { supabase } from '@/lib/supabase';

interface EBookDetailViewProps {
    book: EBook;
    onBack: () => void;
    onRead: () => void;
}

const EBookDetailView: React.FC<EBookDetailViewProps> = ({ book, onBack, onRead }) => {
    // Increment view count on mount
    useEffect(() => {
        const incrementView = async () => {
            await supabase.rpc('increment_ebook_views', { ebook_id: book.id });
        };
        incrementView();
    }, [book.id]);

    const getDrivePreviewUrl = (fileId: string) =>
        `https://drive.google.com/file/d/${fileId}/preview`;

    const getDriveDownloadUrl = (fileId: string) =>
        `https://drive.google.com/uc?export=download&id=${fileId}`;

    const getDriveThumbnail = (fileId: string) =>
        `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white">
            {/* Hero Section with Cover */}
            <div
                className="relative h-[400px] bg-cover bg-center"
                style={{
                    backgroundImage: `url(${book.cover_url || getDriveThumbnail(book.drive_file_id)})`,
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-100" />

                {/* Back Button */}
                <div className="absolute top-6 left-6 z-20">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" /> Quay lại
                    </button>
                </div>

                {/* Book Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 z-10">
                    <div className="max-w-6xl mx-auto px-8 pb-16">
                        <div className="flex gap-8 items-end">
                            {/* Cover Image */}
                            <div className="w-48 h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 flex-shrink-0 -mb-20 relative z-20">
                                <img
                                    src={book.cover_url || getDriveThumbnail(book.drive_file_id)}
                                    className="w-full h-full object-cover"
                                    alt={book.title}
                                />
                            </div>

                            {/* Title & Meta */}
                            <div className="flex-1 text-white pb-4">
                                <h1 className="text-3xl font-black mb-4 leading-tight">{book.title}</h1>
                                <div className="flex flex-wrap gap-6 text-sm text-white/80">
                                    <span className="flex items-center gap-2">
                                        <Eye className="w-4 h-4 text-emerald-400" /> {book.views} lượt xem
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Heart className="w-4 h-4 text-pink-400" /> {book.favorites} yêu thích
                                    </span>
                                    {book.author && (
                                        <span className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-sky-400" /> {book.author}
                                        </span>
                                    )}
                                    {book.publication_year && (
                                        <span className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-amber-400" /> Năm {book.publication_year}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-6xl mx-auto px-8 pt-28 pb-16">
                <div className="flex gap-12">
                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Action Buttons */}
                        <div className="flex gap-4 mb-10">
                            <button
                                onClick={onRead}
                                className="flex items-center gap-3 px-8 py-4 bg-[#00a651] text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                            >
                                <BookOpen className="w-5 h-5" /> Đọc sách
                            </button>
                            <button
                                onClick={() => {
                                    // Toggle favorite logic would go here
                                    alert('Tính năng yêu thích sẽ được thêm sau!');
                                }}
                                className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm"
                            >
                                <Heart className="w-5 h-5" />
                            </button>
                            <a
                                href={getDriveDownloadUrl(book.drive_file_id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm"
                            >
                                <Download className="w-5 h-5" />
                            </a>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                            <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                                <FileText className="w-5 h-5 text-[#00a651]" /> Giới thiệu sách
                            </h2>

                            <div className="space-y-4 text-slate-600 leading-relaxed">
                                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                                    <div className="flex gap-2">
                                        <span className="text-slate-400 font-medium">Nhan đề:</span>
                                        <span className="font-bold">{book.title}</span>
                                    </div>
                                    {book.author && (
                                        <div className="flex gap-2">
                                            <span className="text-slate-400 font-medium">Tác giả:</span>
                                            <span className="font-bold">{book.author}</span>
                                        </div>
                                    )}
                                    {book.publisher && (
                                        <div className="flex gap-2">
                                            <span className="text-slate-400 font-medium">Nhà xuất bản:</span>
                                            <span className="font-bold">{book.publisher}</span>
                                        </div>
                                    )}
                                    {book.publication_year && (
                                        <div className="flex gap-2">
                                            <span className="text-slate-400 font-medium">Năm xuất bản:</span>
                                            <span className="font-bold">{book.publication_year}</span>
                                        </div>
                                    )}
                                    {book.page_count && (
                                        <div className="flex gap-2">
                                            <span className="text-slate-400 font-medium">Số trang:</span>
                                            <span className="font-bold">{book.page_count} trang</span>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <span className="text-slate-400 font-medium">Cấp lớp:</span>
                                        <span className="px-3 py-0.5 bg-emerald-50 text-[#00a651] rounded-full text-xs font-bold">
                                            {book.grade}
                                        </span>
                                    </div>
                                </div>

                                {book.description ? (
                                    <p className="text-base leading-relaxed">{book.description}</p>
                                ) : (
                                    <p className="text-slate-400 italic">Chưa có mô tả cho cuốn sách này.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="w-80 flex-shrink-0">
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm sticky top-28">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                Thông tin thêm
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-slate-50">
                                    <span className="text-sm text-slate-500">Lượt xem</span>
                                    <span className="text-sm font-bold text-slate-800">{book.views}</span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-slate-50">
                                    <span className="text-sm text-slate-500">Yêu thích</span>
                                    <span className="text-sm font-bold text-slate-800">{book.favorites}</span>
                                </div>
                                {book.page_count && (
                                    <div className="flex items-center justify-between py-3 border-b border-slate-50">
                                        <span className="text-sm text-slate-500">Số trang</span>
                                        <span className="text-sm font-bold text-slate-800">{book.page_count}</span>
                                    </div>
                                )}
                            </div>

                            <a
                                href={getDrivePreviewUrl(book.drive_file_id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                            >
                                <ExternalLink className="w-4 h-4" /> Mở trong tab mới
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EBookDetailView;

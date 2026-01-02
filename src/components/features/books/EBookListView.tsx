import React, { useState, useMemo } from 'react';
import { Eye, Heart, FolderOpen, ChevronRight, LayoutGrid, Search, Filter, Tablet, BookOpen, ChevronDown } from 'lucide-react';
import { EBook, EBookFolder } from '@/types';

interface EBookListViewProps {
    ebooks: EBook[];
    folders: EBookFolder[];
    onBookClick: (book: EBook) => void;
    onNavigateHome: () => void;
    onNavigateOverview: () => void;
}

const EBookListView: React.FC<EBookListViewProps> = ({
    ebooks,
    folders,
    onBookClick,
    onNavigateHome,
    onNavigateOverview
}) => {
    const [selectedGrade, setSelectedGrade] = useState<string>('Tất cả');
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    // Build folder tree
    const folderTree = useMemo(() => {
        const rootFolders = folders.filter(f => !f.parent_id).sort((a, b) => a.display_order - b.display_order);
        const getChildren = (parentId: string): EBookFolder[] =>
            folders.filter(f => f.parent_id === parentId).sort((a, b) => a.display_order - b.display_order);
        return { rootFolders, getChildren };
    }, [folders]);

    // Count books in each folder (including subfolders)
    const folderBookCount = useMemo(() => {
        const counts: Record<string, number> = {};

        // Helper to get all child folder IDs for a given folder
        const getAllChildFolderIds = (folderId: string): string[] => {
            const children = folders.filter(f => f.parent_id === folderId);
            let ids = children.map(c => c.id);
            children.forEach(c => {
                ids = [...ids, ...getAllChildFolderIds(c.id)];
            });
            return ids;
        };

        folders.forEach(f => {
            const folderIds = [f.id, ...getAllChildFolderIds(f.id)];
            counts[f.id] = ebooks.filter(b => b.folder_id && folderIds.includes(b.folder_id)).length;
        });

        return counts;
    }, [ebooks, folders]);

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

        if (selectedGrade !== 'Tất cả') {
            result = result.filter(b => b.grade === selectedGrade);
        }

        if (selectedFolder) {
            result = result.filter(b => b.folder_id === selectedFolder);
        }

        return result;
    }, [ebooks, searchTerm, selectedGrade, selectedFolder]);

    // Get Google Drive thumbnail
    const getDriveThumbnail = (fileId: string) =>
        `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;

    // Toggle folder expansion
    const toggleFolder = (folderId: string) => {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(folderId)) {
            newExpanded.delete(folderId);
        } else {
            newExpanded.add(folderId);
        }
        setExpandedFolders(newExpanded);
    };

    // Render folder tree item
    const renderFolderItem = (folder: EBookFolder, depth: number = 0) => {
        const children = folderTree.getChildren(folder.id);
        const hasChildren = children.length > 0;
        const isExpanded = expandedFolders.has(folder.id);
        const isSelected = selectedFolder === folder.id;
        const bookCount = folderBookCount[folder.id] || 0;

        return (
            <div key={folder.id}>
                <button
                    onClick={() => {
                        if (hasChildren) toggleFolder(folder.id);
                        setSelectedFolder(isSelected ? null : folder.id);
                    }}
                    className={`w-full flex items-center gap-2 py-2.5 px-3 rounded-xl transition-all text-left group ${isSelected
                        ? 'bg-emerald-50 text-[#00a651]'
                        : 'hover:bg-slate-50 text-slate-600'
                        }`}
                    style={{ paddingLeft: `${12 + depth * 16}px` }}
                >
                    {hasChildren && (
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    )}
                    {!hasChildren && <div className="w-3.5" />}
                    <FolderOpen className={`w-4 h-4 ${isSelected ? 'text-[#00a651]' : 'text-slate-400 group-hover:text-[#00a651]'}`} />
                    <span className={`flex-1 text-sm font-medium truncate ${isSelected ? 'font-bold' : ''}`}>
                        {folder.name}
                    </span>
                    <span className={`text-[10px] font-bold ${isSelected ? 'text-[#00a651]' : 'text-slate-400'}`}>
                        ({bookCount})
                    </span>
                </button>
                {hasChildren && isExpanded && (
                    <div className="animate-in slide-in-from-top-2">
                        {children.map(child => renderFolderItem(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-[1440px] mx-auto px-6 py-10">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-[12px] font-medium text-slate-400 mb-8 uppercase tracking-widest">
                <span className="hover:text-[#00a651] cursor-pointer" onClick={onNavigateHome}>Trang chủ</span>
                <span className="opacity-30">/</span>
                <span className="hover:text-[#00a651] cursor-pointer" onClick={onNavigateOverview}>Tài liệu</span>
                <span className="opacity-30">/</span>
                <span className="text-emerald-600">Sách điện tử</span>
            </nav>

            <div className="flex gap-8">
                {/* SIDEBAR */}
                <aside className="w-72 flex-shrink-0">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-28">
                        {/* Search */}
                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm sách..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        {/* Folder Tree */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <FolderOpen className="w-4 h-4 text-[#00a651]" /> Thư mục
                                </h3>
                                {selectedFolder && (
                                    <button
                                        onClick={() => setSelectedFolder(null)}
                                        className="text-[10px] font-bold text-[#00a651] uppercase hover:underline"
                                    >
                                        Xóa lọc
                                    </button>
                                )}
                            </div>
                            <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                                {folderTree.rootFolders.length > 0 ? (
                                    folderTree.rootFolders.map(folder => renderFolderItem(folder))
                                ) : (
                                    <p className="text-sm text-slate-400 italic">Chưa có thư mục nào</p>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg">
                                    <Tablet className="w-5 h-5 text-[#00a651]" />
                                </div>
                                <div>
                                    <p className="text-lg font-black text-slate-800">{ebooks.length}</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Sách điện tử</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1">
                    {/* Grade Filter Bar */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-8 flex items-center gap-8">
                        <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Lớp</span>
                        <div className="flex gap-2">
                            {['Tất cả', 'Khối 6', 'Khối 7', 'Khối 8', 'Khối 9'].map((grade) => (
                                <button
                                    key={grade}
                                    onClick={() => setSelectedGrade(grade)}
                                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${selectedGrade === grade
                                        ? 'bg-emerald-50 text-[#00a651] ring-1 ring-emerald-200 shadow-sm'
                                        : 'bg-transparent text-slate-500 hover:bg-slate-50'
                                        }`}
                                >
                                    {grade}
                                </button>
                            ))}
                        </div>
                        <div className="ml-auto text-sm font-bold text-slate-400">
                            {filteredBooks.length} kết quả
                        </div>
                    </div>

                    {/* Books Grid */}
                    <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm min-h-[600px]">
                        {filteredBooks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                <LayoutGrid className="w-16 h-16 text-slate-200 mb-4" />
                                <p className="font-bold text-slate-400">Không tìm thấy sách phù hợp</p>
                                <p className="text-sm text-slate-300 mt-2">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                                {filteredBooks.map((book) => (
                                    <div key={book.id} className="group cursor-pointer" onClick={() => onBookClick(book)}>
                                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-slate-100 mb-3 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all bg-slate-100">
                                            <img
                                                src={book.cover_url || getDriveThumbnail(book.drive_file_id)}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                alt={book.title}
                                                loading="lazy"
                                            />
                                        </div>
                                        <h4 className="text-[13px] font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-[#00a651] mb-2">
                                            {book.title}
                                        </h4>
                                        <div className="flex flex-col gap-1 text-[10px] text-slate-400 font-medium mb-2">
                                            <span>{book.author || 'Chưa rõ tác giả'}</span>
                                            {book.publication_year && <span className="italic">Năm {book.publication_year}</span>}
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-400 text-[10px] font-bold">
                                            <span className="flex items-center gap-1.5">
                                                <Eye className="w-3.5 h-3.5" /> {book.views} lượt xem
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Heart className="w-3.5 h-3.5" /> {book.favorites}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EBookListView;

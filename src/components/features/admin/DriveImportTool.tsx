import React, { useState } from 'react';
import { CloudDownload, FolderOpen, Loader2, CheckCircle, XCircle, AlertCircle, RefreshCw, FileText, ExternalLink, FolderTree, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
    scanFolderRecursive,
    flattenScanResult,
    extractFolderIdFromUrl,
    extractBookTitleFromFilename,
    guessGradeFromFilename,
    hasApiKey,
    DriveFile,
    FolderScanResult
} from '@/services/driveService';

interface DriveImportToolProps {
    onImportComplete?: () => void;
}

const API_KEY = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY || '';

interface ImportPreviewItem {
    file: DriveFile;
    title: string;
    grade: string;
    folderPath: string;
    driveFolderId: string;
    driveFolderName: string;
    selected: boolean;
    status: 'pending' | 'importing' | 'success' | 'error';
    error?: string;
}

interface FolderMapping {
    driveFolderId: string;
    driveFolderName: string;
    dbFolderId?: string;
}

const DriveImportTool: React.FC<DriveImportToolProps> = ({ onImportComplete }) => {
    const [folderUrl, setFolderUrl] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [previewItems, setPreviewItems] = useState<ImportPreviewItem[]>([]);
    const [scanResult, setScanResult] = useState<FolderScanResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [importStats, setImportStats] = useState({ success: 0, failed: 0, folders: 0 });
    const [scanProgress, setScanProgress] = useState('');
    const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
    const [isOptimized, setIsOptimized] = useState(true); // Default to optimized for best UX

    const handleScan = async () => {
        setError(null);
        setPreviewItems([]);
        setScanResult(null);

        if (!hasApiKey()) {
            setError('Chưa cấu hình Google Drive API Key. Vui lòng thêm VITE_GOOGLE_DRIVE_API_KEY vào file .env');
            return;
        }

        const folderId = extractFolderIdFromUrl(folderUrl) || folderUrl.trim();
        if (!folderId) {
            setError('Vui lòng nhập link folder Google Drive hoặc Folder ID');
            return;
        }

        setIsScanning(true);
        setScanProgress('Đang quét folder chính...');

        try {
            // Scan recursive
            const result = await scanFolderRecursive(folderId, 'Root', 0, 3);
            setScanResult(result);

            // Flatten to get all PDFs with folder info
            const flatItems = flattenScanResult(result);

            if (flatItems.length === 0) {
                setError('Không tìm thấy file PDF nào trong folder này (bao gồm subfolders)');
                return;
            }

            setScanProgress(`Đang kiểm tra ${flatItems.length} sách trong database...`);

            // Check for existing books BEFORE creating preview items
            const driveFileIds = flatItems.map(item => item.file.id);
            const { data: existingBooks } = await supabase
                .from('ebooks')
                .select('drive_file_id')
                .in('drive_file_id', driveFileIds);

            const existingIds = new Set(existingBooks?.map(b => b.drive_file_id) || []);
            const existingCount = existingIds.size;
            const newCount = flatItems.length - existingCount;

            // Create preview items with exists status for duplicates
            const items: ImportPreviewItem[] = flatItems.map(item => {
                const isExisting = existingIds.has(item.file.id);
                return {
                    file: item.file,
                    title: extractBookTitleFromFilename(item.file.name),
                    grade: guessGradeFromFilename(item.file.name),
                    folderPath: item.folderPath,
                    driveFolderId: item.folderId,
                    driveFolderName: item.folderName,
                    selected: !isExisting, // Don't select existing items
                    status: isExisting ? 'error' as const : 'pending' as const,
                    error: isExisting ? 'Đã có trong thư viện' : undefined
                };
            });

            setPreviewItems(items);

            // Show summary with existing count
            if (existingCount > 0) {
                setScanProgress(`Tìm thấy ${flatItems.length} files PDF (${newCount} mới, ${existingCount} đã có)`);
            } else {
                setScanProgress(`Tìm thấy ${flatItems.length} files PDF mới trong ${countFolders(result)} thư mục`);
            }
        } catch (err: any) {
            setError(err.message || 'Lỗi khi quét folder Google Drive');
        } finally {
            setIsScanning(false);
        }
    };

    // Count folders in scan result
    const countFolders = (result: FolderScanResult): number => {
        let count = 1;
        for (const sub of result.subfolders) {
            count += countFolders(sub);
        }
        return count;
    };

    const handleSelectAll = (selected: boolean) => {
        setPreviewItems(items => items.map(item => ({ ...item, selected })));
    };

    const handleToggleItem = (index: number) => {
        setPreviewItems(items => items.map((item, i) =>
            i === index ? { ...item, selected: !item.selected } : item
        ));
    };

    const handleUpdateItem = (index: number, updates: Partial<ImportPreviewItem>) => {
        setPreviewItems(items => items.map((item, i) =>
            i === index ? { ...item, ...updates } : item
        ));
    };

    // Create folders in database from scan result
    const createFoldersFromScanResult = async (result: FolderScanResult, parentDbId: string | null = null): Promise<Map<string, string>> => {
        const mapping = new Map<string, string>();

        // Skip root folder, create children
        for (const subfolder of result.subfolders) {
            // Check if folder already exists
            const { data: existing } = await supabase
                .from('ebook_folders')
                .select('id')
                .eq('name', subfolder.folder.name)
                .maybeSingle();

            let dbFolderId: string;

            if (existing) {
                dbFolderId = existing.id;
            } else {
                // Create new folder
                const { data: newFolder, error } = await supabase
                    .from('ebook_folders')
                    .insert({
                        name: subfolder.folder.name,
                        parent_id: parentDbId,
                        display_order: 0
                    })
                    .select('id')
                    .single();

                if (error) throw error;
                dbFolderId = newFolder.id;
            }

            mapping.set(subfolder.folder.id, dbFolderId);

            // Recursively create subfolders
            const subMappings = await createFoldersFromScanResult(subfolder, dbFolderId);
            subMappings.forEach((v, k) => mapping.set(k, v));
        }

        return mapping;
    };

    const handleImport = async () => {
        const selectedItems = previewItems.filter(item => item.selected && item.status === 'pending');
        if (selectedItems.length === 0) {
            setError('Vui lòng chọn ít nhất 1 file để import');
            return;
        }

        setIsImporting(true);
        setError(null);
        let success = 0;
        let failed = 0;
        let foldersCreated = 0;

        try {
            // Step 1: Create folders from scan result
            if (scanResult) {
                setScanProgress('Đang tạo thư mục...');
                const folderMapping = await createFoldersFromScanResult(scanResult);
                foldersCreated = folderMapping.size;

                // Step 2: BATCH Import - Much faster!
                const selectedItems = previewItems
                    .map((item, index) => ({ ...item, originalIndex: index }))
                    .filter(item => item.selected && item.status === 'pending');

                const totalToImport = selectedItems.length;
                setImportProgress({ current: 0, total: totalToImport });
                setScanProgress(`Đang kiểm tra ${totalToImport} sách...`);

                // Get all drive_file_ids to check
                const driveFileIds = selectedItems.map(item => item.file.id);

                // Batch check existing books (up to 1000 at once)
                const { data: existingBooks } = await supabase
                    .from('ebooks')
                    .select('drive_file_id')
                    .in('drive_file_id', driveFileIds);

                const existingIds = new Set(existingBooks?.map(b => b.drive_file_id) || []);

                // Split into new books and duplicates
                const newBooks: typeof selectedItems = [];
                const duplicates: typeof selectedItems = [];

                for (const item of selectedItems) {
                    if (existingIds.has(item.file.id)) {
                        duplicates.push(item);
                        handleUpdateItem(item.originalIndex, { status: 'error', error: 'Sách đã tồn tại' });
                        failed++;
                    } else {
                        newBooks.push(item);
                    }
                }

                // Batch insert new books - now with Storage Upload
                const totalNewBooks = newBooks.length;
                setScanProgress(`Đang xử lý ${totalNewBooks} sách mới...`);

                for (let i = 0; i < newBooks.length; i++) {
                    const item = newBooks[i];
                    handleUpdateItem(item.originalIndex, { status: 'importing' });

                    try {
                        let storagePath = null;

                        // OPTIONAL: Optimization (Download from Drive -> Upload to Supabase)
                        if (isOptimized) {
                            setScanProgress(`[${i + 1}/${totalNewBooks}] Đang tối ưu: ${item.title}...`);

                            // Download via Proxy
                            const downloadUrl = `/drive-uc-proxy?export=download&id=${item.file.id}`;
                            const response = await fetch(downloadUrl);

                            if (!response.ok) {
                                // Fallback to secondary proxy if needed
                                console.warn("Primary proxy failed, trying fallback...");
                            }

                            const blob = await response.blob();
                            if (blob.type.includes('html')) {
                                throw new Error("Google Drive blocked download (Automated Queries). Import metadata only or try again later.");
                            }

                            // Upload to Supabase
                            const fileName = `${item.grade}/${Date.now()}-${item.file.name.replace(/\s+/g, '_')}`;
                            const { data: uploadData, error: uploadError } = await supabase.storage
                                .from('ebooks')
                                .upload(fileName, blob);

                            if (uploadError) throw uploadError;
                            storagePath = uploadData.path;

                            // Small delay to be nice to Google
                            await new Promise(r => setTimeout(r, 1500));
                        }

                        const { error: insertError } = await supabase.from('ebooks').insert({
                            title: item.title,
                            drive_file_id: item.file.id,
                            grade: item.grade,
                            folder_id: folderMapping.get(item.driveFolderId) || null,
                            storage_path: storagePath,
                            views: 0,
                            favorites: 0
                        });

                        if (insertError) throw insertError;

                        handleUpdateItem(item.originalIndex, { status: 'success' });
                        success++;
                    } catch (err: any) {
                        console.error(`Error importing ${item.title}:`, err);
                        handleUpdateItem(item.originalIndex, { status: 'error', error: err.message });
                        failed++;
                    }

                    // Update progress
                    setImportProgress({ current: i + 1 + duplicates.length, total: totalToImport });
                }
            }

            setImportStats({ success, failed, folders: foldersCreated });
        } catch (err: any) {
            setError('Lỗi khi import: ' + err.message);
        } finally {
            setIsImporting(false);
            if (success > 0) {
                onImportComplete?.();
            }
        }
    };

    const selectedCount = previewItems.filter(item => item.selected && item.status === 'pending').length;
    const hasApiKeyConfigured = hasApiKey();

    // Group preview items by folder
    const groupedByFolder = previewItems.reduce((acc, item) => {
        if (!acc[item.folderPath]) acc[item.folderPath] = [];
        acc[item.folderPath].push(item);
        return acc;
    }, {} as Record<string, ImportPreviewItem[]>);

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-50 rounded-xl">
                    <CloudDownload className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                    <h2 className="text-lg font-black text-slate-800">Import từ Google Drive</h2>
                    <p className="text-slate-400 text-xs">Tự động scan subfolders và tạo cấu trúc thư mục</p>
                </div>
            </div>

            {/* API Key Warning */}
            {!hasApiKeyConfigured && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-amber-800">Chưa cấu hình Google Drive API Key</p>
                        <p className="text-xs text-amber-600 mt-1">
                            Thêm <code className="bg-amber-100 px-1 rounded">VITE_GOOGLE_DRIVE_API_KEY=your_api_key</code> vào file <code className="bg-amber-100 px-1 rounded">.env</code>
                        </p>
                    </div>
                </div>
            )}

            {/* Folder URL Input */}
            <div className="flex gap-3 mb-6">
                <div className="flex-1 relative">
                    <FolderOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input
                        type="text"
                        placeholder="Paste link folder Google Drive..."
                        value={folderUrl}
                        onChange={(e) => setFolderUrl(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                    />
                </div>
                <button
                    onClick={handleScan}
                    disabled={isScanning || !folderUrl.trim()}
                    className="px-6 py-3.5 bg-blue-500 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-600 transition-all disabled:opacity-50"
                >
                    {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderTree className="w-4 h-4" />}
                    {isScanning ? 'Đang quét...' : 'Quét Folder & Subfolders'}
                </button>
            </div>

            {/* Optimization Option */}
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                        <RefreshCw className={`w-5 h-5 text-emerald-500 ${isOptimized ? 'animate-spin-slow' : ''}`} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">Tối ưu hóa tài liệu</p>
                        <p className="text-[10px] text-slate-500 font-medium">Tải lên Supabase để sử dụng hiệu ứng lật sách 3D cực mượt</p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isOptimized}
                        onChange={(e) => setIsOptimized(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
            </div>

            {/* Scan Progress */}
            {scanProgress && !error && (
                <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2 text-sm text-blue-700 font-medium">
                    <FolderTree className="w-4 h-4" />
                    {scanProgress}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {/* Preview List - Grouped by Folder */}
            {previewItems.length > 0 && (
                <>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={previewItems.every(i => i.selected)}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    className="w-4 h-4 accent-blue-500"
                                />
                                <span className="text-sm font-bold text-slate-600">Chọn tất cả</span>
                            </label>
                            <span className="text-xs text-slate-400">
                                Đã chọn: {selectedCount} / {previewItems.length} files
                            </span>
                        </div>
                        {importStats.success > 0 && (
                            <div className="flex items-center gap-4 text-xs font-bold">
                                <span className="text-purple-600">📁 {importStats.folders} thư mục</span>
                                <span className="text-emerald-600">✓ {importStats.success} sách</span>
                                {importStats.failed > 0 && <span className="text-red-500">✗ {importStats.failed} thất bại</span>}
                            </div>
                        )}
                    </div>

                    <div className="border border-slate-100 rounded-xl overflow-hidden mb-6 max-h-[500px] overflow-y-auto">
                        {Object.entries(groupedByFolder).map(([folderPath, items]: [string, ImportPreviewItem[]]) => (
                            <div key={folderPath} className="border-b border-slate-100 last:border-b-0">
                                {/* Folder Header */}
                                <div className="bg-slate-50 px-4 py-2 flex items-center gap-2 sticky top-0">
                                    <FolderOpen className="w-4 h-4 text-blue-500" />
                                    <span className="text-xs font-bold text-slate-600">{folderPath}</span>
                                    <span className="text-[10px] text-slate-400 ml-auto">({items.length} files)</span>
                                </div>
                                {/* Files in folder */}
                                <table className="w-full">
                                    <tbody className="divide-y divide-slate-50">
                                        {items.map((item) => {
                                            const globalIndex = previewItems.findIndex(p => p.file.id === item.file.id);
                                            return (
                                                <tr key={item.file.id} className={`${item.status === 'success' ? 'bg-emerald-50/50' : item.status === 'error' ? 'bg-red-50/50' : ''}`}>
                                                    <td className="px-4 py-2 w-10">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.selected}
                                                            onChange={() => handleToggleItem(globalIndex)}
                                                            disabled={item.status !== 'pending'}
                                                            className="w-4 h-4 accent-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <input
                                                            type="text"
                                                            value={item.title}
                                                            onChange={(e) => handleUpdateItem(globalIndex, { title: e.target.value })}
                                                            disabled={item.status !== 'pending'}
                                                            className="w-full bg-transparent border-0 text-sm font-medium text-slate-700 focus:outline-none focus:bg-slate-50 px-2 py-1 rounded"
                                                        />
                                                        {item.error && <p className="text-[10px] text-red-500 mt-1 px-2">{item.error}</p>}
                                                    </td>
                                                    <td className="px-4 py-2 w-28">
                                                        <select
                                                            value={item.grade}
                                                            onChange={(e) => handleUpdateItem(globalIndex, { grade: e.target.value })}
                                                            disabled={item.status !== 'pending'}
                                                            className="w-full bg-transparent border border-slate-100 text-xs font-medium text-slate-600 rounded-lg px-2 py-1 focus:outline-none"
                                                        >
                                                            <option value="Tất cả">Tất cả</option>
                                                            <option value="Khối 6">Khối 6</option>
                                                            <option value="Khối 7">Khối 7</option>
                                                            <option value="Khối 8">Khối 8</option>
                                                            <option value="Khối 9">Khối 9</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-2 text-center w-16">
                                                        {item.status === 'pending' && <span className="text-slate-400 text-xs">•</span>}
                                                        {item.status === 'importing' && <Loader2 className="w-4 h-4 text-blue-500 animate-spin mx-auto" />}
                                                        {item.status === 'success' && <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />}
                                                        {item.status === 'error' && <XCircle className="w-4 h-4 text-red-500 mx-auto" />}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleImport}
                        disabled={isImporting || selectedCount === 0}
                        className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                    >
                        {isImporting ? (
                            <div className="w-full">
                                {/* Progress Bar */}
                                <div className="w-full bg-emerald-200 rounded-full h-2 mb-3">
                                    <div
                                        className="bg-white h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${importProgress.total > 0 ? (importProgress.current / importProgress.total) * 100 : 0}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Đang import... {importProgress.current}/{importProgress.total} ({importProgress.total > 0 ? Math.round((importProgress.current / importProgress.total) * 100) : 0}%)</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <CloudDownload className="w-5 h-5" /> Import {selectedCount} sách (tự động tạo thư mục)
                            </>
                        )}
                    </button>
                </>
            )}

            {/* Empty State */}
            {!isScanning && previewItems.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                    <FolderTree className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-sm font-medium">Nhập link folder Google Drive để quét</p>
                    <p className="text-xs mt-2">Tool sẽ scan tất cả subfolders và tự động tạo cấu trúc thư mục</p>
                </div>
            )}
        </div>
    );
};

export default DriveImportTool;

/**
 * Google Drive API Service
 * Sử dụng API key hoặc Service Account để liệt kê files từ Drive folder
 */

// Google Drive API endpoint
const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

// Cấu hình API Key - Bạn cần thay thế bằng API key thực
// Lấy từ: https://console.cloud.google.com/apis/credentials
// @ts-ignore - Vite env
const DRIVE_API_KEY = (import.meta as any).env?.VITE_GOOGLE_DRIVE_API_KEY || '';

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    size?: string;
    thumbnailLink?: string;
    webViewLink?: string;
    parents?: string[];
    createdTime?: string;
    modifiedTime?: string;
}

export interface DriveFolder {
    id: string;
    name: string;
    files: DriveFile[];
    subfolders: DriveFolder[];
}

/**
 * Lấy danh sách files từ một folder Google Drive
 * Yêu cầu folder được chia sẻ công khai hoặc có API key
 */
export async function listDriveFiles(folderId: string): Promise<DriveFile[]> {
    if (!DRIVE_API_KEY) {
        throw new Error('VITE_GOOGLE_DRIVE_API_KEY chưa được cấu hình trong .env');
    }

    const query = `'${folderId}' in parents and trashed=false`;
    const fields = 'files(id,name,mimeType,size,thumbnailLink,webViewLink,parents,createdTime,modifiedTime)';

    const url = `${DRIVE_API_BASE}/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&key=${DRIVE_API_KEY}&pageSize=1000`;

    const response = await fetch(url);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Không thể lấy danh sách files từ Google Drive');
    }

    const data = await response.json();
    return data.files || [];
}

export interface FolderScanResult {
    folder: DriveFile;
    pdfs: DriveFile[];
    subfolders: FolderScanResult[];
}

/**
 * Scan folder và tất cả subfolders, trả về cấu trúc cây
 */
export async function scanFolderRecursive(folderId: string, folderName: string = 'Root', depth = 0, maxDepth = 3): Promise<FolderScanResult> {
    const files = await listDriveFiles(folderId);

    const pdfs = files.filter(f => f.mimeType === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    const folders = files.filter(f => f.mimeType === 'application/vnd.google-apps.folder');

    const result: FolderScanResult = {
        folder: { id: folderId, name: folderName, mimeType: 'application/vnd.google-apps.folder' },
        pdfs,
        subfolders: []
    };

    // Đệ quy vào subfolders nếu chưa quá sâu
    if (depth < maxDepth) {
        for (const subfolder of folders) {
            const subResult = await scanFolderRecursive(subfolder.id, subfolder.name, depth + 1, maxDepth);
            result.subfolders.push(subResult);
        }
    }

    return result;
}

/**
 * Flatten scan result thành danh sách PDFs với thông tin folder
 */
export function flattenScanResult(result: FolderScanResult, parentPath: string = ''): Array<{ file: DriveFile; folderPath: string; folderId: string; folderName: string }> {
    const currentPath = parentPath ? `${parentPath} > ${result.folder.name}` : result.folder.name;

    const items: Array<{ file: DriveFile; folderPath: string; folderId: string; folderName: string }> = [];

    // Add PDFs from current folder
    for (const pdf of result.pdfs) {
        items.push({
            file: pdf,
            folderPath: currentPath,
            folderId: result.folder.id,
            folderName: result.folder.name
        });
    }

    // Recursively add from subfolders
    for (const subfolder of result.subfolders) {
        items.push(...flattenScanResult(subfolder, currentPath));
    }

    return items;
}

/**
 * Lấy danh sách tất cả files PDF từ folder (bao gồm subfolder)
 */
export async function listAllPDFsRecursive(folderId: string, depth = 0, maxDepth = 3): Promise<DriveFile[]> {
    if (depth > maxDepth) return [];

    const files = await listDriveFiles(folderId);
    const pdfs: DriveFile[] = [];
    const folders: DriveFile[] = [];

    for (const file of files) {
        if (file.mimeType === 'application/pdf') {
            pdfs.push(file);
        } else if (file.mimeType === 'application/vnd.google-apps.folder') {
            folders.push(file);
        }
    }

    // Đệ quy vào subfolders
    for (const folder of folders) {
        const subPdfs = await listAllPDFsRecursive(folder.id, depth + 1, maxDepth);
        pdfs.push(...subPdfs);
    }

    return pdfs;
}

/**
 * Lấy thông tin folder
 */
export async function getFolderInfo(folderId: string): Promise<DriveFile | null> {
    if (!DRIVE_API_KEY) {
        throw new Error('VITE_GOOGLE_DRIVE_API_KEY chưa được cấu hình trong .env');
    }

    const url = `${DRIVE_API_BASE}/files/${folderId}?fields=id,name,mimeType&key=${DRIVE_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
        return null;
    }

    return response.json();
}

/**
 * Trích xuất Folder ID từ URL Google Drive
 */
export function extractFolderIdFromUrl(url: string): string | null {
    // Pattern: https://drive.google.com/drive/folders/{folderId}
    const match = url.match(/folders\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
}

/**
 * Trích xuất tên sách từ tên file
 * VD: "SGK Toán 7 - Tập 1.pdf" -> "SGK Toán 7 - Tập 1"
 */
export function extractBookTitleFromFilename(filename: string): string {
    // Bỏ phần mở rộng .pdf
    return filename.replace(/\.pdf$/i, '').trim();
}

/**
 * Đoán cấp lớp từ tên file
 */
export function guessGradeFromFilename(filename: string): string {
    const lowerName = filename.toLowerCase();

    if (lowerName.includes('lớp 6') || lowerName.includes('khối 6') || lowerName.includes(' 6 ')) return 'Khối 6';
    if (lowerName.includes('lớp 7') || lowerName.includes('khối 7') || lowerName.includes(' 7 ')) return 'Khối 7';
    if (lowerName.includes('lớp 8') || lowerName.includes('khối 8') || lowerName.includes(' 8 ')) return 'Khối 8';
    if (lowerName.includes('lớp 9') || lowerName.includes('khối 9') || lowerName.includes(' 9 ')) return 'Khối 9';

    return 'Tất cả';
}

/**
 * Kiểm tra API key có hợp lệ không
 */
export async function validateApiKey(): Promise<boolean> {
    try {
        // Test với một folder public của Google
        await getFolderInfo('root');
        return true;
    } catch {
        return false;
    }
}

/**
 * Kiểm tra xem đã cấu hình API key chưa
 */
export function hasApiKey(): boolean {
    return !!DRIVE_API_KEY;
}

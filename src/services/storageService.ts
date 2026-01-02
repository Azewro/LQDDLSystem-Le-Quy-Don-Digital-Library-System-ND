import { supabase } from '@/lib/supabase';

export type BucketName = 'avatars' | 'articles';

/**
 * Upload file to Supabase Storage bucket
 * @param bucket - Bucket name ('avatars' | 'articles')
 * @param file - File to upload
 * @param customPath - Optional custom path/filename
 * @returns Public URL of uploaded file or null if error
 */
export const uploadFile = async (
    bucket: BucketName,
    file: File,
    customPath?: string
): Promise<string | null> => {
    try {
        // Generate unique filename with timestamp
        const ext = file.name.split('.').pop();
        const fileName = customPath || `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

        const { error } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) {
            console.error('Upload error:', error);
            return null;
        }

        // Get public URL
        const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
        return data.publicUrl;
    } catch (err) {
        console.error('Upload exception:', err);
        return null;
    }
};

/**
 * Upload multiple files to a bucket
 * @param bucket - Bucket name
 * @param files - Array of files to upload
 * @returns Array of public URLs (null entries for failed uploads)
 */
export const uploadMultipleFiles = async (
    bucket: BucketName,
    files: File[]
): Promise<(string | null)[]> => {
    const uploadPromises = files.map(file => uploadFile(bucket, file));
    return Promise.all(uploadPromises);
};

/**
 * Delete file from Supabase Storage
 * @param bucket - Bucket name
 * @param path - File path to delete
 * @returns true if successful, false otherwise
 */
export const deleteFile = async (
    bucket: BucketName,
    path: string
): Promise<boolean> => {
    try {
        // Extract filename from URL if full URL is provided
        const fileName = path.includes('http')
            ? path.split('/').pop() || path
            : path;

        const { error } = await supabase.storage.from(bucket).remove([fileName]);
        if (error) {
            console.error('Delete error:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Delete exception:', err);
        return false;
    }
};

/**
 * Get public URL for a file in storage
 * @param bucket - Bucket name
 * @param path - File path
 * @returns Public URL
 */
export const getPublicUrl = (bucket: BucketName, path: string): string => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
};

/**
 * List files in a bucket
 * @param bucket - Bucket name
 * @param folder - Folder path (optional)
 * @returns List of file objects with names and public URLs
 */
export const listFiles = async (
    bucket: BucketName,
    folder: string = ''
): Promise<{ name: string; url: string; created_at: string }[]> => {
    try {
        const { data, error } = await supabase.storage
            .from(bucket)
            .list(folder, {
                limit: 100,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' },
            });

        if (error) {
            console.error('List error:', error);
            return [];
        }

        return data.map(file => ({
            name: file.name,
            url: getPublicUrl(bucket, folder ? `${folder}/${file.name}` : file.name),
            created_at: file.created_at
        }));
    } catch (err) {
        console.error('List exception:', err);
        return [];
    }
};

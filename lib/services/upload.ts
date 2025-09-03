/**
 * File upload service for homework assignments
 * Integrates with Skool storage API
 */

export interface UploadedFile {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  path: string;
  tenantId: string;
  entityType: 'assignment' | 'question' | 'submission';
  entityId: string;
  userId: string;
  uploadedAt: string;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

/**
 * Uploads a single file to the Skool storage API
 */
export async function uploadFile(
  file: File,
  entityType: 'assignment' | 'question' | 'submission',
  entityId: string,
  description?: string,
  accessToken?: string,
  onProgress?: (progress: number) => void
): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('entityType', entityType);
  formData.append('entityId', entityId);
  
  if (description) {
    formData.append('description', description);
  }

  const headers: HeadersInit = {};
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  console.log('Uploading file:', file.name, 'with token:', accessToken ? 'present' : 'missing');
  console.log('Headers:', headers);

  try {
    // Use local API route to proxy the request and avoid CORS issues
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers,
      body: formData,
    });

    console.log('Upload response status:', response.status);
    console.log('Upload response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} ${response.statusText}. ${errorText}`);
    }

    const result: UploadedFile = await response.json();
    return result;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
}

/**
 * Uploads multiple files with progress tracking
 */
export async function uploadMultipleFiles(
  files: File[],
  entityType: 'assignment' | 'question' | 'submission',
  entityId: string,
  description?: string,
  accessToken?: string,
  onProgress?: (fileName: string, progress: number) => void,
  onFileComplete?: (fileName: string, result: UploadedFile) => void,
  onFileError?: (fileName: string, error: string) => void
): Promise<UploadedFile[]> {
  const results: UploadedFile[] = [];
  const uploadPromises = files.map(async (file) => {
    try {
      const result = await uploadFile(
        file,
        entityType,
        entityId,
        description ? `${description} - ${file.name}` : undefined,
        accessToken,
        (progress) => onProgress?.(file.name, progress)
      );
      
      onFileComplete?.(file.name, result);
      results.push(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onFileError?.(file.name, errorMessage);
      throw error;
    }
  });

  // Wait for all uploads to complete
  await Promise.all(uploadPromises);
  return results;
}

/**
 * Generates a unique entity ID for assignments
 */
export function generateEntityId(): string {
  return `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validates file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size (50MB limit)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File "${file.name}" is too large. Maximum size is 50MB.`
    };
  }

  // Check file type (basic validation)
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv',
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
    'audio/mp3', 'audio/wav', 'audio/ogg'
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not supported for "${file.name}".`
    };
  }

  return { valid: true };
}

/**
 * Gets file type icon based on mime type
 */
export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎥';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('word')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️';
  if (mimeType.startsWith('text/')) return '📄';
  return '📎';
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

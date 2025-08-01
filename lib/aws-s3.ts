import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  HeadObjectCommand, 
  DeleteObjectCommand 
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configure AWS SDK v3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || '';

/**
 * Map common MIME types to file extensions
 */
export function getFileExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: { [key: string]: string } = {
    // Images
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/bmp': 'bmp',
    'image/tiff': 'tiff',
    'image/svg+xml': 'svg',
    // Videos
    'video/mp4': 'mp4',
    'video/mpeg': 'mpeg',
    'video/quicktime': 'mov',
    'video/x-msvideo': 'avi',
    'video/webm': 'webm',
    'video/3gpp': '3gp',
    'video/x-flv': 'flv',
    // Audio
    'audio/mpeg': 'mp3',
    'audio/mp4': 'm4a',
    'audio/wav': 'wav',
    'audio/webm': 'webm',
    'audio/ogg': 'ogg',
    'audio/aac': 'aac',
    'audio/flac': 'flac',
    'audio/amr': 'amr',
    'audio/opus': 'opus',
    // Documents
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'text/plain': 'txt',
    'text/csv': 'csv',
    'application/zip': 'zip',
    'application/x-rar-compressed': 'rar',
    'application/x-7z-compressed': '7z',
    'application/json': 'json',
    'application/xml': 'xml',
    'text/html': 'html',
    'text/css': 'css',
    'text/javascript': 'js',
    'application/javascript': 'js',
    'application/rtf': 'rtf',
    'application/vnd.oasis.opendocument.text': 'odt',
    'application/vnd.oasis.opendocument.spreadsheet': 'ods',
    'application/vnd.oasis.opendocument.presentation': 'odp',
  };
  return mimeToExt[mimeType.toLowerCase()] || 'bin';
}

/**
 * Check if file type is supported by WhatsApp Cloud API
 */
export function isWhatsAppSupportedFileType(mimeType: string): boolean {
  const supportedTypes = [
    // Audio
    'audio/aac',
    'audio/mp4', 
    'audio/mpeg',
    'audio/amr',
    'audio/ogg',
    'audio/opus',
    // Documents
    'application/vnd.ms-powerpoint',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/pdf',
    'text/plain',
    'application/vnd.ms-excel',
    // Images
    'image/jpeg',
    'image/png',
    'image/webp',
    // Videos
    'video/mp4',
    'video/3gpp',
  ];
  
  return supportedTypes.includes(mimeType.toLowerCase());
}

/**
 * Download a file from URL and upload to S3
 */
export async function downloadAndUploadToS3(
  fileUrl: string,
  senderId: string,
  mediaId: string,
  mimeType: string
): Promise<string | null> {
  try {
    console.log(`Downloading file from URL: ${fileUrl}`);
    
    // Download the file
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Generate S3 key
    const fileExtension = getFileExtensionFromMimeType(mimeType);
    const s3Key = `${senderId}/${mediaId}.${fileExtension}`;

    console.log(`Uploading to S3: ${s3Key} (${buffer.length} bytes)`);

    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: mimeType,
      ACL: 'private',
      Metadata: {
        'sender-id': senderId,
        'media-id': mediaId,
        'upload-timestamp': new Date().toISOString(),
      },
    });

    await s3Client.send(uploadCommand);
    console.log('S3 upload successful');

    // Generate presigned URL
    const presignedUrl = await generatePresignedUrl(senderId, mediaId, mimeType);
    return presignedUrl;

  } catch (error) {
    console.error('Error in downloadAndUploadToS3:', error);
    return null;
  }
}

/**
 * Upload a File object directly to S3
 */
export async function uploadFileToS3(
  file: File,
  senderId: string,
  mediaId: string
): Promise<string | null> {
  try {
    const fileExtension = getFileExtensionFromMimeType(file.type);
    const s3Key = `${senderId}/${mediaId}.${fileExtension}`;

    console.log(`Uploading file to S3: ${s3Key} (${file.size} bytes)`);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type,
      ACL: 'private',
      Metadata: {
        'original-filename': file.name,
        'upload-timestamp': new Date().toISOString(),
      },
    });

    await s3Client.send(uploadCommand);
    console.log('S3 file upload successful');

    const presignedUrl = await generatePresignedUrl(senderId, mediaId, file.type);
    return presignedUrl;

  } catch (error) {
    console.error('Error in uploadFileToS3:', error);
    return null;
  }
}

/**
 * Generate a presigned URL for accessing S3 object
 */
export async function generatePresignedUrl(
  senderId: string,
  mediaId: string,
  mimeType: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const fileExtension = getFileExtensionFromMimeType(mimeType);
    const s3Key = `${senderId}/${mediaId}.${fileExtension}`;

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    console.log(`Generated presigned URL for ${s3Key} (expires in ${expiresIn}s)`);
    
    return presignedUrl;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return null;
  }
}

/**
 * Check if file exists in S3
 */
export async function checkS3FileExists(
  senderId: string,
  mediaId: string,
  mimeType: string
): Promise<boolean> {
  try {
    const fileExtension = getFileExtensionFromMimeType(mimeType);
    const s3Key = `${senderId}/${mediaId}.${fileExtension}`;

    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    await s3Client.send(command);
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete file from S3
 */
export async function deleteFromS3(
  senderId: string,
  mediaId: string,
  mimeType: string
): Promise<boolean> {
  try {
    const fileExtension = getFileExtensionFromMimeType(mimeType);
    const s3Key = `${senderId}/${mediaId}.${fileExtension}`;

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    await s3Client.send(command);
    console.log(`Deleted S3 object: ${s3Key}`);
    return true;
  } catch (error) {
    console.error('Error deleting from S3:', error);
    return false;
  }
} 
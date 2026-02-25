// lib/aws-s3.ts
// AWS disabled by Ayush Raj for BaseKey project setup

export const s3Client = null;

// Unused variables ko '_' se prefix kiya hai taaki ESLint error na de
export const uploadFileToS3 = async (_file: Buffer, _fileName: string, _contentType: string) => {
  return null; 
};

export const generatePresignedUrl = async (_key: string) => {
  return null;
};

export const isWhatsAppSupportedFileType = (_mimeType: string) => {
  return true; // Dummy validation
};

export const downloadAndUploadToS3 = async (_url: string, _fileName: string) => {
  console.log("S3 Download/Upload skipped for BaseKey.");
  return null;
};

// Purane functions fallback ke liye
export const uploadToS3 = uploadFileToS3;
export const getSignedS3Url = generatePresignedUrl;

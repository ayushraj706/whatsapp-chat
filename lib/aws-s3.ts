// lib/aws-s3.ts
// AWS hata diya gaya hai taaki build error na aaye

export const s3Client = null;

export const uploadToS3 = async (file: Buffer, fileName: string, contentType: string) => {
  console.log("AWS S3 is disabled. Media upload skipped for:", fileName);
  return null; 
};

export const getSignedS3Url = async (key: string) => {
  return null;
};

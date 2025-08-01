# WhatsApp File Type Validation & RLS Policy Fixes

## 🔧 **Issues Fixed**

### **1. WhatsApp File Type Validation**
- **Problem**: Users could upload unsupported file types (like .md files) that WhatsApp Cloud API rejects
- **Error**: `Param file must be a file with one of the following types: audio/aac, audio/mp4...`
- **Solution**: Added client-side and server-side validation for WhatsApp-supported file types

### **2. AWS SDK v2 Deprecation Warning**
- **Problem**: Using deprecated AWS SDK v2 causing maintenance mode warnings
- **Solution**: Migrated to AWS SDK v3 with modern imports and commands

### **3. Supabase RLS Policy Violation**
- **Problem**: `new row violates row-level security policy (USING expression) for table "users"`
- **Solution**: Updated user creation/update logic and improved error handling

## ✅ **Implementation Details**

### **WhatsApp Supported File Types**

The following file types are supported by WhatsApp Cloud API:

#### **Audio Formats**
- `audio/aac` - AAC Audio
- `audio/mp4` - MP4 Audio  
- `audio/mpeg` - MP3 Audio
- `audio/amr` - AMR Audio
- `audio/ogg` - OGG Audio
- `audio/opus` - OPUS Audio

#### **Document Formats**
- `application/pdf` - PDF Documents
- `application/msword` - Word Documents (.doc)
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` - Word Documents (.docx)
- `application/vnd.ms-excel` - Excel Spreadsheets (.xls)
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` - Excel Spreadsheets (.xlsx)
- `application/vnd.ms-powerpoint` - PowerPoint Presentations (.ppt)
- `application/vnd.openxmlformats-officedocument.presentationml.presentation` - PowerPoint Presentations (.pptx)
- `text/plain` - Plain Text Files

#### **Image Formats**
- `image/jpeg` - JPEG Images
- `image/png` - PNG Images
- `image/webp` - WebP Images

#### **Video Formats**
- `video/mp4` - MP4 Videos
- `video/3gpp` - 3GP Videos

### **Code Changes**

#### **1. AWS SDK v3 Migration** (`lib/aws-s3.ts`)
```typescript
// OLD: AWS SDK v2
import AWS from 'aws-sdk';
const s3 = new AWS.S3();

// NEW: AWS SDK v3
import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  HeadObjectCommand, 
  DeleteObjectCommand 
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});
```

#### **2. File Type Validation Function** (`lib/aws-s3.ts`)
```typescript
export function isWhatsAppSupportedFileType(mimeType: string): boolean {
  const supportedTypes = [
    // Audio
    'audio/aac', 'audio/mp4', 'audio/mpeg', 'audio/amr', 'audio/ogg', 'audio/opus',
    // Documents
    'application/vnd.ms-powerpoint', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/pdf', 'text/plain', 'application/vnd.ms-excel',
    // Images
    'image/jpeg', 'image/png', 'image/webp',
    // Videos
    'video/mp4', 'video/3gpp',
  ];
  
  return supportedTypes.includes(mimeType.toLowerCase());
}
```

#### **3. Server-Side Validation** (`app/api/send-media/route.ts`)
```typescript
// Validate file types before processing
const unsupportedFiles = files.filter(file => !isWhatsAppSupportedFileType(file.type));
if (unsupportedFiles.length > 0) {
  console.error('Unsupported file types detected:', unsupportedFiles.map(f => ({ name: f.name, type: f.type })));
  return new NextResponse(
    JSON.stringify({ 
      error: 'Unsupported file types', 
      message: `WhatsApp does not support the following file types: ${unsupportedFiles.map(f => f.type).join(', ')}`,
      unsupportedFiles: unsupportedFiles.map(f => ({ name: f.name, type: f.type }))
    }), 
    { status: 400, headers: { 'Content-Type': 'application/json' } }
  );
}
```

#### **4. Client-Side Validation** (`components/chat/media-upload.tsx`)
```typescript
const processFiles = async (fileList: FileList | File[]) => {
  const filesArray = Array.from(fileList);
  const validFiles: MediaFile[] = [];
  const errors: string[] = [];

  for (const file of filesArray) {
    // Check file size (25MB limit)
    if (file.size > 25 * 1024 * 1024) {
      errors.push(`${file.name}: File size exceeds 25MB limit`);
      continue;
    }

    // Check if file type is supported by WhatsApp
    if (!isWhatsAppSupportedFileType(file.type)) {
      errors.push(`${file.name}: File type '${file.type}' is not supported by WhatsApp. Supported types include: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG, WEBP, MP4, 3GP, AAC, MP3, MPEG, AMR, OGG, OPUS`);
      continue;
    }

    validFiles.push(mediaFile);
  }

  if (errors.length > 0) {
    alert('Some files could not be added:\n\n' + errors.join('\n\n'));
  }

  if (validFiles.length > 0) {
    setMediaFiles(prev => [...prev, ...validFiles]);
  }
};
```

#### **5. RLS Policy Fix** (`app/api/send-media/route.ts`)
```typescript
// Update last_active for the sender - Fix RLS policy issue
const { error: userUpdateError } = await supabase
  .from('users')
  .upsert([{
    id: user.id,
    name: user.user_metadata?.full_name || user.email || 'Unknown User',
    last_active: timestamp
  }], {
    onConflict: 'id',
    ignoreDuplicates: false
  });

if (userUpdateError) {
  console.error('Error updating user last_active:', userUpdateError);
  // Don't fail the request for this non-critical update
}
```

## 🔄 **User Experience Improvements**

### **Before Fix**
- Users could upload unsupported files
- Files would fail during WhatsApp API call
- Poor error messages
- AWS SDK deprecation warnings
- RLS policy violations causing failures

### **After Fix**
- **Client-Side Validation**: Immediate feedback for unsupported files
- **Server-Side Validation**: Double-check before API calls
- **Clear Error Messages**: Detailed information about what went wrong
- **Modern AWS SDK**: No more deprecation warnings
- **Improved Error Handling**: Non-critical failures don't break the flow

## 📋 **Error Handling**

### **File Type Validation Errors**
```json
{
  "error": "Unsupported file types",
  "message": "WhatsApp does not support the following file types: application/octet-stream",
  "unsupportedFiles": [
    {
      "name": "document.md",
      "type": "application/octet-stream"
    }
  ]
}
```

### **File Size Validation**
- **Limit**: 25MB per file (WhatsApp's limit)
- **Error**: Clear message showing which files exceed the limit
- **Behavior**: Valid files are still processed, invalid ones are skipped

### **RLS Policy Handling**
- **Non-Critical Failures**: User updates don't break the main flow
- **Logging**: Detailed error logging for debugging
- **Graceful Degradation**: Media sending continues even if user update fails

## 🛠️ **Dependencies Updated**

### **New Dependencies**
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### **Removed Dependencies**
- `aws-sdk` (v2) - Can be removed after testing

## ✅ **Testing Checklist**

### **File Type Validation**
- [ ] **Supported Files**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG, WEBP, MP4, 3GP, AAC, MP3, MPEG, AMR, OGG, OPUS
- [ ] **Unsupported Files**: .md, .zip, .rar, custom formats should be rejected
- [ ] **Error Messages**: Clear feedback for unsupported files
- [ ] **Mixed Uploads**: Valid files processed, invalid files rejected

### **File Size Validation**
- [ ] **Under 25MB**: Files should upload successfully
- [ ] **Over 25MB**: Files should be rejected with clear message
- [ ] **Mixed Sizes**: Valid sizes processed, oversized rejected

### **AWS SDK v3**
- [ ] **No Warnings**: No more AWS SDK v2 deprecation warnings
- [ ] **S3 Operations**: Upload, download, delete operations work correctly
- [ ] **Presigned URLs**: Generated correctly and accessible

### **RLS Policy**
- [ ] **User Updates**: Don't cause media upload failures
- [ ] **Error Logging**: Proper logging for debugging
- [ ] **Graceful Handling**: Non-critical failures handled gracefully

## 🚀 **Performance Benefits**

### **AWS SDK v3**
- **Smaller Bundle Size**: Tree-shakable imports
- **Better Performance**: Modern async/await patterns
- **Future-Proof**: Active development and support

### **Early Validation**
- **Reduced API Calls**: Invalid files caught before WhatsApp API
- **Better UX**: Immediate feedback to users
- **Resource Savings**: No unnecessary S3 uploads for invalid files

## 📝 **Summary**

The fixes provide:

1. **✅ File Type Validation**: Both client and server-side validation for WhatsApp-supported formats
2. **✅ Modern AWS SDK**: Migration to v3 eliminates deprecation warnings
3. **✅ Better Error Handling**: Clear messages and graceful degradation
4. **✅ Improved UX**: Immediate feedback and detailed error information
5. **✅ RLS Policy Fixes**: Non-critical failures don't break the main flow

Users can now confidently upload media knowing they'll get immediate feedback about compatibility, and the system handles errors gracefully without breaking the chat experience! 🎉 
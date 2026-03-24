import { FilePurpose } from '@prisma/client';

export function normalizeUploadedFilename(filename: string): string {
  const trimmed = filename.trim() || 'upload';
  const sanitized = trimmed
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^\.+/, '')
    .slice(0, 120);

  return sanitized || 'upload';
}

export function buildFileObjectKey(params: {
  purpose: FilePurpose;
  studentId: number;
  fileId: string;
  filename: string;
}): string {
  const safeFilename = normalizeUploadedFilename(params.filename);
  const studentRoot = `students/${params.studentId}`;

  if (params.purpose === FilePurpose.PROFILE_IMAGE) {
    return `${studentRoot}/profile-images/${params.fileId}/${safeFilename}`;
  }

  return `${studentRoot}/result-slips/${params.fileId}/${safeFilename}`;
}

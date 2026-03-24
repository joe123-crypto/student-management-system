import assert from 'node:assert/strict';
import test from 'node:test';
import { FilePurpose } from '@prisma/client';
import { buildFileObjectKey, normalizeUploadedFilename } from '@/lib/files/object-key';

test('profile image keys use the student-centric layout', () => {
  const objectKey = buildFileObjectKey({
    purpose: FilePurpose.PROFILE_IMAGE,
    studentId: 42,
    fileId: 'file-123',
    filename: 'passport photo.png',
  });

  assert.equal(objectKey, 'students/42/profile-images/file-123/passport-photo.png');
});

test('result slip keys use the student-centric layout', () => {
  const objectKey = buildFileObjectKey({
    purpose: FilePurpose.RESULT_SLIP,
    studentId: 42,
    fileId: 'file-123',
    filename: 'semester result.pdf',
  });

  assert.equal(objectKey, 'students/42/result-slips/file-123/semester-result.pdf');
});

test('object keys follow students/studentId/object-type/objectId/object order', () => {
  const objectKey = buildFileObjectKey({
    purpose: FilePurpose.PROFILE_IMAGE,
    studentId: 1,
    fileId: '12313323',
    filename: 'profile.png',
  });

  assert.deepEqual(objectKey.split('/'), ['students', '1', 'profile-images', '12313323', 'profile.png']);
});

test('filename normalization strips unsafe characters and falls back when empty', () => {
  assert.equal(normalizeUploadedFilename(' ..My% unsafe   file!!.pdf '), 'My-unsafe-file-.pdf');
  assert.equal(normalizeUploadedFilename('...'), 'upload');
});

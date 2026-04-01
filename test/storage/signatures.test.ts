import assert from 'node:assert/strict';
import test from 'node:test';
import { sniffMimeTypeFromFileSignature } from '@/lib/files/signatures';

test('detects PDF files from magic bytes', () => {
  const bytes = Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);
  assert.equal(sniffMimeTypeFromFileSignature(bytes), 'application/pdf');
});

test('detects PNG files from magic bytes', () => {
  const bytes = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.equal(sniffMimeTypeFromFileSignature(bytes), 'image/png');
});

test('detects JPEG files from magic bytes', () => {
  const bytes = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  assert.equal(sniffMimeTypeFromFileSignature(bytes), 'image/jpeg');
});

test('detects WEBP files from magic bytes', () => {
  const bytes = Uint8Array.from([
    0x52, 0x49, 0x46, 0x46,
    0x24, 0x00, 0x00, 0x00,
    0x57, 0x45, 0x42, 0x50,
  ]);
  assert.equal(sniffMimeTypeFromFileSignature(bytes), 'image/webp');
});

test('returns null for unsupported signatures', () => {
  const bytes = Uint8Array.from([0x3c, 0x68, 0x74, 0x6d, 0x6c, 0x3e]);
  assert.equal(sniffMimeTypeFromFileSignature(bytes), null);
});

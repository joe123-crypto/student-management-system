import { FilePurpose } from '@prisma/client';

export type FilePolicy = {
  allowedMimeTypes: string[];
  maxSizeBytes: number;
};

const MB = 1024 * 1024;

export const FILE_POLICIES: Record<FilePurpose, FilePolicy> = {
  [FilePurpose.PROFILE_IMAGE]: {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeBytes: 5 * MB,
  },
  [FilePurpose.RESULT_SLIP]: {
    allowedMimeTypes: ['application/pdf'],
    maxSizeBytes: 15 * MB,
  },
  [FilePurpose.ATTACHE_ATTACHMENT]: {
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSizeBytes: 20 * MB,
  },
  [FilePurpose.AGENT_CONTEXT]: {
    allowedMimeTypes: ['application/pdf', 'text/plain', 'text/markdown', 'application/json'],
    maxSizeBytes: 25 * MB,
  },
};

export function assertPurposeSupportedForPhaseOne(purpose: FilePurpose): void {
  if (purpose !== FilePurpose.PROFILE_IMAGE && purpose !== FilePurpose.RESULT_SLIP) {
    throw new Error(`Purpose ${purpose} is not enabled in Phase 1.`);
  }
}

export function validateFileInput(input: {
  purpose: FilePurpose;
  mimeType: string;
  sizeBytes: number;
}): void {
  const policy = FILE_POLICIES[input.purpose];
  if (!policy) {
    throw new Error('Unsupported file purpose.');
  }

  const mimeType = input.mimeType.trim().toLowerCase();
  if (!policy.allowedMimeTypes.includes(mimeType)) {
    throw new Error(`Files of type ${mimeType} are not allowed for ${input.purpose}.`);
  }

  if (!Number.isFinite(input.sizeBytes) || input.sizeBytes <= 0) {
    throw new Error('File size must be greater than zero.');
  }

  if (input.sizeBytes > policy.maxSizeBytes) {
    throw new Error(`File exceeds the size limit for ${input.purpose}.`);
  }
}

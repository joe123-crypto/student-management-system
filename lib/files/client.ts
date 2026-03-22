export type ManagedFilePurpose = 'PROFILE_IMAGE' | 'RESULT_SLIP';

export type UploadedManagedFile = {
  id: string;
  purpose: ManagedFilePurpose;
  contentUrl: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
};

async function readUploadError(response: Response): Promise<string> {
  const payload = (await response.json().catch(() => null)) as { error?: string } | null;
  return payload?.error || `File upload failed (${response.status}).`;
}

export async function uploadManagedFile(params: {
  purpose: ManagedFilePurpose;
  studentProfileId: string;
  file: File;
}): Promise<UploadedManagedFile> {
  const intentResponse = await fetch('/api/files/upload-intents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      purpose: params.purpose,
      studentProfileId: params.studentProfileId,
      filename: params.file.name,
      mimeType: params.file.type,
      sizeBytes: params.file.size,
    }),
  });

  const intentPayload = (await intentResponse.json()) as {
    file?: { id: string };
    upload?: {
      method: 'PUT' | 'POST';
      url: string;
      headers?: Record<string, string>;
      fields?: Record<string, string>;
    };
    error?: string;
  };

  if (!intentResponse.ok || !intentPayload.file || !intentPayload.upload) {
    throw new Error(intentPayload.error || `Failed to create upload intent (${intentResponse.status}).`);
  }

  if (intentPayload.upload.method === 'POST') {
    const formData = new FormData();
    for (const [key, value] of Object.entries(intentPayload.upload.fields || {})) {
      formData.append(key, value);
    }
    formData.append('file', params.file);

    const uploadResponse = await fetch(intentPayload.upload.url, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error(await readUploadError(uploadResponse));
    }
  } else {
    const uploadResponse = await fetch(intentPayload.upload.url, {
      method: 'PUT',
      headers: intentPayload.upload.headers,
      body: params.file,
    });

    if (!uploadResponse.ok) {
      throw new Error(await readUploadError(uploadResponse));
    }
  }

  const completeResponse = await fetch(`/api/files/${intentPayload.file.id}/complete`, {
    method: 'POST',
  });

  const completePayload = (await completeResponse.json()) as {
    file?: UploadedManagedFile;
    error?: string;
  };

  if (!completeResponse.ok || !completePayload.file) {
    throw new Error(completePayload.error || `Failed to finalize upload (${completeResponse.status}).`);
  }

  return completePayload.file;
}

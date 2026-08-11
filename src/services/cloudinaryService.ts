import { callFunction } from '@/lib/apiClient';

export interface UploadResult {
  url: string;
  publicId: string;
}

interface SignedUpload {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
}

/**
 * Uploads a single image to Cloudinary, reporting 0–100 progress, and
 * resolves with its secure URL and public_id (both are persisted to
 * Firestore by the caller — the public_id is what lets us delete it later).
 * The Cloudinary API secret never reaches the browser: the upload is signed
 * by the `cloudinary-sign` Netlify Function, which also checks the caller
 * is allowed to write to the requested folder before signing anything.
 */
export function uploadImage(folder: string, file: File, onProgress?: (percent: number) => void): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    callFunction<SignedUpload>('cloudinary-sign', { action: 'upload', folder })
      .then((signed) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', signed.apiKey);
        formData.append('timestamp', String(signed.timestamp));
        formData.append('signature', signed.signature);
        formData.append('folder', signed.folder);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText) as { secure_url: string; public_id: string };
            resolve({ url: response.secure_url, publicId: response.public_id });
          } else {
            reject(new Error('Image upload failed. Please try again.'));
          }
        };
        xhr.onerror = () => reject(new Error('Image upload failed. Please try again.'));
        xhr.send(formData);
      })
      .catch(reject);
  });
}

/** Deletes an image from Cloudinary by public_id — always server-side, never trust the client with the API secret. */
export async function deleteImage(publicId: string): Promise<void> {
  await callFunction('cloudinary-sign', { action: 'destroy', publicId });
}

/** Builds the Cloudinary folder an upload for this scope/id belongs in, e.g. "voyago/hotels/abc123". */
export function buildImageFolder(scope: string, id: string): string {
  return `voyago/${scope}/${id}`;
}

import type { Context } from '@netlify/functions';
import { requireAuth, isAdmin } from '../lib/requestAuth';
import { getCloudinary, assertCanManage } from '../lib/cloudinary';
import { jsonResponse, preflightResponse, withErrorHandling, HttpError } from '../lib/httpError';

interface SignUploadRequest {
  action: 'upload';
  folder: string;
}
interface DestroyRequest {
  action: 'destroy';
  publicId: string;
}
type CloudinarySignRequest = SignUploadRequest | DestroyRequest;

export default async (req: Request, _context: Context): Promise<Response> => {
  if (req.method === 'OPTIONS') return preflightResponse();
  if (req.method !== 'POST') return jsonResponse({ code: 'invalid-argument', message: 'Method not allowed.' }, 405);

  return withErrorHandling(async () => {
    const { uid } = await requireAuth(req);
    const admin = await isAdmin(uid);

    let body: CloudinarySignRequest;
    try {
      body = (await req.json()) as CloudinarySignRequest;
    } catch {
      throw new HttpError('invalid-argument', 'Request body must be valid JSON.');
    }

    const cloudinary = getCloudinary();

    if (body.action === 'upload') {
      if (!body.folder) throw new HttpError('invalid-argument', 'Missing folder.');
      assertCanManage(body.folder, { uid, isAdmin: admin });

      const timestamp = Math.round(Date.now() / 1000);
      const paramsToSign = { folder: body.folder, timestamp };
      const signature = cloudinary.utils.api_sign_request(paramsToSign, cloudinary.config().api_secret!);

      return jsonResponse({
        cloudName: cloudinary.config().cloud_name,
        apiKey: cloudinary.config().api_key,
        timestamp,
        signature,
        folder: body.folder,
      });
    }

    if (body.action === 'destroy') {
      if (!body.publicId) throw new HttpError('invalid-argument', 'Missing publicId.');
      assertCanManage(body.publicId, { uid, isAdmin: admin });

      const result = await cloudinary.uploader.destroy(body.publicId);
      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new HttpError('internal', 'Could not delete the image. Please try again.');
      }
      return jsonResponse({ success: true });
    }

    throw new HttpError('invalid-argument', 'Unknown action.');
  });
};

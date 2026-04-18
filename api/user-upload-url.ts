/**
 * POST /api/user-upload-url
 * Generates a presigned R2 PUT URL for authenticated (non-admin) users.
 * Restricted to vakil-kyc/{uid}/ prefix only.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { setCorsHeaders, verifyBearerToken, isRateLimited, getClientIp } from './_lib/security';

const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = (req.headers.origin as string) || '';
  setCorsHeaders(res, origin, 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const ip = getClientIp(req);
  if (isRateLimited(`user-upload:${ip}`, { windowMs: 60_000, maxRequests: 10 }))
    return res.status(429).json({ error: 'Too many requests. Please wait.' });

  let uid: string;
  try {
    uid = await verifyBearerToken(req);
  } catch (err: any) {
    return res.status(err.status || 401).json({ error: err.message });
  }

  const { fileType, fileSize } = req.body || {};

  if (typeof fileType !== 'string' || !ALLOWED_EXTENSIONS.includes(fileType.toLowerCase()))
    return res.status(400).json({ error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` });

  if (typeof fileSize === 'number' && fileSize > MAX_SIZE)
    return res.status(400).json({ error: 'File too large. Maximum 5 MB.' });

  const ext = fileType.toLowerCase();
  const mime = ext === 'pdf' ? 'application/pdf'
    : ext === 'png' ? 'image/png'
    : ext === 'webp' ? 'image/webp'
    : 'image/jpeg';

  const r2 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT || '',
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
    forcePathStyle: true,
  });

  const enrollmentKey = `vakil-kyc/${uid}/enrollment.${ext}`;
  const photoKey = `vakil-kyc/${uid}/photo.${ext}`;

  const [enrollmentUrl, photoUrl] = await Promise.all([
    getSignedUrl(r2, new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'edulaw-pdfs',
      Key: enrollmentKey,
      ContentType: mime,
    }), { expiresIn: 300 }),
    getSignedUrl(r2, new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'edulaw-pdfs',
      Key: photoKey,
      ContentType: 'image/jpeg',
    }), { expiresIn: 300 }),
  ]);

  return res.status(200).json({ enrollmentUrl, enrollmentKey, photoUrl, photoKey });
}

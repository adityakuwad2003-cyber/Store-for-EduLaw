import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Cloudflare R2 Keys (Provided by User)
const R2_ACCESS_KEY_ID = "e6d87e573e6dd103c2f5d6895a4c081c";
const R2_SECRET_ACCESS_KEY = "3906661f8cbdc707ed75bc5ce1a28f9fc7ef9b6e810435c60abbcbfdab75bd67";
const R2_ENDPOINT = "https://abf28f7b992fdbad5974bb9baf26f441.r2.cloudflarestorage.com";
const BUCKET_NAME = "edulaw-pdfs";

// Initialize the S3 Client for Cloudflare R2
export const r2Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  // R2 requires this to correctly map bucket names to URLs
  forcePathStyle: true, 
});

/**
 * Generates an expiring secure link (Presigned URL) so a user can download 
 * the PDF only AFTER they have purchased it. The link expires in 15 minutes.
 */
export async function getSecureDownloadUrl(fileName: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName, // The name of the file precisely as it is stored in R2 (e.g., 'cpc-notes.pdf')
  });

  // Generate a URL that expires in 15 minutes (900 seconds)
  const secureUrl = await getSignedUrl(r2Client, command, { expiresIn: 900 });
  return secureUrl;
}

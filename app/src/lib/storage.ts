/**
 * Securely requests a 15-minute expiring download link from the Vercel Backend.
 * Sends the Firebase ID token for server-side verification — never trusts the client.
 */
export async function getSecureDownloadUrl(fileName: string, productId: string, token: string): Promise<string> {
  try {
    const response = await fetch('/api/get-download-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Verified server-side via Firebase Admin SDK
      },
      body: JSON.stringify({ fileName, productId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch secure link');
    }

    const data = await response.json();
    return data.url;

  } catch (error) {
    console.error("Storage Error:", error);
    throw new Error("Could not securely locate the document.");
  }
}


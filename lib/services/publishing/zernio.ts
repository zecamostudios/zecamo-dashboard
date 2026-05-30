/**
 * Zernio API client — unified social media publishing.
 * Base URL: https://zernio.com/api/v1
 * Auth:     Authorization: Bearer $ZERNIO_API_KEY
 */

const ZERNIO_BASE = "https://zernio.com/api/v1";

// Fixed account IDs from connected Zernio profile "Default"
export const ZERNIO_ACCOUNTS = {
  instagram: "6a1602962b2567671a440ef9",
  linkedin:  "6a18c49d2b2567671a5ed358",
} as const;

export interface ZernioMediaItem {
  type: "image" | "video";
  url: string;
}

export interface ZernioPlatformTarget {
  platform: string;
  accountId: string;
  platformSpecificData?: {
    carouselItems?: ZernioMediaItem[];
  };
}

export interface ZernioPostPayload {
  content: string;
  platforms: ZernioPlatformTarget[];
  mediaItems?: ZernioMediaItem[];
  publishNow?: boolean;
  scheduledFor?: string;
}

export interface ZernioPostResult {
  post: {
    _id: string;
    content: string;
    status: string;
  };
}

function getApiKey(): string {
  const key = process.env.ZERNIO_API_KEY;
  if (!key) throw new Error("ZERNIO_API_KEY not set");
  return key;
}

export async function zernioPublish(payload: ZernioPostPayload): Promise<{
  success: boolean;
  externalId?: string;
  url?: string;
  errorMsg?: string;
}> {
  const res = await fetch(`${ZERNIO_BASE}/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json() as Record<string, unknown>;

  if (!res.ok) {
    const msg = (data.message as string) ?? (data.error as string) ?? `Zernio error ${res.status}`;
    return { success: false, errorMsg: msg };
  }

  const post = data.post as ZernioPostResult["post"] | undefined;
  return {
    success: true,
    externalId: post?._id,
  };
}

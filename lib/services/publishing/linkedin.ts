import type { ContentPost, PlatformAccount } from "@/lib/types";
import type { PublishingAdapter, PublishResult } from "./base";
import { zernioPublish, ZERNIO_ACCOUNTS } from "./zernio";

export class LinkedInAdapter implements PublishingAdapter {
  readonly platform = "linkedin";
  readonly isMock = false;

  async publish(post: ContentPost, _account: PlatformAccount): Promise<PublishResult> {
    const mediaItems = post.media_urls?.map((url) => ({ type: "image" as const, url }));

    return zernioPublish({
      content: buildLinkedInContent(post),
      platforms: [{ platform: "linkedin", accountId: ZERNIO_ACCOUNTS.linkedin }],
      ...(mediaItems?.length ? { mediaItems } : {}),
      publishNow: true,
    });
  }

  validate(post: ContentPost): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!post.contenido?.trim()) errors.push("Contenido vacío");
    if ((post.contenido?.length ?? 0) > 3000) errors.push("Supera el límite de 3000 caracteres");
    return { valid: errors.length === 0, errors };
  }
}

function buildLinkedInContent(post: ContentPost): string {
  const parts: string[] = [];
  if (post.hook)     parts.push(post.hook);
  if (post.contenido) parts.push(post.contenido);
  if (post.cta)      parts.push(`\n${post.cta}`);
  if (post.hashtags?.length) {
    parts.push(`\n${post.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")}`);
  }
  return parts.join("\n\n");
}

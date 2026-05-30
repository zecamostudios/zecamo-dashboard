import type { ContentPost, PlatformAccount } from "@/lib/types";
import type { PublishingAdapter, PublishResult } from "./base";
import { zernioPublish, ZERNIO_ACCOUNTS } from "./zernio";
import type { ZernioMediaItem } from "./zernio";

export class InstagramAdapter implements PublishingAdapter {
  readonly platform = "instagram";
  readonly isMock = false;

  async publish(post: ContentPost, _account: PlatformAccount): Promise<PublishResult> {
    const mediaItems: ZernioMediaItem[] = (post.media_urls ?? []).map((url) => ({
      type: "image",
      url,
    }));

    const isCarousel = mediaItems.length > 1;

    return zernioPublish({
      content: buildInstagramCaption(post),
      mediaItems: mediaItems.length ? mediaItems : undefined,
      platforms: [
        {
          platform: "instagram",
          accountId: ZERNIO_ACCOUNTS.instagram,
          ...(isCarousel
            ? { platformSpecificData: { carouselItems: mediaItems } }
            : {}),
        },
      ],
      publishNow: true,
    });
  }

  validate(post: ContentPost): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!post.contenido?.trim()) errors.push("Contenido vacío");
    if ((post.contenido?.length ?? 0) > 2200) errors.push("Supera el límite de 2200 caracteres");
    if (!post.media_urls?.length) errors.push("Instagram requiere al menos una imagen");
    return { valid: errors.length === 0, errors };
  }
}

function buildInstagramCaption(post: ContentPost): string {
  const parts: string[] = [];
  if (post.hook)      parts.push(post.hook);
  if (post.contenido) parts.push(post.contenido);
  if (post.cta)       parts.push(post.cta);
  if (post.hashtags?.length) {
    parts.push(post.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" "));
  }
  return parts.join("\n\n");
}

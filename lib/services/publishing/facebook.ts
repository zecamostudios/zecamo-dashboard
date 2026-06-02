import type { ContentPost, PlatformAccount } from "@/lib/types";
import type { PublishingAdapter, PublishResult } from "./base";

const N8N_WEBHOOK = "https://zecamon8n.zecamostudios.com/webhook/publish-dispatcher";

export class FacebookAdapter implements PublishingAdapter {
  readonly platform = "facebook";
  readonly isMock = false;

  async publish(post: ContentPost, _account: PlatformAccount): Promise<PublishResult> {
    const content = [post.hook, post.contenido, post.cta]
      .filter(Boolean)
      .join("\n\n");

    const body = {
      platform: "facebook",
      post_id: post.id,
      content,
      media_urls: post.media_urls ?? [],
      hashtags: post.hashtags ?? [],
    };

    let res: Response;
    try {
      res = await fetch(N8N_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (err) {
      return {
        success: false,
        errorMsg: `n8n webhook unreachable: ${err instanceof Error ? err.message : "Error"}`,
      };
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { success: false, errorMsg: `n8n error ${res.status}: ${text.slice(0, 200)}` };
    }

    const data = await res.json().catch(() => ({})) as Record<string, unknown>;

    if (data.success === false) {
      return { success: false, errorMsg: (data.errorMsg as string) ?? "Facebook publish failed" };
    }

    return {
      success:    true,
      externalId: data.externalId as string | undefined,
      url:        data.publishUrl as string | undefined,
    };
  }

  validate(post: ContentPost): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!post.contenido?.trim()) errors.push("Contenido vacío");
    if ((post.contenido?.length ?? 0) > 63_206) errors.push("Supera el límite de Facebook");
    return { valid: errors.length === 0, errors };
  }
}

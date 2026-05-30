import type { ContentPost, PlatformAccount } from "@/lib/types";
import type { PublishingAdapter, PublishResult } from "./base";
import { MockPublishingAdapter } from "./mock";

export class InstagramAdapter implements PublishingAdapter {
  readonly platform = "instagram";
  readonly isMock = true;
  private mock: MockPublishingAdapter;

  constructor() {
    this.mock = new MockPublishingAdapter("instagram");
  }

  async publish(post: ContentPost, account: PlatformAccount): Promise<PublishResult> {
    if (this.isMock || account.is_mock) return this.mock.publish(post, account);
    throw new Error("Instagram API not configured");
  }

  validate(post: ContentPost): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!post.contenido?.trim()) errors.push("Contenido vacío");
    if ((post.contenido?.length ?? 0) > 2200) errors.push("Supera el límite de 2200 caracteres");
    return { valid: errors.length === 0, errors };
  }
}

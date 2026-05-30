import type { ContentPost, PlatformAccount } from "@/lib/types";
import type { PublishingAdapter, PublishResult } from "./base";
import { MockPublishingAdapter } from "./mock";

export class LinkedInAdapter implements PublishingAdapter {
  readonly platform = "linkedin";
  readonly isMock: boolean;
  private mock: MockPublishingAdapter;

  constructor() {
    this.isMock = true; // real API integration pending
    this.mock = new MockPublishingAdapter("linkedin");
  }

  async publish(post: ContentPost, account: PlatformAccount): Promise<PublishResult> {
    if (this.isMock || account.is_mock) return this.mock.publish(post, account);
    // Real LinkedIn API integration goes here
    throw new Error("LinkedIn API not configured");
  }

  validate(post: ContentPost): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!post.contenido?.trim()) errors.push("Contenido vacío");
    if ((post.contenido?.length ?? 0) > 3000) errors.push("Supera el límite de 3000 caracteres");
    return { valid: errors.length === 0, errors };
  }
}

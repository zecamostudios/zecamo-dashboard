import type { ContentPost, PlatformAccount } from "@/lib/types";
import type { PublishingAdapter, PublishResult } from "./base";

function simulateDelay(): Promise<void> {
  return new Promise((r) => setTimeout(r, 800 + Math.random() * 600));
}

export class MockPublishingAdapter implements PublishingAdapter {
  readonly platform: string;
  readonly isMock = true;

  constructor(platform: string) {
    this.platform = platform;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async publish(post: ContentPost, _account: PlatformAccount): Promise<PublishResult> {
    await simulateDelay();

    // 5% simulated failure rate for realistic testing
    if (Math.random() < 0.05) {
      return {
        success:  false,
        errorMsg: `[Mock] Rate limit exceeded on ${this.platform}`,
      };
    }

    const mockId = `mock_${this.platform}_${Date.now()}_${post.id.slice(0, 8)}`;
    return {
      success:    true,
      externalId: mockId,
      url:        `https://${this.platform}.com/p/${mockId}`,
    };
  }

  validate(post: ContentPost): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!post.contenido?.trim()) errors.push("Contenido vacío");
    if (this.platform === "twitter" && (post.contenido?.length ?? 0) > 280) {
      errors.push("Supera el límite de 280 caracteres para Twitter");
    }
    return { valid: errors.length === 0, errors };
  }
}

import type { ContentPost, PlatformAccount } from "@/lib/types";

export interface PublishResult {
  success: boolean;
  externalId?: string;
  errorMsg?: string;
  url?: string;
}

export interface PublishingAdapter {
  readonly platform: string;
  readonly isMock: boolean;
  publish(post: ContentPost, account: PlatformAccount): Promise<PublishResult>;
  validate(post: ContentPost): { valid: boolean; errors: string[] };
}

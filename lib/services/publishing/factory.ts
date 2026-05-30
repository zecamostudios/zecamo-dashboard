import type { ContentPlatform } from "@/lib/types";
import type { PublishingAdapter } from "./base";
import { LinkedInAdapter }  from "./linkedin";
import { TwitterAdapter }   from "./twitter";
import { InstagramAdapter } from "./instagram";
import { FacebookAdapter }  from "./facebook";

export function getPublishingAdapter(platform: ContentPlatform): PublishingAdapter {
  switch (platform) {
    case "linkedin":  return new LinkedInAdapter();
    case "twitter":   return new TwitterAdapter();
    case "instagram": return new InstagramAdapter();
    case "facebook":  return new FacebookAdapter();
    default:
      throw new Error(`No publishing adapter for platform: ${platform}`);
  }
}

export function getAllAdapters(): PublishingAdapter[] {
  return (["linkedin", "twitter", "instagram", "facebook"] as ContentPlatform[]).map(
    getPublishingAdapter,
  );
}

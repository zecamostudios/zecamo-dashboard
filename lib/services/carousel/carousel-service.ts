import { createClient } from "@/lib/supabase/server";
import { generateCarouselPlan } from "./content-generator";
import type { ContentPost } from "@/lib/types";
import type { CarouselSlide } from "./content-generator";

const BUCKET = "content-media";

function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

async function renderSlide(
  slide: CarouselSlide,
  index: number,
  total: number,
  brand: string,
): Promise<Buffer> {
  const base = getSiteUrl();
  const params = new URLSearchParams({
    type:  slide.type,
    text:  slide.text,
    title: slide.title ?? "",
    slide: String(index + 1),
    total: String(total),
    brand,
  });

  const res = await fetch(`${base}/api/content/carousel/slide?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Slide render failed: ${res.status} ${await res.text()}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

async function uploadSlide(
  supabase: Awaited<ReturnType<typeof createClient>>,
  buffer: Buffer,
  postId: string,
  index: number,
): Promise<string> {
  const path = `carousel/${postId}/slide_${index + 1}_${Date.now()}.png`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: "image/png",
    upsert: true,
  });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export interface CarouselResult {
  slides: { url: string; type: string; text: string }[];
  caption: string;
  mediaUrls: string[];
}

export async function generateCarousel(post: ContentPost): Promise<CarouselResult> {
  const supabase = await createClient();

  // 1. Generate slide content via GPT
  const plan = await generateCarouselPlan(post);
  const { slides, caption } = plan;

  // 2. Render + upload each slide in parallel
  const brand = "Zecamo";

  const slideBuffers = await Promise.all(
    slides.map((slide, i) => renderSlide(slide, i, slides.length, brand)),
  );

  const urls = await Promise.all(
    slideBuffers.map((buf, i) => uploadSlide(supabase, buf, post.id, i)),
  );

  // 3. Update post media_urls and caption
  await supabase
    .from("content_posts")
    .update({
      media_urls: urls,
      tipo: "carousel",
      // Update contenido with the caption if the post doesn't have one yet
      updated_at: new Date().toISOString(),
    })
    .eq("id", post.id);

  return {
    slides: slides.map((s, i) => ({ url: urls[i], type: s.type, text: s.text })),
    caption,
    mediaUrls: urls,
  };
}

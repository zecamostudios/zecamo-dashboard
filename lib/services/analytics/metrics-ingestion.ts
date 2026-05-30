/**
 * MetricsIngestion — fetches platform metrics for a published post and
 * upserts them into analytics_snapshots. Handles all 4 platforms.
 */
import type { ContentPlatform } from "@/lib/types";
import { LinkedInMetricsFetcher }  from "./platform-fetchers/linkedin";
import { TwitterMetricsFetcher }   from "./platform-fetchers/twitter";
import { InstagramMetricsFetcher } from "./platform-fetchers/instagram";
import { FacebookMetricsFetcher }  from "./platform-fetchers/facebook";
import type { MetricsFetcher }     from "./platform-fetchers/base";
import { createClient }            from "@/lib/supabase/server";

const FETCHERS: Record<ContentPlatform, MetricsFetcher> = {
  linkedin:  new LinkedInMetricsFetcher(),
  twitter:   new TwitterMetricsFetcher(),
  instagram: new InstagramMetricsFetcher(),
  facebook:  new FacebookMetricsFetcher(),
};

export async function ingestPlatformMetrics(
  postId: string,
  platform: ContentPlatform,
) {
  const supabase = await createClient();

  // Load post to get external_id
  const { data: post } = await supabase
    .from("content_posts")
    .select("id, external_id, plataforma")
    .eq("id", postId)
    .single();

  if (!post) throw new Error(`Post ${postId} not found`);

  const fetcher = FETCHERS[platform];
  if (!fetcher) throw new Error(`No fetcher for platform: ${platform}`);

  const metrics = await fetcher.fetchMetrics(post.external_id ?? postId);
  metrics.post_id = postId;

  const { data, error } = await supabase
    .from("analytics_snapshots")
    .insert({
      post_id:            postId,
      plataforma:         platform,
      external_post_id:   metrics.external_post_id,
      fecha_snapshot:     new Date().toISOString(),
      impresiones:        metrics.impresiones,
      alcance:            metrics.alcance,
      engagement:         metrics.engagement,
      clicks:             metrics.clicks,
      likes:              metrics.likes,
      comentarios:        metrics.comentarios,
      compartidos:        metrics.compartidos,
      guardados:          metrics.guardados,
      seguidores_ganados: metrics.seguidores_ganados,
      engagement_rate:    metrics.engagement_rate,
      metadata: {
        is_mock:   metrics.isMock,
        fetcher:   fetcher.platform,
        ingested_at: new Date().toISOString(),
      },
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to insert analytics snapshot: ${error.message}`);
  return data;
}

export async function ingestAllPublishedPosts(platform?: ContentPlatform) {
  const supabase = await createClient();

  let query = supabase
    .from("content_posts")
    .select("id, plataforma")
    .eq("estado", "publicado");

  if (platform) query = query.eq("plataforma", platform);

  const { data: posts } = await query;
  if (!posts?.length) return { ingested: 0 };

  const results = await Promise.allSettled(
    posts.map((p) =>
      ingestPlatformMetrics(p.id, p.plataforma as ContentPlatform),
    ),
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  return { ingested: succeeded, total: posts.length };
}

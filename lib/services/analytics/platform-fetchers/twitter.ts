import type { MetricsFetcher, PlatformMetrics } from "./base";

function mockMetrics(externalPostId: string): PlatformMetrics {
  const seed = externalPostId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const impresiones = 300  + (seed % 1200);
  const alcance     = Math.floor(impresiones * 0.65);
  const likes       = 8   + (seed % 40);
  const retweets    = 2   + (seed % 15);
  const respuestas  = 1   + (seed % 8);
  const clicks      = 5   + (seed % 30);
  const engagement  = likes + retweets + respuestas + clicks;
  const rate        = alcance > 0 ? Number(((engagement / alcance) * 100).toFixed(2)) : 0;

  return {
    post_id:           "",
    plataforma:        "twitter",
    external_post_id:  externalPostId,
    impresiones,
    alcance,
    engagement,
    clicks,
    likes,
    comentarios:       respuestas,
    compartidos:       retweets,
    guardados:         1 + (seed % 5),
    seguidores_ganados:0 + (seed % 3),
    engagement_rate:   rate,
    isMock:            true,
  };
}

export class TwitterMetricsFetcher implements MetricsFetcher {
  readonly platform = "twitter";
  readonly isMock   = true;

  async fetchMetrics(externalPostId: string): Promise<PlatformMetrics> {
    // Real implementation: Twitter API v2 /tweets/:id?tweet.fields=public_metrics
    // Requires: TWITTER_BEARER_TOKEN env var
    return mockMetrics(externalPostId);
  }
}

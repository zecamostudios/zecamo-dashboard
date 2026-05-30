import type { MetricsFetcher, PlatformMetrics } from "./base";

function mockMetrics(externalPostId: string): PlatformMetrics {
  const seed = externalPostId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const impresiones = 400  + (seed % 1600);
  const alcance     = Math.floor(impresiones * 0.60);
  const likes       = 15  + (seed % 60);
  const comentarios = 3   + (seed % 12);
  const compartidos = 5   + (seed % 20);
  const clicks      = 12  + (seed % 50);
  const engagement  = likes + comentarios + compartidos + clicks;
  const rate        = alcance > 0 ? Number(((engagement / alcance) * 100).toFixed(2)) : 0;

  return {
    post_id:           "",
    plataforma:        "facebook",
    external_post_id:  externalPostId,
    impresiones,
    alcance,
    engagement,
    clicks,
    likes,
    comentarios,
    compartidos,
    guardados:         1 + (seed % 6),
    seguidores_ganados:0 + (seed % 4),
    engagement_rate:   rate,
    isMock:            true,
  };
}

export class FacebookMetricsFetcher implements MetricsFetcher {
  readonly platform = "facebook";
  readonly isMock   = true;

  async fetchMetrics(externalPostId: string): Promise<PlatformMetrics> {
    // Real implementation: Facebook Graph API /post_id/insights
    // Requires: FACEBOOK_ACCESS_TOKEN + page_id
    return mockMetrics(externalPostId);
  }
}

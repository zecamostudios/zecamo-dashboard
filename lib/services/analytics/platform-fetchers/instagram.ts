import type { MetricsFetcher, PlatformMetrics } from "./base";

function mockMetrics(externalPostId: string): PlatformMetrics {
  const seed = externalPostId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const impresiones = 500  + (seed % 2000);
  const alcance     = Math.floor(impresiones * 0.72);
  const likes       = 30  + (seed % 120);
  const comentarios = 4   + (seed % 20);
  const guardados   = 8   + (seed % 30);
  const clicks      = 10  + (seed % 40);
  const engagement  = likes + comentarios + guardados + clicks;
  const rate        = alcance > 0 ? Number(((engagement / alcance) * 100).toFixed(2)) : 0;

  return {
    post_id:           "",
    plataforma:        "instagram",
    external_post_id:  externalPostId,
    impresiones,
    alcance,
    engagement,
    clicks,
    likes,
    comentarios,
    compartidos:       0,
    guardados,
    seguidores_ganados:2 + (seed % 8),
    engagement_rate:   rate,
    isMock:            true,
  };
}

export class InstagramMetricsFetcher implements MetricsFetcher {
  readonly platform = "instagram";
  readonly isMock   = true;

  async fetchMetrics(externalPostId: string): Promise<PlatformMetrics> {
    // Real implementation: Instagram Graph API /media/:id/insights
    // Requires: INSTAGRAM_ACCESS_TOKEN + business account
    return mockMetrics(externalPostId);
  }
}

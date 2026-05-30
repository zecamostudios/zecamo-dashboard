import type { MetricsFetcher, PlatformMetrics } from "./base";

function mockMetrics(externalPostId: string): PlatformMetrics {
  const seed = externalPostId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const impresiones = 800  + (seed % 3200);
  const alcance     = Math.floor(impresiones * 0.78);
  const likes       = 20  + (seed % 80);
  const comentarios = 3   + (seed % 12);
  const compartidos = 2   + (seed % 8);
  const clicks      = 15  + (seed % 60);
  const engagement  = likes + comentarios + compartidos + clicks;
  const rate        = alcance > 0 ? Number(((engagement / alcance) * 100).toFixed(2)) : 0;

  return {
    post_id:           "",
    plataforma:        "linkedin",
    external_post_id:  externalPostId,
    impresiones,
    alcance,
    engagement,
    clicks,
    likes,
    comentarios,
    compartidos,
    guardados:         2 + (seed % 10),
    seguidores_ganados:1 + (seed % 5),
    engagement_rate:   rate,
    isMock:            true,
  };
}

export class LinkedInMetricsFetcher implements MetricsFetcher {
  readonly platform = "linkedin";
  readonly isMock   = true;

  async fetchMetrics(externalPostId: string): Promise<PlatformMetrics> {
    // Real implementation: LinkedIn Marketing API v2 /socialActions endpoint
    // Requires: LINKEDIN_ACCESS_TOKEN env var
    if (process.env.LINKEDIN_ACCESS_TOKEN) {
      // TODO: implement real LinkedIn metrics fetch
      // const res = await fetch(`https://api.linkedin.com/v2/socialMetrics/${externalPostId}`, {
      //   headers: { Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}` }
      // });
    }
    return mockMetrics(externalPostId);
  }
}

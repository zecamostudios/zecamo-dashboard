import type { MetricsFetcher, PlatformMetrics } from "./base";

export class FacebookMetricsFetcher implements MetricsFetcher {
  readonly platform = "facebook";
  readonly isMock   = false;

  async fetchMetrics(externalPostId: string): Promise<PlatformMetrics> {
    const token  = process.env.FACEBOOK_ACCESS_TOKEN;
    const empty  = emptyMetrics(externalPostId);

    if (!token || !externalPostId || externalPostId.startsWith("mock_")) return empty;

    try {
      const fields = "impressions,reach,post_clicks,reactions.summary(total_count),comments.summary(total_count),shares";
      const res = await fetch(
        `https://graph.facebook.com/v18.0/${externalPostId}/insights?metric=${fields}&access_token=${token}`,
      );
      if (!res.ok) return empty;

      const data = await res.json() as { data?: Array<{ name: string; values?: Array<{ value: number }> }> };
      const metric = (name: string) =>
        (data.data ?? []).find((d) => d.name === name)?.values?.[0]?.value ?? 0;

      const impresiones = metric("impressions");
      const alcance     = metric("reach");
      const clicks      = metric("post_clicks");
      const likes       = metric("reactions");
      const comentarios = metric("comments");
      const compartidos = metric("shares");
      const engagement  = likes + comentarios + compartidos + clicks;
      const rate        = alcance > 0 ? Number(((engagement / alcance) * 100).toFixed(2)) : 0;

      return {
        post_id: "", plataforma: "facebook", external_post_id: externalPostId,
        impresiones, alcance, engagement, clicks, likes, comentarios, compartidos,
        guardados: 0, seguidores_ganados: 0, engagement_rate: rate, isMock: false,
      };
    } catch {
      return empty;
    }
  }
}

function emptyMetrics(externalPostId: string): PlatformMetrics {
  return {
    post_id: "", plataforma: "facebook", external_post_id: externalPostId,
    impresiones: 0, alcance: 0, engagement: 0, clicks: 0, likes: 0,
    comentarios: 0, compartidos: 0, guardados: 0, seguidores_ganados: 0,
    engagement_rate: 0, isMock: false,
  };
}

import type { MetricsFetcher, PlatformMetrics } from "./base";

const ZERNIO_BASE  = "https://zernio.com/api/v1";
const IG_ACCOUNT_ID = "6a1602962b2567671a440ef9";

interface ZernioPost {
  _id?: string;
  externalId?: string;
  metrics?: {
    impressions?: number;
    reach?: number;
    likes?: number;
    comments?: number;
    saves?: number;
    clicks?: number;
    shares?: number;
    followersGained?: number;
    engagementRate?: number;
  };
}

export class InstagramMetricsFetcher implements MetricsFetcher {
  readonly platform = "instagram";
  readonly isMock   = false;

  async fetchMetrics(externalPostId: string): Promise<PlatformMetrics> {
    const key = process.env.ZERNIO_API_KEY;
    const empty = emptyMetrics(externalPostId);

    if (!key) return empty;

    try {
      const res = await fetch(`${ZERNIO_BASE}/analytics`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (!res.ok) return empty;

      const data = await res.json() as { posts?: ZernioPost[]; accounts?: Array<{ _id: string; followersCount?: number }> };

      // Find this post in analytics
      const post = (data.posts ?? []).find(
        (p) => p._id === externalPostId || p.externalId === externalPostId,
      );

      const m = post?.metrics ?? {};

      const likes        = m.likes       ?? 0;
      const comentarios  = m.comments    ?? 0;
      const guardados    = m.saves       ?? 0;
      const clicks       = m.clicks      ?? 0;
      const compartidos  = m.shares      ?? 0;
      const impresiones  = m.impressions ?? 0;
      const alcance      = m.reach       ?? 0;
      const engagement   = likes + comentarios + guardados + clicks + compartidos;
      const rate         = alcance > 0 ? Number(((engagement / alcance) * 100).toFixed(2)) : (m.engagementRate ?? 0);

      return {
        post_id:            "",
        plataforma:         "instagram",
        external_post_id:   externalPostId,
        impresiones,
        alcance,
        engagement,
        clicks,
        likes,
        comentarios,
        compartidos,
        guardados,
        seguidores_ganados: m.followersGained ?? 0,
        engagement_rate:    rate,
        isMock:             false,
      };
    } catch {
      return empty;
    }
  }
}

function emptyMetrics(externalPostId: string): PlatformMetrics {
  return {
    post_id: "", plataforma: "instagram", external_post_id: externalPostId,
    impresiones: 0, alcance: 0, engagement: 0, clicks: 0, likes: 0,
    comentarios: 0, compartidos: 0, guardados: 0, seguidores_ganados: 0,
    engagement_rate: 0, isMock: false,
  };
}

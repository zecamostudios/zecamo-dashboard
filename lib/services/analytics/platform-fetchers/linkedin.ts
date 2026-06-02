import type { MetricsFetcher, PlatformMetrics } from "./base";

const ZERNIO_BASE = "https://zernio.com/api/v1";

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

export class LinkedInMetricsFetcher implements MetricsFetcher {
  readonly platform = "linkedin";
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

      const data = await res.json() as { posts?: ZernioPost[] };

      const post = (data.posts ?? []).find(
        (p) => p._id === externalPostId || p.externalId === externalPostId,
      );

      const m = post?.metrics ?? {};

      const likes       = m.likes       ?? 0;
      const comentarios = m.comments    ?? 0;
      const compartidos = m.shares      ?? 0;
      const clicks      = m.clicks      ?? 0;
      const guardados   = m.saves       ?? 0;
      const impresiones = m.impressions ?? 0;
      const alcance     = m.reach       ?? 0;
      const engagement  = likes + comentarios + compartidos + clicks + guardados;
      const rate        = alcance > 0 ? Number(((engagement / alcance) * 100).toFixed(2)) : (m.engagementRate ?? 0);

      return {
        post_id:            "",
        plataforma:         "linkedin",
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
    post_id: "", plataforma: "linkedin", external_post_id: externalPostId,
    impresiones: 0, alcance: 0, engagement: 0, clicks: 0, likes: 0,
    comentarios: 0, compartidos: 0, guardados: 0, seguidores_ganados: 0,
    engagement_rate: 0, isMock: false,
  };
}

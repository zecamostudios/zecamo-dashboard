export interface PlatformMetrics {
  post_id:           string;
  plataforma:        string;
  external_post_id?: string;
  impresiones:       number;
  alcance:           number;
  engagement:        number;
  clicks:            number;
  likes:             number;
  comentarios:       number;
  compartidos:       number;
  guardados:         number;
  seguidores_ganados:number;
  engagement_rate:   number;
  isMock:            boolean;
}

export interface MetricsFetcher {
  readonly platform: string;
  readonly isMock:   boolean;
  fetchMetrics(externalPostId: string, accessToken?: string): Promise<PlatformMetrics>;
}

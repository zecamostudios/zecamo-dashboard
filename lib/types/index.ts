export type OwnerId = "JS" | "LM" | "BR";

export interface Owner {
  id: OwnerId;
  name: string;
  short: string;
  color: string;
}

export type ServiceLine = "AIMA" | "B2B" | "Webs" | "Diagnóstico";

export interface ServiceLineDef {
  id: ServiceLine;
  full: string;
  color: string;
}

export type StageId =
  | "lead"
  | "discovery"
  | "call1"
  | "propuesta"
  | "call2"
  | "venta"
  | "noresp"
  | "noventa"
  | "seguim";

export interface Stage {
  id: StageId;
  label: string;
}

export interface Prospect {
  id: number;
  dbId?: string;
  name: string;
  company: string;
  owner: OwnerId;
  line: ServiceLine;
  stage: StageId;
  value: number;
  date: string;
  last: string;
  source: string;
}

export type ClientStatus = "active" | "onboarding" | "paused";

export interface Client {
  id: number;
  dbId?: string;
  name: string;
  contact: string;
  line: ServiceLine;
  mrr: number;
  since: string;
  status: ClientStatus;
  projects: number;
  health: number;
  next: string;
}

export type ProjectStatus = "backlog" | "curso" | "review" | "entregado" | "archivado";
export type Priority = "alta" | "media" | "baja";

export interface Project {
  id: number;
  dbId?: string;
  name: string;
  client: string;
  line: ServiceLine;
  owner: OwnerId;
  start: string;
  due: string;
  progress: number;
  status: ProjectStatus;
  priority: Priority;
  team: OwnerId[];
}

export type TaskStatus = "hacer" | "curso" | "review" | "hecho";

export interface Task {
  id: number;
  dbId?: string;
  text: string;
  status: TaskStatus;
  done?: boolean;
  due: string;
  prio: Priority;
  proj: string;
  owner: OwnerId;
  tags?: string[];
}

export interface Meeting {
  id: number;
  day: string;
  time: string;
  title: string;
  who: string;
  owner: OwnerId;
  channel?: "video" | "phone";
}

export interface FinancePoint {
  m: string;
  in: number;
  out: number;
}

export type TransactionType = "in" | "out";

export interface Transaction {
  dbId?: string;
  d: string;
  c: string;
  line: ServiceLine | "Ops";
  a: number;
  type: TransactionType;
  owner: OwnerId;
}

export type OutboundStatus = "enviado" | "respondio" | "agendado" | "no_resp";
export type OutboundChannel = "Email" | "LinkedIn" | "Instagram";

export interface OutboundMessage {
  id: number;
  dbId?: string;
  to: string;
  company: string;
  owner: OwnerId;
  channel: OutboundChannel;
  status: OutboundStatus;
  sent: string;
  template: string;
}

export interface Template {
  id: number;
  name: string;
  uses: number;
  reply: number;
  line: ServiceLine;
  owner: OwnerId;
}

export interface ActivityItem {
  id: number;
  ico: string;
  who: OwnerId;
  text: string;
  when: string;
}

export interface ByLine {
  id: ServiceLine;
  v?: number;
  pct?: number;
}

// ============================================================
// Content OS types
// ============================================================

export type ContentPlatform = "linkedin" | "twitter" | "instagram" | "facebook";
export type ContentType = "post" | "thread" | "carousel" | "story";
export type ContentStatus =
  | "borrador"
  | "revision"
  | "aprobado"
  | "programado"
  | "publicado"
  | "rechazado";

export interface ContentPost {
  id: string;
  titulo: string;
  contenido?: string;
  plataforma: ContentPlatform;
  tipo: ContentType;
  estado: ContentStatus;
  ai_score?: number;
  ai_feedback?: string;
  hook?: string;
  cta?: string;
  hashtags?: string[];
  media_urls?: string[];
  programado_para?: string;
  publicado_en?: string;
  creado_por?: string;
  aprobado_por?: string;
  created_at: string;
  updated_at: string;
}

export type AssetType =
  | "hook"
  | "cta"
  | "template_carousel"
  | "logo"
  | "brand"
  | "inspiracion"
  | "framework";

export interface ContentAsset {
  id: string;
  nombre: string;
  tipo: AssetType;
  contenido?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  url?: string;
  uses: number;
  favorito: boolean;
  creado_por?: string;
  created_at: string;
}

export interface PlannerSlot {
  id: string;
  post_id: string;
  fecha: string;
  hora?: string;
  plataforma: ContentPlatform;
  estado: string;
  orden: number;
  post?: ContentPost;
}

export type AIGenerationType = "hook" | "post" | "thread" | "carousel" | "rewrite";

export interface AIGeneration {
  id: string;
  tipo: AIGenerationType;
  prompt: string;
  resultado?: string;
  plataforma?: ContentPlatform;
  modelo: string;
  tokens_in?: number;
  tokens_out?: number;
  post_id?: string;
  created_at: string;
}

export interface AutomationRun {
  id: string;
  nombre: string;
  tipo: "n8n" | "scheduled" | "manual";
  estado: "pending" | "running" | "success" | "error";
  payload?: Record<string, unknown>;
  resultado?: Record<string, unknown>;
  error_msg?: string;
  iniciado_en?: string;
  finalizado_en?: string;
  created_at: string;
}

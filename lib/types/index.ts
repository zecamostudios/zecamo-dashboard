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

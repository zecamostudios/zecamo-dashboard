import { createClient as _createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

async function createClient(): Promise<SupabaseClient> {
  return (await _createClient()) as unknown as SupabaseClient;
}

// ─── Section ─────────────────────────────────────────────────────────────────

export type ManualSection = {
  id: string;
  slug: string;
  number: string;
  title: string;
  subtitle: string | null;
  category: "operacion" | "negocio";
  position: number;
};

// ─── Raw block from DB ────────────────────────────────────────────────────────

export type RawBlock = {
  id: string;
  section_id: string;
  type: string;
  position: number;
  title: string | null;
  subtitle: string | null;
  content_md: string | null;
  content_jsonb: Record<string, unknown> | null;
  ref_id: string | null;
  variant: string | null;
};

// ─── Reference types ─────────────────────────────────────────────────────────

export type Principle = {
  id: string;
  code: string;
  title: string;
  description: string;
  position: number;
};

export type TeamMember = {
  id: string;
  name: string;
  initial: string;
  role: string;
  description: string | null;
  owns: string | null;
  not_owns: string | null;
  meetings: string | null;
  position: number;
};

export type ServiceLine = {
  line: string;
  title: string;
  subtitle: string;
  description: string;
  what_in: string[];
  what_out: string[];
  ideal_client: string[];
  reject_client: string[];
  typical_ticket: string;
  recommended_model: string;
  delivery_time: string;
  tag_label: string | null;
  position: number;
};

export type ScriptQuestion = {
  number: number;
  topic: string;
  question: string;
  red_flag?: string;
};

export type ScriptStep = {
  number: number;
  title: string;
  content: string;
};

export type Script = {
  id: string;
  type: "discovery" | "closing" | "objection";
  name: string;
  context: string | null;
  content_jsonb: {
    questions?: ScriptQuestion[];
    steps?: ScriptStep[];
    closing_line?: string;
    objection?: string;
    response?: string;
    principle?: string;
  };
};

export type PlaybookStep = {
  id: string;
  position: number;
  number: string;
  title: string;
  description: string;
  deadline_relative: string | null;
  is_recurring: boolean;
};

export type PlaybookWithSteps = {
  id: string;
  line: string;
  name: string;
  description: string | null;
  steps: PlaybookStep[];
};

export type PipelineStage = {
  id: string;
  name: string;
  slug: string;
  label_short: string | null;
  description: string;
  action: string | null;
  owner: string | null;
  sla: string | null;
  position: number;
  is_terminal: boolean;
  is_lost: boolean;
};

export type PricingFloor = {
  id: string;
  line: string;
  label: string;
  currency: string;
  amount_min: number | null;
  amount_max: number | null;
  amount_floor: number | null;
  unit: string | null;
  notes: string | null;
  position: number;
};

export type RoadmapMonth = {
  id: string;
  month_number: number;
  title: string;
  subtitle: string;
  goals: string[];
  closing_target: string;
  closing_mrr: string;
};

// ─── Resolved block union ─────────────────────────────────────────────────────

export type ResolvedBlock =
  | { id: string; type: "text"; position: number; title: string | null; body: string }
  | { id: string; type: "callout"; position: number; title: string | null; body: string; variant: string }
  | { id: string; type: "principle"; position: number; data: Principle }
  | { id: string; type: "team_member"; position: number; data: TeamMember }
  | { id: string; type: "service_line"; position: number; data: ServiceLine }
  | { id: string; type: "script"; position: number; data: Script }
  | { id: string; type: "objection"; position: number; data: Script }
  | { id: string; type: "playbook"; position: number; data: PlaybookWithSteps }
  | { id: string; type: "pipeline_stage"; position: number; data: PipelineStage }
  | { id: string; type: "pricing_floor"; position: number; data: PricingFloor }
  | { id: string; type: "roadmap_month"; position: number; data: RoadmapMonth };

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getAllSections(): Promise<ManualSection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("manual_sections")
    .select("id, slug, number, title, subtitle, category, position")
    .order("position");
  if (error) throw error;
  return (data ?? []) as ManualSection[];
}

export async function getSection(slug: string): Promise<ManualSection | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("manual_sections")
    .select("id, slug, number, title, subtitle, category, position")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data as ManualSection;
}

export async function getSectionBlocks(sectionId: string): Promise<ResolvedBlock[]> {
  const supabase = await createClient();

  const { data: rawBlocks, error } = await supabase
    .from("manual_blocks")
    .select("id, section_id, type, position, title, subtitle, content_md, content_jsonb, ref_id, variant")
    .eq("section_id", sectionId)
    .order("position");

  if (error || !rawBlocks) return [];

  const blocks = rawBlocks as RawBlock[];

  // Collect ref_ids grouped by type
  const uuidRefs = (type: string) =>
    blocks.filter((b) => b.type === type && b.ref_id).map((b) => b.ref_id!);

  // service_line uses enum PK, so extract from content_jsonb
  const serviceLineKeys = blocks
    .filter((b) => b.type === "service_line")
    .map((b) => b.content_jsonb?.line as string)
    .filter(Boolean);

  const [principles, teamMembers, serviceLines, scripts, playbooks, pipelineStages, pricingFloors, roadmapMonths] =
    await Promise.all([
      uuidRefs("principle").length
        ? supabase.from("principles").select("*").in("id", uuidRefs("principle")).then((r) => r.data ?? [])
        : Promise.resolve([]),
      uuidRefs("team_member").length
        ? supabase.from("team_members").select("*").in("id", uuidRefs("team_member")).then((r) => r.data ?? [])
        : Promise.resolve([]),
      serviceLineKeys.length
        ? supabase.from("service_lines_config").select("*").in("line", serviceLineKeys).then((r) => r.data ?? [])
        : Promise.resolve([]),
      [...uuidRefs("script"), ...uuidRefs("objection")].length
        ? supabase.from("scripts").select("*").in("id", [...uuidRefs("script"), ...uuidRefs("objection")]).then((r) => r.data ?? [])
        : Promise.resolve([]),
      uuidRefs("playbook").length
        ? supabase
            .from("playbooks")
            .select("*, playbook_steps(*)")
            .in("id", uuidRefs("playbook"))
            .then((r) =>
              (r.data ?? []).map((p: Record<string, unknown>) => ({
                ...p,
                steps: ((p.playbook_steps as PlaybookStep[]) ?? []).sort(
                  (a, b) => a.position - b.position
                ),
              }))
            )
        : Promise.resolve([]),
      uuidRefs("pipeline_stage").length
        ? supabase.from("pipeline_stages").select("*").in("id", uuidRefs("pipeline_stage")).then((r) => r.data ?? [])
        : Promise.resolve([]),
      uuidRefs("pricing_floor").length
        ? supabase.from("pricing_floors").select("*").in("id", uuidRefs("pricing_floor")).then((r) => r.data ?? [])
        : Promise.resolve([]),
      uuidRefs("roadmap_month").length
        ? supabase.from("roadmap_months").select("*").in("id", uuidRefs("roadmap_month")).then((r) => r.data ?? [])
        : Promise.resolve([]),
    ]);

  const byId = <T extends { id: string }>(arr: T[]): Map<string, T> =>
    new Map(arr.map((item) => [item.id, item]));

  const pMap = byId(principles as Principle[]);
  const tMap = byId(teamMembers as TeamMember[]);
  const slMap = new Map<string, ServiceLine>(
    (serviceLines as ServiceLine[]).map((sl) => [sl.line, sl])
  );
  const sMap = byId(scripts as Script[]);
  const pbMap = byId(playbooks as PlaybookWithSteps[]);
  const psMap = byId(pipelineStages as PipelineStage[]);
  const pfMap = byId(pricingFloors as PricingFloor[]);
  const rmMap = byId(roadmapMonths as RoadmapMonth[]);

  const resolved: ResolvedBlock[] = [];

  for (const block of blocks) {
    const { id, type, position, title, content_md, content_jsonb, ref_id, variant } = block;

    if (type === "text") {
      resolved.push({ id, type: "text", position, title, body: content_md ?? "" });
    } else if (type === "callout") {
      resolved.push({
        id, type: "callout", position, title,
        body: content_md ?? "",
        variant: variant ?? "info",
      });
    } else if (type === "principle" && ref_id && pMap.has(ref_id)) {
      resolved.push({ id, type: "principle", position, data: pMap.get(ref_id)! });
    } else if (type === "team_member" && ref_id && tMap.has(ref_id)) {
      resolved.push({ id, type: "team_member", position, data: tMap.get(ref_id)! });
    } else if (type === "service_line") {
      const lineKey = (content_jsonb?.line as string) ?? "";
      if (lineKey && slMap.has(lineKey)) {
        resolved.push({ id, type: "service_line", position, data: slMap.get(lineKey)! });
      }
    } else if (type === "script" && ref_id && sMap.has(ref_id)) {
      resolved.push({ id, type: "script", position, data: sMap.get(ref_id)! });
    } else if (type === "objection" && ref_id && sMap.has(ref_id)) {
      resolved.push({ id, type: "objection", position, data: sMap.get(ref_id)! });
    } else if (type === "playbook" && ref_id && pbMap.has(ref_id)) {
      resolved.push({ id, type: "playbook", position, data: pbMap.get(ref_id)! });
    } else if (type === "pipeline_stage" && ref_id && psMap.has(ref_id)) {
      resolved.push({ id, type: "pipeline_stage", position, data: psMap.get(ref_id)! });
    } else if (type === "pricing_floor" && ref_id && pfMap.has(ref_id)) {
      resolved.push({ id, type: "pricing_floor", position, data: pfMap.get(ref_id)! });
    } else if (type === "roadmap_month" && ref_id && rmMap.has(ref_id)) {
      resolved.push({ id, type: "roadmap_month", position, data: rmMap.get(ref_id)! });
    }
  }

  return resolved;
}

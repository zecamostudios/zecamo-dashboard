import type { ResolvedBlock } from "@/lib/manual/queries";
import { TextBlock } from "./blocks/text-block";
import { CalloutBlock } from "./blocks/callout-block";
import { PrincipleBlock } from "./blocks/principle-block";
import { TeamMemberBlock } from "./blocks/team-member-block";
import { ServiceLineBlock } from "./blocks/service-line-block";
import { ScriptBlock } from "./blocks/script-block";
import { ObjectionBlock } from "./blocks/objection-block";
import { PlaybookBlock } from "./blocks/playbook-block";
import { PipelineStageBlock } from "./blocks/pipeline-stage-block";
import { PricingFloorBlock } from "./blocks/pricing-floor-block";
import { RoadmapMonthBlock } from "./blocks/roadmap-month-block";

export function BlockRenderer({ block }: { block: ResolvedBlock }) {
  switch (block.type) {
    case "text":
      return <TextBlock title={block.title} body={block.body} />;
    case "callout":
      return <CalloutBlock title={block.title} body={block.body} variant={block.variant} />;
    case "principle":
      return <PrincipleBlock data={block.data} />;
    case "team_member":
      return <TeamMemberBlock data={block.data} />;
    case "service_line":
      return <ServiceLineBlock data={block.data} />;
    case "script":
      return <ScriptBlock data={block.data} />;
    case "objection":
      return <ObjectionBlock data={block.data} />;
    case "playbook":
      return <PlaybookBlock data={block.data} />;
    case "pipeline_stage":
      return <PipelineStageBlock data={block.data} />;
    case "pricing_floor":
      return <PricingFloorBlock data={block.data} />;
    case "roadmap_month":
      return <RoadmapMonthBlock data={block.data} />;
    default:
      return null;
  }
}

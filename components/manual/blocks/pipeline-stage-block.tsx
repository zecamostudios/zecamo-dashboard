import type { PipelineStage } from "@/lib/manual/queries";

export function PipelineStageBlock({ data }: { data: PipelineStage }) {
  return (
    <div className={`zec-pipeline-step${data.is_terminal ? " zec-pipeline-step--terminal" : ""}${data.is_lost ? " zec-pipeline-step--lost" : ""}`}>
      <div className="zec-pipeline-num">{String(data.position).padStart(2, "0")}</div>
      <div className="zec-pipeline-body">
        <div className="zec-pipeline-head-row">
          <h4 className="zec-pipeline-title">{data.name}</h4>
          {data.label_short && <span className="zec-pipeline-label">{data.label_short}</span>}
        </div>
        <p className="zec-pipeline-desc">{data.description}</p>
        {data.action && (
          <p className="zec-pipeline-action">
            <strong>Acción:</strong> {data.action}
          </p>
        )}
        <div className="zec-pipeline-meta">
          {data.owner && <span className="zec-who">{data.owner}</span>}
          {data.sla && <span className="zec-sla">SLA {data.sla}</span>}
        </div>
      </div>
    </div>
  );
}

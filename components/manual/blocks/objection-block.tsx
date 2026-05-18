import type { Script } from "@/lib/manual/queries";

export function ObjectionBlock({ data }: { data: Script }) {
  const { objection, response, principle } = data.content_jsonb;
  return (
    <div className="zec-objection">
      {objection && <div className="zec-objection-q">&ldquo;{objection}&rdquo;</div>}
      {response && (
        <div className="zec-objection-a">
          <strong>Respuesta:</strong> {response}
        </div>
      )}
      {principle && (
        <div className="zec-objection-note">{principle}</div>
      )}
    </div>
  );
}

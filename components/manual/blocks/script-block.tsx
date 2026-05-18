import type { Script } from "@/lib/manual/queries";

export function ScriptBlock({ data }: { data: Script }) {
  const isDiscovery = data.type === "discovery";
  const isClosing = data.type === "closing";

  return (
    <div className="zec-script">
      <h3 className="zec-script-title">{data.name}</h3>
      {data.context && <p className="zec-script-desc">{data.context}</p>}

      {isDiscovery && data.content_jsonb.questions && (
        <ol className="zec-script-steps">
          {data.content_jsonb.questions.map((q) => (
            <li key={q.number} className="zec-script-step">
              <div className="zec-script-step-topic">{q.topic}</div>
              <span className="zec-script-q">&ldquo;{q.question}&rdquo;</span>
              {q.red_flag && (
                <span className="zec-script-note"> → {q.red_flag}</span>
              )}
            </li>
          ))}
        </ol>
      )}

      {isClosing && data.content_jsonb.steps && (
        <ol className="zec-script-steps">
          {data.content_jsonb.steps.map((s) => (
            <li key={s.number} className="zec-script-step">
              <strong>{s.title}.</strong>{" "}
              <span>{s.content}</span>
            </li>
          ))}
        </ol>
      )}

      {isDiscovery && data.content_jsonb.closing_line && (
        <p className="zec-script-closing">{data.content_jsonb.closing_line}</p>
      )}
    </div>
  );
}

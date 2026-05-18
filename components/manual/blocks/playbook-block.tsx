import type { PlaybookWithSteps } from "@/lib/manual/queries";

export function PlaybookBlock({ data }: { data: PlaybookWithSteps }) {
  return (
    <div className="zec-playbook">
      <h3 className="zec-playbook-title">{data.name}</h3>
      {data.description && <p className="zec-playbook-desc">{data.description}</p>}
      <ul className="zec-checklist">
        {data.steps.map((step) => (
          <li key={step.id} className={`zec-checklist-item${step.is_recurring ? " zec-checklist-item--recurring" : ""}`}>
            <span className="zec-check" />
            <div className="zec-checklist-content">
              <strong>{step.number} · {step.title}</strong>
              <span className="zec-checklist-desc">{step.description}</span>
            </div>
            {step.deadline_relative && (
              <span className="zec-badge zec-badge-blue">{step.deadline_relative}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

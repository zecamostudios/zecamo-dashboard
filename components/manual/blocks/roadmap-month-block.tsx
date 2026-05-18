import type { RoadmapMonth } from "@/lib/manual/queries";

export function RoadmapMonthBlock({ data }: { data: RoadmapMonth }) {
  return (
    <div className="zec-roadmap-col">
      <div className="zec-roadmap-head">
        <div className="zec-month">Mes {String(data.month_number).padStart(2, "0")}</div>
        <h4 className="zec-roadmap-title">{data.title}</h4>
        {data.subtitle && <div className="zec-roadmap-sub">{data.subtitle}</div>}
      </div>
      <div className="zec-roadmap-body">
        <ul>
          {data.goals.map((g, i) => (
            <li key={i}>{g}</li>
          ))}
        </ul>
      </div>
      <div className="zec-roadmap-foot">
        <span>Cierre del mes</span>
        <strong>{data.closing_target} · {data.closing_mrr}</strong>
      </div>
    </div>
  );
}

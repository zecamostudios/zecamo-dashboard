import type { ServiceLine } from "@/lib/manual/queries";

export function ServiceLineBlock({ data }: { data: ServiceLine }) {
  return (
    <div className="zec-service-card">
      <div className="zec-service-head">
        <div>
          <h3 className="zec-service-title">{data.title}</h3>
          <div className="zec-service-sub">{data.subtitle}</div>
        </div>
        {data.tag_label && <span className="zec-badge">{data.tag_label}</span>}
      </div>

      <div className="zec-service-body">
        <div className="zec-service-cell">
          <h4>Qué entra</h4>
          <ul>{data.what_in.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </div>
        <div className="zec-service-cell">
          <h4>Qué NO entra</h4>
          <ul>{data.what_out.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </div>
        <div className="zec-service-cell">
          <h4>Cliente ideal</h4>
          <ul>{data.ideal_client.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </div>
        <div className="zec-service-cell">
          <h4>Cliente a rechazar</h4>
          <ul>{data.reject_client.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </div>
      </div>

      <div className="zec-service-meta">
        <div className="zec-service-meta-cell">
          <div className="zec-label">Ticket típico</div>
          <div className="zec-value">{data.typical_ticket}</div>
        </div>
        <div className="zec-service-meta-cell">
          <div className="zec-label">Modelo recomendado</div>
          <div className="zec-value">{data.recommended_model}</div>
        </div>
        <div className="zec-service-meta-cell">
          <div className="zec-label">Tiempo de entrega</div>
          <div className="zec-value">{data.delivery_time}</div>
        </div>
      </div>
    </div>
  );
}

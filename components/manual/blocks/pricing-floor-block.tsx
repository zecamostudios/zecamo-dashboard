import type { PricingFloor } from "@/lib/manual/queries";

export function PricingFloorBlock({ data }: { data: PricingFloor }) {
  const amount = data.amount_min ?? data.amount_floor;
  return (
    <div className="zec-price-card">
      <div className="zec-price-label">{data.label}</div>
      {amount != null && (
        <div className="zec-price-amount">
          <span className="zec-currency">{data.currency}</span>
          {amount.toLocaleString()}
          {data.unit && <span className="zec-period">{data.unit}</span>}
        </div>
      )}
      {data.amount_floor != null && data.amount_min != null && (
        <div className="zec-price-floor">Floor: {data.currency} {data.amount_floor.toLocaleString()}</div>
      )}
      {data.notes && <div className="zec-price-sub">{data.notes}</div>}
    </div>
  );
}

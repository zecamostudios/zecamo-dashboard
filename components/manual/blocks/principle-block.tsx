import type { Principle } from "@/lib/manual/queries";

export function PrincipleBlock({ data }: { data: Principle }) {
  return (
    <div className="zec-principle">
      <div className="zec-principle-num">{data.code}</div>
      <div>
        <h4 className="zec-principle-title">{data.title}</h4>
        <p className="zec-principle-body">{data.description}</p>
      </div>
    </div>
  );
}

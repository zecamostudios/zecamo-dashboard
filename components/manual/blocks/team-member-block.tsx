import type { TeamMember } from "@/lib/manual/queries";

export function TeamMemberBlock({ data }: { data: TeamMember }) {
  return (
    <div className="zec-person">
      <div className="zec-person-head">
        <div className="zec-avatar">{data.initial}</div>
        <div>
          <h4 className="zec-person-name">{data.name}</h4>
          <div className="zec-person-role">{data.role}</div>
        </div>
      </div>
      {data.description && <p className="zec-person-desc">{data.description}</p>}
      {data.owns && (
        <div className="zec-person-owns">
          <span className="zec-label">Owner de</span>
          <span>{data.owns}</span>
        </div>
      )}
      {data.not_owns && (
        <div className="zec-person-notown">
          <span className="zec-label">No cubre</span>
          <span>{data.not_owns}</span>
        </div>
      )}
      {data.meetings && (
        <div className="zec-person-meetings">
          <span className="zec-label">Reuniones</span>
          <span>{data.meetings}</span>
        </div>
      )}
    </div>
  );
}

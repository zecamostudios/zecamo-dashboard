import { type ReactNode } from "react";

export function ConfigSection({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-[22px] mb-[14px]">
      <div className="mb-[18px] pb-3.5 border-b border-[var(--color-border)]">
        <div className="font-[family-name:var(--font-display)] text-[18px] font-medium tracking-tight">
          {title}
        </div>
        {sub && <div className="text-[12.5px] text-[var(--color-text-muted)] mt-0.5">{sub}</div>}
      </div>
      {children}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  action,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[200px_1fr] gap-6 py-3.5 border-b border-[var(--color-border)] last:border-b-0 items-center max-[640px]:grid-cols-1 max-[640px]:gap-2">
      <div>
        <div className="text-[13px] font-medium">{label}</div>
        {hint && <div className="text-[11.5px] text-[var(--color-text-muted)] mt-0.5">{hint}</div>}
      </div>
      <div className="flex items-center gap-2.5">
        <div className="flex-1">{children}</div>
        {action}
      </div>
    </div>
  );
}

export const inputCls =
  "w-full bg-[var(--color-surface-2)] border border-[var(--color-border-2)] rounded-lg px-3 py-2 text-[13px] text-[var(--color-text)] outline-0 focus:border-[var(--color-primary)] focus:shadow-[0_0_0_1px_var(--color-primary)] transition";

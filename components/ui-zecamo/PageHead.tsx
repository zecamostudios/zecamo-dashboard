import { type ReactNode } from "react";

interface PageHeadProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

export function PageHead({ title, subtitle, actions }: PageHeadProps) {
  return (
    <div className="flex items-end justify-between mb-7 gap-6 flex-wrap">
      <div className="min-w-0">
        <h1 className="font-[family-name:var(--font-display)] text-[34px] font-medium tracking-tight leading-[1.1] m-0 text-[var(--color-text)]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[var(--color-text-muted)] text-[13.5px] mt-1.5 m-0 leading-snug">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

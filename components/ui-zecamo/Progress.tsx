interface ProgressProps {
  value: number;
  className?: string;
  height?: number;
  variant?: "default" | "success" | "warning" | "danger";
}

const GRADIENTS = {
  default: "linear-gradient(90deg, var(--color-primary), var(--color-primary-hover))",
  success: "linear-gradient(90deg, var(--color-success), #4FE0AA)",
  warning: "linear-gradient(90deg, var(--color-warning), #FFC459)",
  danger:  "linear-gradient(90deg, var(--color-danger), #FF7585)",
};

export function Progress({ value, className, height = 6, variant = "default" }: ProgressProps) {
  return (
    <div
      className={`bg-white/[0.05] rounded-full overflow-hidden ${className ?? ""}`}
      style={{ height }}
    >
      <div
        className="h-full rounded-full shadow-[0_0_6px_var(--color-glow)]"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: GRADIENTS[variant] }}
      />
    </div>
  );
}

import { AlertCircle, AlertTriangle, CheckCircle, Info, Lightbulb } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  info: Info,
  warn: AlertTriangle,
  danger: AlertCircle,
  tip: Lightbulb,
  success: CheckCircle,
};

type Props = {
  title: string | null;
  body: string;
  variant: string;
};

export function CalloutBlock({ title, body, variant }: Props) {
  const Icon = icons[variant] ?? Info;
  return (
    <div className={`zec-callout zec-callout-${variant}`}>
      <Icon className="zec-callout-icon" />
      <div>
        {title && <div className="zec-callout-title">{title}</div>}
        <div className="zec-callout-body">
          <Markdown remarkPlugins={[remarkGfm]}>{body}</Markdown>
        </div>
      </div>
    </div>
  );
}

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  title: string | null;
  body: string;
};

export function TextBlock({ title, body }: Props) {
  return (
    <div className="zec-text-block">
      {title && <h2 className="zec-block-title">{title}</h2>}
      <div className="zec-prose">
        <Markdown remarkPlugins={[remarkGfm]}>{body}</Markdown>
      </div>
    </div>
  );
}

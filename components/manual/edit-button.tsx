"use client";

import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  slug: string;
  blockId: string;
};

export function EditButton({ slug, blockId }: Props) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(`/manual/${slug}/edit?block=${blockId}`)}
      className="zec-edit-btn"
      title="Editar bloque"
    >
      <Pencil className="size-3" />
    </button>
  );
}

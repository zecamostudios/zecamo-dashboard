import { cn } from "@/lib/utils";
import type { OwnerId } from "@/lib/types";
import { getOwner } from "@/lib/utils/index";

type Size = "xs" | "sm" | "md" | "lg";

interface OwnerAvatarProps {
  id: OwnerId;
  size?: Size;
  className?: string;
}

const SIZE_MAP: Record<Size, string> = {
  xs: "w-[22px] h-[22px] text-[9.5px]",
  sm: "w-[26px] h-[26px] text-[10.5px]",
  md: "w-8 h-8 text-[11.5px]",
  lg: "w-10 h-10 text-[13px]",
};

const GRADIENT: Record<OwnerId, string> = {
  JS: "from-[#2B5BFF] to-[#1A3FCC]",
  LM: "from-[#A47BFF] to-[#6B4ECC]",
  BR: "from-[#22C58B] to-[#15805A]",
};

export function OwnerAvatar({ id, size = "md", className }: OwnerAvatarProps) {
  const owner = getOwner(id);
  return (
    <div
      title={owner?.name}
      className={cn(
        "rounded-full grid place-items-center font-semibold text-white shrink-0 bg-gradient-to-br shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]",
        SIZE_MAP[size],
        GRADIENT[id],
        className,
      )}
    >
      {id}
    </div>
  );
}

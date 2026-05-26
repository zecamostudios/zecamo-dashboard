import { OWNERS } from "@/lib/mock-data";
import type { OwnerId } from "@/lib/types";

export function fmtN(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function fmtUsd(n: number): string {
  return `$${fmtN(n)}`;
}

export function getOwner(id: OwnerId) {
  return OWNERS.find((o) => o.id === id);
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

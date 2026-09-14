import { ACTION_BOUNDARY, ACTION_FOCUS } from "@/lib/control-classes";
import { getInventoryInfo } from "@/lib/inventory";

export interface InventoryBadgeProps {
  productId: string | number;
  slug?: string;
  className?: string;
}

export default function InventoryBadge({
  productId,
  slug,
  className,
}: InventoryBadgeProps) {
  const info = getInventoryInfo(productId, slug);

  const dotColor =
    info.status === "out_of_stock"
      ? "bg-red-500"
      : info.status === "low_stock"
      ? "bg-amber-500"
      : "bg-emerald-500";

  return (
    <span
      role="status"
      aria-label={`Inventory status: ${info.label}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${info.badgeClass} ${ACTION_BOUNDARY} ${ACTION_FOCUS} ${className ?? ""}`.trim()}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColor}`}
        aria-hidden="true"
      />
      <span>{info.label}</span>
    </span>
  );
}

import { Check, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import type { AdminOrderStatus } from "../lib/admin-service";
import { ORDER_STATUS_META } from "../lib/order-status";

/** Ordre d'affichage dans le menu : du flux normal vers l'échec. */
const MENU_ORDER: AdminOrderStatus[] = ["en_attente", "payee", "terminee", "echouee"];

export function OrderStatusMenu({ current, allowed, onSelect }: { current: string; allowed?: AdminOrderStatus[]; onSelect: (target: AdminOrderStatus) => void }) {
  const options = MENU_ORDER.filter((status) => allowed?.includes(status));
  if (!options.length) {
    return <span className="order-status-locked" title="Ce statut est définitif">Définitif</span>;
  }
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button type="button" className="button button-dark order-status-trigger">Changer le statut <ChevronDown size={13} /></button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="order-status-menu">
        <DropdownMenuLabel className="order-status-menu-label">Actuellement : {ORDER_STATUS_META[current]?.label ?? current}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((status) => {
          const meta = ORDER_STATUS_META[status];
          const Icon = meta.icon;
          return (
            <DropdownMenuItem key={status} className="order-status-menu-item" onSelect={() => { window.setTimeout(() => onSelect(status), 0); }}>
              <span className={`order-status-menu-icon ${meta.tone}`}><Icon size={14} /></span>
              <span className="order-status-menu-text"><strong>{meta.label}</strong><small>{meta.hint}</small></span>
              {status === "terminee" ? <Check size={13} className="order-status-menu-final" aria-label="Définitif" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

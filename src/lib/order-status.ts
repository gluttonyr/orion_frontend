import { CircleDollarSign, Clock3, PackageCheck, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type StatusMeta = { label: string; tone: string; icon: LucideIcon; hint: string; consequence: string };

/** Libellés, couleurs et effets de chaque statut de commande (mêmes règles que le backend). */
export const ORDER_STATUS_META: Record<string, StatusMeta> = {
  en_attente: {
    label: "Paiement en attente",
    tone: "status-gold",
    icon: Clock3,
    hint: "Le client n’a pas encore payé",
    consequence: "La commande attend le paiement du client. Les articles restent réservés dans le stock.",
  },
  payee: {
    label: "Payée · à livrer",
    tone: "status-blue",
    icon: CircleDollarSign,
    hint: "Le client a payé, le commerçant doit livrer",
    consequence: "Le paiement est considéré comme reçu. Le montant revient au(x) commerçant(s), bloqué jusqu’à la remise par QR code, et la commission Orion est comptée. Ensuite, la commande ne pourra plus que passer à « Terminée ».",
  },
  terminee: {
    label: "Terminée",
    tone: "status-green",
    icon: PackageCheck,
    hint: "Livrée au client, dossier clos",
    consequence: "Cette action est définitive : une commande terminée ne pourra plus changer de statut.",
  },
  echouee: {
    label: "Échouée",
    tone: "status-coral",
    icon: XCircle,
    hint: "Paiement refusé ou abandonné",
    consequence: "Les articles réservés sont remis en stock et le paiement FedaPay en cours est clôturé. Vous pourrez réactiver la commande plus tard si besoin.",
  },
  remboursee: {
    label: "Remboursée",
    tone: "status-coral",
    icon: XCircle,
    hint: "Remboursement effectué",
    consequence: "",
  },
};


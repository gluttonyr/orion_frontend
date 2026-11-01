import { useState, type FormEvent } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Flag, Send, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { reportProduct, reportStore } from "../lib/store-service";
import { toast } from "./ui/sonner";

type ReportDialogProps = {
  targetType: "boutique" | "produit";
  targetId: number;
  targetName: string;
  token?: string;
};

export function ReportDialog({ targetType, targetId, targetName, token }: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const targetLabel = targetType === "produit" ? "ce produit" : "cette boutique";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      setOpen(false);
      navigate("/login", { state: { from: `${location.pathname}${location.search}` } });
      return;
    }

    setSubmitting(true);
    try {
      if (targetType === "produit") await reportProduct(targetId, reason.trim(), token);
      else await reportStore(targetId, reason.trim(), token);
      toast.success("Le signalement a été transmis à l’administration.");
      setReason("");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible d’envoyer le signalement.");
    } finally {
      setSubmitting(false);
    }
  };

  return <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
    <DialogPrimitive.Trigger asChild>
      <button type="button" className="public-report-trigger"><Flag size={14} /> Signaler</button>
    </DialogPrimitive.Trigger>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="public-report-overlay" />
      <DialogPrimitive.Content className="public-report-dialog">
        <div className="public-report-heading">
          <span className="public-report-icon"><Flag size={18} /></span>
          <button type="button" className="public-report-close" aria-label="Fermer" onClick={() => setOpen(false)}><X size={17} /></button>
          <span className="public-kicker">MODÉRATION ORION</span>
          <DialogPrimitive.Title>Signaler {targetLabel}</DialogPrimitive.Title>
          <DialogPrimitive.Description>Votre signalement sera examiné par l’équipe Orion.</DialogPrimitive.Description>
        </div>
        <form onSubmit={submit}>
          <div className="public-report-target"><span>{targetType === "produit" ? "PRODUIT" : "BOUTIQUE"}</span><strong>{targetName}</strong></div>
          <label className="public-report-label" htmlFor={`report-reason-${targetType}-${targetId}`}>Motif <span>facultatif</span></label>
          <textarea id={`report-reason-${targetType}-${targetId}`} value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1000} placeholder="Ajoutez un détail utile à l’équipe, si vous le souhaitez." rows={4} />
          <div className="public-report-footer"><span>Vous pouvez envoyer le signalement sans commentaire.</span><button type="submit" className="button button-dark" disabled={submitting}><Send size={14} /> {submitting ? "Envoi…" : "Envoyer"}</button></div>
        </form>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>;
}

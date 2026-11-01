import { useState, type FormEvent } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Star, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveProductReview } from "../lib/catalog-service";
import { toast } from "./ui/sonner";

type ReviewDialogProps = {
  productId: number;
  productName: string;
  token?: string;
  onSaved: () => void;
};

export function ReviewDialog({ productId, productName, token, onSaved }: ReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      setOpen(false);
      navigate("/login", { state: { from: `${location.pathname}${location.search}` } });
      return;
    }
    if (rating < 1 || rating > 5) {
      toast.error("Choisissez une note de 1 à 5 étoiles.");
      return;
    }

    setSubmitting(true);
    try {
      await saveProductReview(productId, rating, comment.trim(), token);
      toast.success("Votre avis a été enregistré.");
      setOpen(false);
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible d’enregistrer votre avis.");
    } finally {
      setSubmitting(false);
    }
  };

  return <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
    <DialogPrimitive.Trigger asChild><button type="button" className="product-review-trigger"><Star size={14} /> Ajouter un avis</button></DialogPrimitive.Trigger>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="public-report-overlay" />
      <DialogPrimitive.Content className="public-report-dialog product-review-dialog">
        <div className="public-report-heading">
          <span className="public-report-icon"><Star size={18} /></span>
          <button type="button" className="public-report-close" aria-label="Fermer" onClick={() => setOpen(false)}><X size={17} /></button>
          <span className="public-kicker">VOTRE EXPÉRIENCE</span>
          <DialogPrimitive.Title>Donner votre avis</DialogPrimitive.Title>
          <DialogPrimitive.Description>Partagez votre expérience de ce produit avec la communauté Orion.</DialogPrimitive.Description>
        </div>
        <form onSubmit={submit}>
          <div className="public-report-target"><span>PRODUIT</span><strong>{productName}</strong></div>
          <fieldset className="product-review-rating">
            <legend>Votre note</legend>
            <div role="group" aria-label="Choisir une note sur 5">
              {Array.from({ length: 5 }, (_, index) => {
                const value = index + 1;
                return <button key={value} type="button" aria-label={`${value} étoile${value > 1 ? "s" : ""}`} aria-pressed={rating === value} onClick={() => setRating(value)}><Star size={27} fill={value <= rating ? "currentColor" : "none"} /></button>;
              })}
            </div>
            <span>{rating ? `${rating} / 5` : "Sélectionnez une note"}</span>
          </fieldset>
          <label className="public-report-label" htmlFor={`review-comment-${productId}`}>Commentaire <span>facultatif</span></label>
          <textarea id={`review-comment-${productId}`} value={comment} onChange={(event) => setComment(event.target.value)} maxLength={2000} placeholder="Qu’avez-vous pensé de ce produit ?" rows={4} />
          <div className="public-report-footer"><span>Votre note est requise, le commentaire ne l’est pas.</span><button type="submit" className="button button-dark" disabled={submitting || rating === 0}>{submitting ? "Enregistrement…" : "Publier l’avis"}</button></div>
        </form>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>;
}
import type { ReactNode } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Copy, ExternalLink, Mail } from "lucide-react";
import { toast } from "./ui/sonner";

// A bare mailto: makes Windows ask which app to use when no mail client is set up, so offer copy and Gmail first.
export function ContactEmail({ email, className, children }: { email: string; className?: string; children: ReactNode }) {
  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(email);
      toast.success("Adresse e-mail copiée.");
    } catch {
      toast.error(`Copie impossible. Notre adresse : ${email}`);
    }
  };
  return <Popover.Root>
    <Popover.Trigger asChild><button type="button" className={className}>{children}</button></Popover.Trigger>
    <Popover.Portal><Popover.Content className="contact-email-menu" side="top" align="start" sideOffset={8} collisionPadding={12}>
      <span className="contact-email-label">Écrivez-nous à</span>
      <strong className="contact-email-address">{email}</strong>
      <Popover.Close asChild><button type="button" onClick={() => void copy()}><Copy size={15} /> Copier l’adresse</button></Popover.Close>
      <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`} target="_blank" rel="noopener noreferrer"><ExternalLink size={15} /> Écrire avec Gmail</a>
      <a href={`mailto:${email}`}><Mail size={15} /> Application de messagerie</a>
    </Popover.Content></Popover.Portal>
  </Popover.Root>;
}

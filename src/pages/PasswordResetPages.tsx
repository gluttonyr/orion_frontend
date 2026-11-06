import { type ClipboardEvent, type FormEvent, type KeyboardEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole, Mail, MailCheck, RotateCw, ShieldCheck, X } from "lucide-react";
import { toast } from "../components/ui/sonner";
import { OrionBrand } from "../components/OrionBrand";
import {
  clearResetFlow,
  passwordStrength,
  readResetFlow,
  requestPasswordReset,
  resetPassword,
  verifyPasswordResetCode,
  writeResetFlow,
  type PasswordResetFlow,
} from "../lib/password-reset-service";
import "../password-reset.css";

const STEPS = [
  { label: "Adresse e-mail", icon: Mail },
  { label: "Code de vérification", icon: ShieldCheck },
  { label: "Nouveau mot de passe", icon: KeyRound },
];

const errorMessage = (error: unknown, fallback: string) => (error instanceof Error && error.message ? error.message : fallback);

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  const visible = name.length <= 2 ? name[0] ?? "" : `${name[0]}${name[name.length - 1]}`;
  return `${visible[0] ?? ""}${"•".repeat(Math.max(2, name.length - 2))}${visible[1] ?? ""}@${domain}`;
}

/** Mise en page commune aux écrans de réinitialisation, identique à la page de connexion. */
function ResetLayout({ step, children }: { step: 0 | 1 | 2 | 3; children: ReactNode }) {
  return <main className="auth-shell reset-shell">
    <div className="auth-visual reset-visual">
      <OrionBrand tone="light" />
      <span className="auth-visual-kicker">SÉCURITÉ DU COMPTE</span>
      <h1>Un nouveau<br /><em>départ.</em></h1>
      <p>Retrouvez l’accès à votre espace Orion en trois étapes simples et sécurisées.</p>
      <ol className="reset-visual-steps" aria-label="Étapes">
        {STEPS.map((item, index) => {
          const Icon = item.icon;
          const state = step > index ? "is-done" : step === index ? "is-current" : "";
          return <li key={item.label} className={state}><span>{step > index ? <Check size={14} /> : <Icon size={14} />}</span>{item.label}</li>;
        })}
      </ol>
    </div>
    <div className="auth-form-side">
      <header className="auth-form-header"><Link to="/login" className="auth-close" aria-label="Fermer et revenir à la connexion"><X size={19} /></Link></header>
      <div className="auth-form-wrap reset-form-wrap">
        {step < 3 ? <div className="reset-progress" aria-hidden="true">{STEPS.map((item, index) => <span key={item.label} className={step >= index ? "is-active" : ""} />)}</div> : null}
        {children}
      </div>
    </div>
  </main>;
}

/** Étape 1 — saisie de l'adresse e-mail. */
export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => readResetFlow()?.email ?? "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) { setError("Saisissez une adresse e-mail valide."); return; }
    setSubmitting(true);
    setError("");
    try {
      const response = await requestPasswordReset(normalized);
      writeResetFlow({ email: normalized, codeSentAt: Date.now(), resendInSeconds: response.resendInSeconds, expiresInMinutes: response.expiresInMinutes });
      toast.success("Code envoyé. Consultez votre boîte de réception.");
      navigate("/mot-de-passe-oublie/code");
    } catch (requestError) {
      setError(errorMessage(requestError, "Impossible d’envoyer le code pour le moment."));
    } finally {
      setSubmitting(false);
    }
  };

  return <ResetLayout step={0}>
    <span className="public-kicker">ÉTAPE 1 SUR 3 · MOT DE PASSE OUBLIÉ</span>
    <h1>Mot de passe<br /><em>oublié ?</em></h1>
    <p>Indiquez l’adresse e-mail de votre compte. Nous vous enverrons un code à 6 chiffres pour choisir un nouveau mot de passe.</p>
    <form onSubmit={submit} noValidate>
      <label>Adresse e-mail<span className="reset-input-icon"><Mail size={16} /><input type="email" autoComplete="email" autoFocus required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vous@exemple.com" /></span></label>
      {error ? <p className="auth-error" role="alert">{error}</p> : null}
      <button type="submit" className="public-primary-button auth-submit" disabled={submitting}>{submitting ? "Envoi du code…" : "Recevoir mon code"} <ArrowRight size={17} /></button>
    </form>
    <div className="reset-note"><LockKeyhole size={15} /><span>Pour votre sécurité, nous n’indiquons pas si une adresse est associée à un compte.</span></div>
    <div className="auth-switch"><Link to="/login" className="reset-back-link"><ArrowLeft size={14} /> Retour à la connexion</Link></div>
  </ResetLayout>;
}

/** Champ de code à 6 cases : saisie, collage, retour arrière et flèches gérés. */
function CodeInput({ value, onChange, onComplete, disabled, invalid }: { value: string; onChange: (value: string) => void; onComplete: (value: string) => void; disabled?: boolean; invalid?: boolean }) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? "");

  const update = (next: string, focusIndex?: number) => {
    const clean = next.replace(/\D/g, "").slice(0, 6);
    onChange(clean);
    if (focusIndex !== undefined) refs.current[Math.min(5, Math.max(0, focusIndex))]?.focus();
    if (clean.length === 6) onComplete(clean);
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    const chars = digits.slice();
    chars[index] = digit;
    update(chars.join(""), index + 1);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const chars = digits.slice();
      if (chars[index]) { chars[index] = ""; update(chars.join(""), index); }
      else if (index > 0) { chars[index - 1] = ""; update(chars.join(""), index - 1); }
    } else if (event.key === "ArrowLeft") refs.current[index - 1]?.focus();
    else if (event.key === "ArrowRight") refs.current[index + 1]?.focus();
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    event.preventDefault();
    update(pasted, pasted.length);
  };

  return <div className={`reset-code ${invalid ? "is-invalid" : ""}`} role="group" aria-label="Code à 6 chiffres">
    {digits.map((digit, index) => <input
      key={index}
      ref={(element) => { refs.current[index] = element; }}
      value={digit}
      inputMode="numeric"
      autoComplete={index === 0 ? "one-time-code" : "off"}
      maxLength={1}
      disabled={disabled}
      autoFocus={index === 0}
      aria-label={`Chiffre ${index + 1}`}
      onChange={(event) => handleChange(index, event.target.value)}
      onKeyDown={(event) => handleKeyDown(index, event)}
      onPaste={handlePaste}
      onFocus={(event) => event.target.select()}
    />)}
  </div>;
}

function useCountdown(target?: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!target || target <= Date.now()) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [target]);
  return target ? Math.max(0, Math.ceil((target - now) / 1000)) : 0;
}

/** Étape 2 — saisie du code reçu par e-mail. */
export function VerifyResetCodePage() {
  const navigate = useNavigate();
  const [flow, setFlow] = useState<PasswordResetFlow | null>(() => readResetFlow());
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const resendAt = flow?.codeSentAt ? flow.codeSentAt + (flow.resendInSeconds ?? 60) * 1000 : undefined;
  const resendIn = useCountdown(resendAt);
  const expiresAt = flow?.codeSentAt ? flow.codeSentAt + (flow.expiresInMinutes ?? 15) * 60_000 : undefined;
  const expiresIn = useCountdown(expiresAt);

  if (!flow?.email) return <Navigate to="/mot-de-passe-oublie" replace />;

  const verify = async (value = code) => {
    if (value.length !== 6 || verifying) { setError("Saisissez les 6 chiffres du code."); return; }
    setVerifying(true);
    setError("");
    try {
      const { resetToken, expiresInMinutes } = await verifyPasswordResetCode(flow.email, value);
      writeResetFlow({ ...flow, resetToken, tokenExpiresAt: Date.now() + expiresInMinutes * 60_000 });
      navigate("/mot-de-passe-oublie/nouveau");
    } catch (verifyError) {
      setError(errorMessage(verifyError, "Code invalide."));
      setCode("");
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    setResending(true);
    setError("");
    try {
      const response = await requestPasswordReset(flow.email);
      const next = { email: flow.email, codeSentAt: Date.now(), resendInSeconds: response.resendInSeconds, expiresInMinutes: response.expiresInMinutes };
      writeResetFlow(next);
      setFlow(next);
      setCode("");
      toast.success("Un nouveau code vient d’être envoyé.");
    } catch (resendError) {
      setError(errorMessage(resendError, "Impossible de renvoyer le code."));
    } finally {
      setResending(false);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void verify(); };
  const minutes = Math.floor(expiresIn / 60);
  const seconds = String(expiresIn % 60).padStart(2, "0");

  return <ResetLayout step={1}>
    <span className="public-kicker">ÉTAPE 2 SUR 3 · VÉRIFICATION</span>
    <h1>Vérifiez votre<br /><em>boîte mail.</em></h1>
    <p>Nous avons envoyé un code à 6 chiffres à <strong className="reset-email">{maskEmail(flow.email)}</strong>. Pensez à vérifier vos courriers indésirables.</p>
    <form onSubmit={submit}>
      <span className="reset-label">Code de vérification</span>
      <CodeInput value={code} onChange={(value) => { setCode(value); if (error) setError(""); }} onComplete={(value) => void verify(value)} disabled={verifying} invalid={Boolean(error)} />
      <div className="reset-code-meta">
        {expiresIn > 0 ? <span>Code valable encore <strong>{minutes}:{seconds}</strong></span> : <span className="is-expired">Ce code a expiré, demandez-en un nouveau.</span>}
        <button type="button" className="reset-resend" onClick={() => void resend()} disabled={resendIn > 0 || resending}><RotateCw size={13} className={resending ? "is-spinning" : ""} />{resendIn > 0 ? `Renvoyer dans ${resendIn} s` : resending ? "Envoi…" : "Renvoyer le code"}</button>
      </div>
      {error ? <p className="auth-error" role="alert">{error}</p> : null}
      <button type="submit" className="public-primary-button auth-submit" disabled={verifying || code.length !== 6}>{verifying ? "Vérification…" : "Vérifier le code"} <ArrowRight size={17} /></button>
    </form>
    <div className="reset-note"><MailCheck size={15} /><span>Le code n’est valable qu’une fois. Ne le communiquez à personne : l’équipe Orion ne vous le demandera jamais.</span></div>
    <div className="auth-switch"><Link to="/mot-de-passe-oublie" className="reset-back-link"><ArrowLeft size={14} /> Modifier l’adresse e-mail</Link></div>
  </ResetLayout>;
}

/** Étape 3 — nouveau mot de passe et confirmation. */
export function NewPasswordPage() {
  const navigate = useNavigate();
  const flow = useMemo(() => readResetFlow(), []);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const strength = passwordStrength(password);
  const mismatch = confirm.length > 0 && confirm !== password;

  if (!flow?.email) return <Navigate to="/mot-de-passe-oublie" replace />;
  if (!flow.resetToken || (flow.tokenExpiresAt && flow.tokenExpiresAt < Date.now())) return <Navigate to="/mot-de-passe-oublie/code" replace />;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!strength.valid) { setError("Le mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre."); return; }
    if (password !== confirm) { setError("Les deux mots de passe ne correspondent pas."); return; }
    setSubmitting(true);
    setError("");
    try {
      await resetPassword(flow.email, flow.resetToken!, password);
      clearResetFlow();
      navigate("/mot-de-passe-oublie/termine", { replace: true, state: { email: flow.email } });
    } catch (resetError) {
      const message = errorMessage(resetError, "Impossible de modifier le mot de passe.");
      setError(message);
      if (/expiré|recommencez/i.test(message)) { clearResetFlow(); toast.error(message); navigate("/mot-de-passe-oublie", { replace: true }); }
    } finally {
      setSubmitting(false);
    }
  };

  const field = (label: string, value: string, onChange: (value: string) => void, visible: boolean, toggle: () => void, autoFocus = false) => (
    <label>{label}<span className="auth-password-control"><input required type={visible ? "text" : "password"} autoComplete="new-password" autoFocus={autoFocus} value={value} onChange={(event) => { onChange(event.target.value); if (error) setError(""); }} placeholder="••••••••" /><button type="button" aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"} onClick={toggle}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
  );

  return <ResetLayout step={2}>
    <span className="public-kicker">ÉTAPE 3 SUR 3 · NOUVEAU MOT DE PASSE</span>
    <h1>Choisissez un<br /><em>mot de passe.</em></h1>
    <p>Créez un mot de passe que vous n’utilisez nulle part ailleurs pour le compte <strong className="reset-email">{maskEmail(flow.email)}</strong>.</p>
    <form onSubmit={submit}>
      {field("Nouveau mot de passe", password, setPassword, showPassword, () => setShowPassword((value) => !value), true)}
      <div className="reset-strength" aria-live="polite">
        <div className={`reset-strength-bar level-${strength.level}`}>{[1, 2, 3, 4].map((level) => <span key={level} />)}</div>
        <span>{password ? `Sécurité : ${strength.label}` : "Sécurité du mot de passe"}</span>
      </div>
      <ul className="reset-checklist">{strength.checks.map((check) => <li key={check.label} className={check.ok ? "is-ok" : ""}><Check size={12} />{check.label}</li>)}</ul>
      {field("Confirmer le mot de passe", confirm, setConfirm, showConfirm, () => setShowConfirm((value) => !value))}
      {mismatch ? <p className="reset-field-hint is-error">Les mots de passe ne correspondent pas.</p> : confirm && !mismatch ? <p className="reset-field-hint is-ok"><Check size={12} /> Les mots de passe correspondent.</p> : null}
      {error ? <p className="auth-error" role="alert">{error}</p> : null}
      <button type="submit" className="public-primary-button auth-submit" disabled={submitting || !strength.valid || password !== confirm}>{submitting ? "Enregistrement…" : "Enregistrer le mot de passe"} <ArrowRight size={17} /></button>
    </form>
  </ResetLayout>;
}

/** Confirmation finale. */
export function PasswordResetDonePage() {
  const navigate = useNavigate();
  return <ResetLayout step={3}>
    <div className="reset-success">
      <span className="reset-success-icon"><CheckCircle2 size={34} /></span>
      <span className="public-kicker">C’EST FAIT</span>
      <h1>Mot de passe<br /><em>modifié.</em></h1>
      <p>Votre mot de passe a bien été mis à jour. Un e-mail de confirmation vous a été envoyé. Vous pouvez maintenant vous connecter avec vos nouveaux identifiants.</p>
      <button type="button" className="public-primary-button auth-submit" onClick={() => navigate("/login", { replace: true })}>Se connecter <ArrowRight size={17} /></button>
      <div className="reset-note"><ShieldCheck size={15} /><span>Si vous n’êtes pas à l’origine de ce changement, contactez immédiatement le support Orion.</span></div>
    </div>
  </ResetLayout>;
}

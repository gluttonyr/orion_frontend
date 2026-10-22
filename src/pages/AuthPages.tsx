import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, ChevronDown, Eye, EyeOff, Store, X } from "lucide-react";
import { toast } from "../components/ui/sonner";
import { useOrion, type UserRole } from "../OrionContext";
import { countryCallingCodes, countryFlagImageUrl } from "../lib/country-calling-codes";

function OrionLogo({ light = false }: { light?: boolean }) {
  return <Link to="/" className={`orion-public-logo ${light ? "is-light" : ""}`} aria-label="Orion accueil"><img src="/orion.jpeg" alt="Logo Orion" /></Link>;
}

type RegistrationFields = {
  nom: string;
  prenom: string;
  contact: string;
  confirmPassword: string;
};

export function AuthPage({ register = false }: { register?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register: registerUser } = useOrion();
  const authState = location.state as { from?: string; role?: UserRole } | null;
  const [role, setRole] = useState<UserRole | null>(register ? null : authState?.role ?? "UTILISATEUR");
  const [registrationStep, setRegistrationStep] = useState<1 | 2>(1);
  const [countryDialCode, setCountryDialCode] = useState("+225");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLSpanElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fields, setFields] = useState<RegistrationFields>({ nom: "", prenom: "", contact: "", confirmPassword: "" });
  const destination = authState?.from ?? "/dashboard";

  const updateField = (field: keyof RegistrationFields, value: string): void => {
    setFields((current) => ({ ...current, [field]: value }));
  };

  useEffect(() => {
    if (!countryDropdownOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!countryDropdownRef.current?.contains(event.target as Node)) setCountryDropdownOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [countryDropdownOpen]);

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError("");

    if (password.length < 4) {
      const message = "Le mot de passe doit contenir au moins 4 caractères.";
      setError(message);
      toast.error(message);
      return;
    }

    if (register && password !== fields.confirmPassword) {
      const message = "Les mots de passe ne correspondent pas.";
      setError(message);
      toast.error(message);
      return;
    }

    if (register && registrationStep === 1) {
      setRegistrationStep(2);
      return;
    }
    if (register && !role) {
      const message = "Choisissez le profil qui correspond à votre projet.";
      setError(message);
      toast.error(message);
      return;
    }

    setIsSubmitting(true);
    try {
      if (register) {
        await registerUser({
          email,
          password,
          role: role!,
          nom: fields.nom,
          prenom: fields.prenom,
          adresse: fields.adresse,
          contact: `${countryDialCode} ${fields.contact.trim()}`,
          indicatifPays: countryDialCode,
        });
        toast.success("Inscription réussie.");
      } else {
        await login(email, password, role ?? "UTILISATEUR");
        toast.success("Connexion réussie.");
      }
      navigate(authState?.from ?? (role === "COMMERCANT" ? "/store-selection" : destination));
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Impossible de poursuivre la demande.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordField = (label: string, value: string, onChange: (value: string) => void, visible: boolean, toggle: () => void) => (
    <label>{label}<span className="auth-password-control"><input required type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} placeholder="••••••••" /><button type="button" aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"} onClick={toggle}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
  );

  return <main className="auth-shell">
    <div className="auth-visual"><OrionLogo light /><span className="auth-visual-kicker">ORION AFRICA</span><h1>Construire<br /><em>ensemble.</em></h1><p>Une marketplace pour les produits qui comptent et les opportunités qui ouvrent des portes.</p></div>
    <div className="auth-form-side"><Link to="/" className="auth-close"><X size={19} /></Link><div className="auth-form-wrap">
      <span className="public-kicker">{register ? registrationStep === 1 ? "ÉTAPE 1 SUR 2 · VOS INFORMATIONS" : "ÉTAPE 2 SUR 2 · VOTRE PROJET" : "BON RETOUR"}</span><h1>{register ? registrationStep === 1 ? "Créer votre espace." : "Bienvenue sur Orion." : "Ravi de vous revoir."}</h1><p>{register ? registrationStep === 1 ? "Renseignez vos informations de compte pour continuer." : "Choisissez ce que vous souhaitez faire sur Orion pour finaliser votre inscription." : "Connectez-vous pour retrouver vos boutiques, vos messages et vos opportunités."}</p>
      <form onSubmit={submit}>
        {register && registrationStep === 1 ? <>
          <div className="auth-registration-fields">
            <label>Nom<input required value={fields.nom} onChange={(event) => updateField("nom", event.target.value)} placeholder="Votre nom" /></label>
            <label>Prénom<input required value={fields.prenom} onChange={(event) => updateField("prenom", event.target.value)} placeholder="Votre prénom" /></label>
            <label>Email professionnel<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vous@exemple.com" /></label>
            <label>Téléphone<span className="auth-phone-control"><span className="auth-phone-country" ref={countryDropdownRef}><button type="button" className="auth-phone-country-display" aria-label={`Choisir le pays, indicatif actuel ${countryDialCode}`} aria-expanded={countryDropdownOpen} onClick={() => setCountryDropdownOpen((open) => !open)}>{countryFlagImageUrl(countryDialCode) ? <img src={countryFlagImageUrl(countryDialCode)} alt="" /> : null}<span>{countryDialCode}</span><ChevronDown size={13} /></button>{countryDropdownOpen ? <span className="auth-country-options" role="listbox">{countryCallingCodes.map((country) => <button type="button" role="option" aria-selected={country.dialCode === countryDialCode} key={country.dialCode} onClick={() => { setCountryDialCode(country.dialCode); setCountryDropdownOpen(false); }}>{countryFlagImageUrl(country.dialCode) ? <img src={countryFlagImageUrl(country.dialCode)} alt="" /> : null}<span>{country.name}</span><small>{country.dialCode}</small></button>)}</span> : null}</span><input type="tel" required value={fields.contact} onChange={(event) => updateField("contact", event.target.value)} placeholder="Numéro local, sans indicatif" /></span></label>
          </div>
          {passwordField("Mot de passe", password, setPassword, showPassword, () => setShowPassword((value) => !value))}
          {passwordField("Confirmer le mot de passe", fields.confirmPassword, (value) => updateField("confirmPassword", value), showConfirmPassword, () => setShowConfirmPassword((value) => !value))}
        </> : register ? <>
          <h2 className="auth-step-heading">Que veux-tu faire sur Orion ?</h2>
          <div className="auth-role-picker"><span>Je suis...</span><div><button type="button" className={role === "COMMERCANT" ? "is-active" : ""} onClick={() => setRole("COMMERCANT")}><Store size={17} /><strong>Commerçant</strong><small>Je vends et je développe mon commerce</small></button><button type="button" className={role === "UTILISATEUR" ? "is-active" : ""} onClick={() => setRole("UTILISATEUR")}><BriefcaseBusiness size={17} /><strong>Jeune entrepreneur</strong><small>Je cherche des missions et des connexions</small></button></div></div>
          <button type="button" className="auth-back-button" onClick={() => setRegistrationStep(1)}>Retour aux informations</button>
        </> : <>
          <label>Email professionnel<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vous@exemple.com" /></label>
          {passwordField("Mot de passe", password, setPassword, showPassword, () => setShowPassword((value) => !value))}
          <button type="button" className="auth-forgot">Mot de passe oublié ?</button>
        </>}
        {error ? <p className="auth-error">{error}</p> : null}<button type="submit" className="public-primary-button auth-submit" disabled={isSubmitting}>{isSubmitting ? "Chargement..." : register ? registrationStep === 1 ? "Suivant" : "Finaliser mon inscription" : "Se connecter"} <ArrowRight size={17} /></button>
      </form>
      <div className="auth-switch">{register ? <>Vous avez déjà un compte ? <Link to="/login" state={authState?.from ? { from: authState.from } : undefined}>Se connecter</Link></> : <>Pas encore de compte ? <Link to="/register" state={authState?.from ? { from: authState.from } : undefined}>Rejoindre Orion</Link></>}</div><div className="auth-legal">En continuant, vous acceptez les <a href="#terms">conditions d'utilisation</a> et la <a href="#privacy">politique de confidentialité</a>.</div>
    </div></div>
  </main>;
}

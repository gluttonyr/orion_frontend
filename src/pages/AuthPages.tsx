import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, Globe2, Store, X } from "lucide-react";
import { toast } from "../components/ui/sonner";
import { useOrion, type UserRole } from "../OrionContext";

function OrionLogo({ light = false }: { light?: boolean }) {
  return <Link to="/" className={`orion-public-logo ${light ? "is-light" : ""}`} aria-label="Orion accueil"><img src="/orion.jpeg" alt="Logo Orion" /></Link>;
}

type RegistrationFields = {
  nom: string;
  prenom: string;
  contact: string;
  adresse: string;
  date_naissance: string;
  specialite: string;
  localisation: string;
  confirmPassword: string;
};

export function AuthPage({ register = false }: { register?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register: registerUser } = useOrion();
  const authState = location.state as { from?: string; role?: UserRole } | null;
  const [role, setRole] = useState<UserRole>(authState?.role ?? "UTILISATEUR");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fields, setFields] = useState<RegistrationFields>({ nom: "", prenom: "", contact: "", adresse: "", date_naissance: "", specialite: "", localisation: "", confirmPassword: "" });
  const destination = authState?.from ?? "/dashboard";

  const updateField = (field: keyof RegistrationFields, value: string): void => {
    setFields((current) => ({ ...current, [field]: value }));
  };

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

    setIsSubmitting(true);
    try {
      if (register) {
        await registerUser({
          email,
          password,
          role,
          nom: fields.nom,
          prenom: fields.prenom,
          date_naissance: fields.date_naissance,
          adresse: fields.adresse,
          contact: fields.contact,
          specialite: fields.specialite,
          localisation: fields.localisation,
        });
        toast.success("Inscription réussie.");
      } else {
        await login(email, password, role);
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

  return <main className="auth-shell"><div className="auth-visual"><OrionLogo light /><span className="auth-visual-kicker">ORION AFRICA</span><h1>Construire<br /><em>ensemble.</em></h1><p>Une marketplace pour les produits qui comptent et les opportunités qui ouvrent des portes.</p><div className="auth-visual-orbit"><Globe2 size={34} strokeWidth={1} /><span>18 pays · une même énergie</span></div></div><div className="auth-form-side"><Link to="/" className="auth-close"><X size={19} /></Link><div className="auth-form-wrap"><span className="public-kicker">{register ? "BIENVENUE DANS LE RÉSEAU" : "BON RETOUR"}</span><h1>{register ? "Créer votre espace." : "Ravi de vous revoir."}</h1><p>{register ? "Renseignez vos informations puis choisissez votre profil." : "Connectez-vous pour retrouver vos boutiques, vos messages et vos opportunités."}</p><form onSubmit={submit}><label>Email professionnel<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vous@exemple.com" /></label><label>Mot de passe<input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" /></label>{register ? <><div className="auth-registration-fields"><label>Prénom<input required value={fields.prenom} onChange={(event) => updateField("prenom", event.target.value)} placeholder="Votre prénom" /></label><label>Nom<input required value={fields.nom} onChange={(event) => updateField("nom", event.target.value)} placeholder="Votre nom" /></label><label>Téléphone<input required value={fields.contact} onChange={(event) => updateField("contact", event.target.value)} placeholder="+225 07 00 00 00 00" /></label><label>Adresse<input required value={fields.adresse} onChange={(event) => updateField("adresse", event.target.value)} placeholder="Votre adresse" /></label><label>Date de naissance<input required type="date" value={fields.date_naissance} onChange={(event) => updateField("date_naissance", event.target.value)} /></label><label>Spécialité<input required value={fields.specialite} onChange={(event) => updateField("specialite", event.target.value)} placeholder={role === "COMMERCANT" ? "Commerce, mode, beauté..." : "Votre domaine d'activité"} /></label><label>Localisation<input required value={fields.localisation} onChange={(event) => updateField("localisation", event.target.value)} placeholder="Ville, pays" /></label><label>Confirmer le mot de passe<input required type="password" value={fields.confirmPassword} onChange={(event) => updateField("confirmPassword", event.target.value)} placeholder="••••••••" /></label></div><div className="auth-role-picker"><span>Je suis...</span><div><button type="button" className={role === "COMMERCANT" ? "is-active" : ""} onClick={() => setRole("COMMERCANT")}><Store size={17} /><strong>Commerçant</strong><small>Je vends et je développe mon commerce</small></button><button type="button" className={role === "UTILISATEUR" ? "is-active" : ""} onClick={() => setRole("UTILISATEUR")}><BriefcaseBusiness size={17} /><strong>Jeune entrepreneur</strong><small>Je cherche des missions et des connexions</small></button></div></div></> : <button type="button" className="auth-forgot">Mot de passe oublié ?</button>}{error ? <p className="auth-error">{error}</p> : null}<button type="submit" className="public-primary-button auth-submit" disabled={isSubmitting}>{isSubmitting ? "Chargement..." : register ? "Créer mon espace" : "Se connecter"} <ArrowRight size={17} /></button></form><div className="auth-switch">{register ? <>Vous avez déjà un compte ? <Link to="/login" state={authState?.from ? { from: authState.from } : undefined}>Se connecter</Link></> : <>Pas encore de compte ? <Link to="/register" state={authState?.from ? { from: authState.from } : undefined}>Rejoindre Orion</Link></>}</div><div className="auth-legal">En continuant, vous acceptez les <a href="#terms">conditions d'utilisation</a> et la <a href="#privacy">politique de confidentialité</a>.</div></div></div></main>;
}

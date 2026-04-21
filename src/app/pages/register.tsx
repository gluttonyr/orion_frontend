import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, User, Phone, Eye, EyeOff, Store, Briefcase, ArrowRight, ArrowLeft } from "lucide-react";
import { UserRole } from "../model/model";
import { userService } from "../service/utilisateur.service";

type Step = "form" | "role";

export function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("form");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    phone: "",
    adresse: "",
    date_naissance: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1 : valider le formulaire et passer au choix du rôle
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setStep("role");
  };

  // Step 2 : appel API register avec le rôle choisi
  const handleRoleSelect = async (role: UserRole) => {
    setIsLoading(true);
    setError(null);

    try {
      await userService.register({
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        adresse: formData.adresse,
        date_naissance: formData.date_naissance,
        password: formData.password,
        role,
      });

      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Une erreur est survenue lors de l'inscription."
      );
      setStep("form"); // revenir au formulaire en cas d'erreur
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-700 to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white border-4 border-white shadow-lg mb-4">
            <span className="text-3xl font-bold text-primary">O</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {step === "form" ? "Rejoignez Orion" : "Choisissez votre profil"}
          </h1>
          <p className="text-blue-100">
            {step === "form"
              ? "Créez votre compte gratuitement"
              : "Sélectionnez le type de compte qui correspond à votre activité"}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border-2 border-red-400 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* ── STEP 1 : Formulaire ── */}
        {step === "form" && (
          <div className="bg-white shadow-xl p-8 border-4 border-white">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Inscription</h2>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Prénom + Nom */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Prénom</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      placeholder="Prénom"
                      className="w-full pl-10 pr-3 py-3 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Nom</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Nom"
                    className="w-full px-3 py-3 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Adresse email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="exemple@email.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+228 XX XXX XX XX"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Date de naissance */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Date de naissance</label>
                <input
                  type="date"
                  name="date_naissance"
                  value={formData.date_naissance}
                  onChange={handleChange}
                  placeholder="2005-01-01"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Adresse */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Adresse</label>
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  placeholder="Votre adresse"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirmer mot de passe */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Confirmer le mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* CGU */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 mt-1 border-2 border-gray-300 text-primary focus:ring-primary"
                  required
                />
                <span className="text-sm text-gray-600">
                  J'accepte les{" "}
                  <a href="#" className="text-primary hover:text-blue-700">conditions d'utilisation</a>
                  {" "}et la{" "}
                  <a href="#" className="text-primary hover:text-blue-700">politique de confidentialité</a>
                </span>
              </label>

              {/* Bouton suivant */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg border-2 border-primary"
              >
                <span>Continuer</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Déjà inscrit ?{" "}
                <Link to="/login" className="text-primary font-medium hover:text-blue-700">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 2 : Choix du rôle ── */}
        {step === "role" && (
          <div className="space-y-4">
            {/* Bouton retour */}
            <button
              onClick={() => setStep("form")}
              className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au formulaire
            </button>

            {/* Carte Commerçant */}
            <button
              onClick={() => handleRoleSelect(UserRole.COMMERCANT)}
              disabled={isLoading}
              className="w-full bg-white shadow-xl p-6 hover:shadow-2xl transition-all text-left group border-4 border-white hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-blue-600 border-4 border-blue-200 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Store className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">Commerçant</h3>
                  <p className="text-gray-500 text-sm mb-3">
                    Vendez vos produits, gérez votre inventaire et développez votre commerce.
                  </p>
                  <ul className="space-y-1">
                    {["Gestion des stocks et ventes", "Analyses et statistiques", "Marketplace intégrée"].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-gray-600 text-sm">
                        <div className="w-1.5 h-1.5 bg-primary flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <ArrowRight className="w-5 h-5 text-primary self-center group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Carte Entrepreneur */}
            <button
              onClick={() => handleRoleSelect(UserRole.UTILISATEUR)}
              disabled={isLoading}
              className="w-full bg-white shadow-xl p-6 hover:shadow-2xl transition-all text-left group border-4 border-white hover:border-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-secondary to-green-600 border-4 border-green-200 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">Jeune Entrepreneur</h3>
                  <p className="text-gray-500 text-sm mb-3">
                    Accédez à des opportunités, formations et financements pour votre projet.
                  </p>
                  <ul className="space-y-1">
                    {["Opportunités de financement", "Formations gratuites", "Réseau de mentors"].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-gray-600 text-sm">
                        <div className="w-1.5 h-1.5 bg-secondary flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <ArrowRight className="w-5 h-5 text-secondary self-center group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {isLoading && (
              <p className="text-center text-blue-100 text-sm animate-pulse">
                Création du compte en cours...
              </p>
            )}

            <p className="text-center text-blue-100 text-xs">
              Vous pourrez modifier votre profil à tout moment dans les paramètres
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
import { useNavigate } from "react-router";
import { Store, Briefcase, ArrowRight } from "lucide-react";

export function ProfileSelection() {
  const navigate = useNavigate();

  const handleSelect = (type: string) => {
    // Store profile type and navigate
    localStorage.setItem("userType", type);

    // Si c'est un commerçant, rediriger vers la sélection de boutique
    if (type === "merchant") {
      navigate("/store-selection");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-700 to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white border-4 border-white shadow-lg mb-4">
            <span className="text-3xl font-bold text-primary">O</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Choisissez votre profil</h1>
          <p className="text-blue-100 text-lg">Sélectionnez le type de compte qui correspond à votre activité</p>
        </div>

        {/* Profile Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Merchant Card */}
          <button
            onClick={() => handleSelect("merchant")}
            className="bg-white shadow-xl p-8 hover:shadow-2xl transition-all hover:-translate-y-1 text-left group border-4 border-white hover:border-primary"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 border-4 border-blue-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Store className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Commerçant</h3>
            
            <p className="text-gray-600 mb-6">
              Vendez vos produits, gérez votre inventaire et développez votre commerce avec nos outils professionnels.
            </p>

            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-gray-600">
                <div className="w-1.5 h-1.5 bg-primary"></div>
                <span>Gestion des stocks et ventes</span>
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <div className="w-1.5 h-1.5 bg-primary"></div>
                <span>Analyses et statistiques</span>
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <div className="w-1.5 h-1.5 bg-primary"></div>
                <span>Marketplace intégrée</span>
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <div className="w-1.5 h-1.5 bg-primary"></div>
                <span>Messagerie clients</span>
              </li>
            </ul>

            <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
              <span>Continuer comme commerçant</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>

          {/* Entrepreneur Card */}
          <button
            onClick={() => handleSelect("entrepreneur")}
            className="bg-white shadow-xl p-8 hover:shadow-2xl transition-all hover:-translate-y-1 text-left group border-4 border-white hover:border-secondary"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-secondary to-green-600 border-4 border-green-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Jeune Entrepreneur</h3>
            
            <p className="text-gray-600 mb-6">
              Accédez à des opportunités, formations et financements pour lancer et développer votre projet entrepreneurial.
            </p>

            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-gray-600">
                <div className="w-1.5 h-1.5 bg-secondary"></div>
                <span>Opportunités de financement</span>
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <div className="w-1.5 h-1.5 bg-secondary"></div>
                <span>Formations gratuites</span>
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <div className="w-1.5 h-1.5 bg-secondary"></div>
                <span>Réseau de mentors</span>
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <div className="w-1.5 h-1.5 bg-secondary"></div>
                <span>Marketplace d'achat</span>
              </li>
            </ul>

            <div className="flex items-center gap-2 text-secondary font-medium group-hover:gap-3 transition-all">
              <span>Continuer comme entrepreneur</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-center text-blue-100 text-sm mt-8">
          Vous pourrez modifier votre profil à tout moment dans les paramètres
        </p>
      </div>
    </div>
  );
}

import { useNavigate } from "react-router";
import { Store, Building2, Plus, MapPin, Tag } from "lucide-react";
import { useStore } from "../lib/store-context";
import { isMerchant } from "../lib/user-context";
import { useEffect } from "react";

export function StoreSelection() {
  const navigate = useNavigate();
  const { stores, setActiveStore } = useStore();

  useEffect(() => {
    // Si l'utilisateur n'est pas un commerçant, rediriger
    if (!isMerchant()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSelectStore = (store: typeof stores[0]) => {
    setActiveStore(store);
    navigate("/dashboard");
  };

  const handleCreateStore = () => {
    navigate("/dashboard/stores/add");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary border-4 border-secondary flex items-center justify-center">
              <span className="text-white font-bold text-2xl">O</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sélectionnez votre boutique
          </h1>
          <p className="text-gray-600">
            Choisissez la boutique que vous souhaitez gérer
          </p>
        </div>

        {/* Stores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {stores.map((store) => (
            <button
              key={store.id}
              onClick={() => handleSelectStore(store)}
              className="bg-white border-4 border-gray-200 p-6 hover:border-primary hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary border-2 border-secondary flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform overflow-hidden">
                  {store.logo ? (
                    <img
                      src={store.logo}
                      alt={store.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Store className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {store.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {store.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      {store.location}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Tag className="w-3 h-3" />
                      {store.category}
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}

          {/* Create New Store Card */}
          <button
            onClick={handleCreateStore}
            className="bg-white border-4 border-dashed border-gray-300 p-6 hover:border-primary hover:bg-gray-50 transition-all flex flex-col items-center justify-center min-h-[160px] group"
          >
            <div className="w-12 h-12 bg-gray-100 border-2 border-gray-300 flex items-center justify-center text-gray-400 mb-3 group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-700 mb-1 group-hover:text-primary transition-colors">
              Créer une nouvelle boutique
            </h3>
            <p className="text-sm text-gray-500">
              Ajoutez un nouveau point de vente
            </p>
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-4 border-blue-200 p-4 flex items-start gap-3">
          <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-900 font-medium mb-1">
              Gestion multi-boutiques
            </p>
            <p className="text-sm text-blue-700">
              Vous pouvez gérer plusieurs boutiques et basculer entre elles à
              tout moment depuis votre tableau de bord.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

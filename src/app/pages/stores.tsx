import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Store as StoreIcon,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Tag,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useStore } from "../lib/store-context";
import { useSubscription, planDetails } from "../lib/subscription-context";
import { useImage } from "../lib/image-context";

export function Stores() {
  const { stores, activeStore, deleteStore, updateStore } = useStore();
  const { subscription } = useSubscription();
  const { getBoutiqueImageUrl } = useImage();
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const canAddStore = subscription
    ? stores.length < planDetails[subscription.plan].maxStores
    : false;

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteStore(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const toggleStoreStatus = (id: string, currentStatus: boolean) => {
    updateStore(id, { active: !currentStatus });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mes Boutiques
          </h1>
          <p className="text-gray-600">
            Gérez toutes vos boutiques en un seul endroit
            {subscription && (
              <span className="ml-2 text-sm">
                ({stores.length}/{planDetails[subscription.plan].maxStores === 999 ? "∞" : planDetails[subscription.plan].maxStores})
              </span>
            )}
          </p>
        </div>
        {canAddStore ? (
          <Link
            to="/dashboard/stores/add"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-blue-700 text-white font-medium transition-all shadow-md hover:shadow-lg border-2 border-primary active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Boutique
          </Link>
        ) : (
          <div className="relative group">
            <button
              disabled
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-500 font-medium border-2 border-gray-300 cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              Nouvelle Boutique
            </button>
            <div className="hidden group-hover:block absolute right-0 top-full mt-2 w-64 bg-white border-4 border-orange-200 p-4 shadow-lg z-10">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Limite atteinte
                  </p>
                  <p className="text-xs text-gray-600 mb-2">
                    Vous avez atteint la limite de boutiques de votre plan.
                  </p>
                  <Link
                    to="/dashboard/subscriptions"
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Améliorer mon plan →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Store Banner */}
      {activeStore && (
        <div className="bg-gradient-to-r from-primary to-secondary border-4 border-primary p-4 mb-6">
          <div className="flex items-center gap-3 text-white">
            <StoreIcon className="w-6 h-6" />
            <div>
              <p className="text-sm opacity-90">Boutique active</p>
              <p className="font-bold text-lg">{activeStore.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stores List */}
      <div className="space-y-4">
        {stores.length === 0 ? (
          <div className="bg-white border-4 border-gray-200 p-12 text-center">
            <StoreIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Aucune boutique
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez par créer votre première boutique
            </p>
            <Link
              to="/dashboard/stores/add"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-blue-700 text-white font-medium transition-all shadow-md hover:shadow-lg border-2 border-primary active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Créer une boutique
            </Link>
          </div>
        ) : (
          stores.map((store) => (
            <div
              key={store.id}
              className={`bg-white border-4 p-6 ${
                activeStore?.id === store.id
                  ? "border-primary shadow-lg"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 border-2 flex items-center justify-center text-white flex-shrink-0 ${
                    activeStore?.id === store.id
                      ? "bg-gradient-to-br from-primary to-secondary border-primary"
                      : "bg-gray-400 border-gray-400"
                  }`}
                >
                  {store.logo ? (
                    <img
                      src={getBoutiqueImageUrl(store.logo)}
                      alt={store.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <StoreIcon className="w-7 h-7" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {store.name}
                        {activeStore?.id === store.id && (
                          <span className="ml-2 text-xs bg-primary text-white px-2 py-1 border-2 border-primary">
                            ACTIVE
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-600">{store.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          toggleStoreStatus(store.id, store.active)
                        }
                        className={`p-2 border-2 transition-all ${
                          store.active
                            ? "text-secondary border-secondary hover:bg-secondary hover:text-white"
                            : "text-gray-400 border-gray-300 hover:border-gray-400"
                        }`}
                        title={
                          store.active
                            ? "Boutique active"
                            : "Boutique désactivée"
                        }
                      >
                        {store.active ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {store.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Tag className="w-4 h-4" />
                      {store.category}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      Créée le{" "}
                      {new Date(store.createdAt).toLocaleDateString("fr-FR")}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/dashboard/stores/edit/${store.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 hover:border-primary hover:text-primary transition-all font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </Link>
                    <button
                      onClick={() => handleDelete(store.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2 border-2 font-medium transition-all ${
                        deleteConfirm === store.id
                          ? "bg-red-600 border-red-600 text-white"
                          : "bg-white border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600"
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                      {deleteConfirm === store.id
                        ? "Confirmer ?"
                        : "Supprimer"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
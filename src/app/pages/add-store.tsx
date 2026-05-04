import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { Store, ArrowLeft, Upload, X } from "lucide-react";
import { useStore } from "../lib/store-context";

export function AddStore() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { stores, addStore, updateStore } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!id;
  const existingStore = stores.find((s) => s.id === id);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    location: "",
    logo: "",
    active: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (isEditing && existingStore) {
      setFormData({
        name: existingStore.name,
        description: existingStore.description,
        category: existingStore.category,
        location: existingStore.location,
        logo: existingStore.logo || "",
        active: existingStore.active,
      });
    }
  }, [isEditing, existingStore]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setFormData({ ...formData, logo: objectUrl });
    }
  };

  const removeLogo = () => {
    if (formData.logo && formData.logo.startsWith('blob:')) {
      try { URL.revokeObjectURL(formData.logo); } catch {}
    }
    setSelectedFile(null);
    setFormData({ ...formData, logo: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && id) {
      await updateStore(id, formData);
    } else {
      await addStore({ ...formData, file: selectedFile });
    }

    navigate("/dashboard/stores");
  };

  const categories = [
    "Électronique",
    "Mode & Accessoires",
    "Alimentation",
    "Beauté & Santé",
    "Maison & Jardin",
    "Sport & Loisirs",
    "Automobile",
    "Autre",
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/dashboard/stores")}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour aux boutiques
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditing ? "Modifier la boutique" : "Créer une nouvelle boutique"}
        </h1>
        <p className="text-gray-600">
          {isEditing
            ? "Mettez à jour les informations de votre boutique"
            : "Ajoutez un nouveau point de vente à votre réseau"}
        </p>
      </div>

      {/* Form */}
      <div className="bg-white border-4 border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Logo de la boutique
            </label>
            {formData.logo ? (
              <div className="relative w-32 h-32 border-2 border-gray-300 bg-gray-50">
                <img
                  src={formData.logo}
                  alt="Logo boutique"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 hover:border-primary hover:text-primary transition-all font-medium"
                >
                  <Upload className="w-5 h-5" />
                  Télécharger un logo
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  PNG, JPG jusqu'à 5MB. Recommandé: 200x200px
                </p>
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Nom de la boutique *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="ex: Boutique Central Market"
              className="w-full px-4 py-3 border-2 border-gray-300 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Décrivez votre boutique..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 focus:border-primary focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Catégorie *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-300 focus:border-primary focus:outline-none transition-colors bg-white"
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Localisation *
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="ex: Dakar Central"
              className="w-full px-4 py-3 border-2 border-gray-300 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 border-2 border-gray-200">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) =>
                setFormData({ ...formData, active: e.target.checked })
              }
              className="w-5 h-5 border-2 border-gray-300 text-primary focus:ring-2 focus:ring-primary"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-900">
              Boutique active
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-blue-700 text-white font-medium transition-all shadow-md hover:shadow-lg border-2 border-primary active:scale-95"
            >
              <Store className="w-5 h-5" />
              {isEditing ? "Mettre à jour" : "Créer la boutique"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard/stores")}
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 font-medium transition-all active:scale-95"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>

      {/* Info */}
      <div className="mt-6 bg-blue-50 border-4 border-blue-200 p-4">
        <p className="text-sm text-blue-900 font-medium mb-1">
          💡 Conseil
        </p>
        <p className="text-sm text-blue-700">
          Chaque boutique aura ses propres produits, commandes et statistiques.
          Vous pourrez basculer entre vos boutiques à tout moment depuis le
          tableau de bord.
        </p>
      </div>
    </div>
  );
}

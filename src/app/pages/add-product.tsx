import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Upload, X, Save, Package, Tag } from "lucide-react";

import type { produits, Categorie } from "../model/model";
import { produitService } from "../service/produit.service";
import { categorieService } from "../service/categorie.service";

export function AddProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Categorie[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [formData, setFormData] = useState<Partial<produits>>({
    nom: "",
    description: "",
    prix: 0,
    stock: 0,
    statut: "En stock",
    categorie: undefined,
  });

  // Image principale (File ou URL existante)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Charger les catégories depuis le backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const data = await categorieService.getAll();
        setCategories(data);
      } catch (err) {
        console.error("Erreur lors du chargement des catégories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Charger le produit existant en mode édition
  useEffect(() => {
    if (!isEdit || !id) return;

    const fetchProduit = async () => {
      try {
        setFetchLoading(true);
        const data = await produitService.getById(Number(id));
        setFormData({
          nom: data.nom,
          description: data.description,
          prix: data.prix,
          stock: data.stock,
          statut: data.statut,
          categorie: data.categorie,
        });
        if (data.image) {
          setImagePreview(`http://localhost:3000/uploads/${data.image}`);
        }
      } catch (err) {
        console.error("Erreur lors du chargement du produit:", err);
        setError("Impossible de charger le produit.");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchProduit();
  }, [id, isEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "prix" || name === "stock" ? Number(value) : value,
    }));
  };

  // Handler spécifique pour la catégorie (on stocke l'objet Categorie complet)
  const handleCategorieChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    const selectedCategorie = categories.find((c) => c.id === selectedId);
    setFormData((prev) => ({
      ...prev,
      categorie: selectedCategorie,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEdit && id) {
        await produitService.update(
          Number(id),
          formData,
          imageFile ?? undefined
        );
      } else {
        await produitService.create(formData, imageFile ?? undefined);
      }
      navigate("/dashboard/products");
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/dashboard/products")}
          className="p-2 text-gray-600 hover:text-primary transition-colors border-2 border-gray-200 hover:border-primary"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? "Modifier le produit" : "Ajouter un produit"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit
              ? "Mettez à jour les informations de votre produit"
              : "Créez un nouveau produit pour votre catalogue"}
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 text-sm font-medium flex items-center gap-3">
          <X className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto font-bold">✕</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Section */}
        <div className="bg-white shadow-md p-6 md:p-8 border-4 border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Image du produit</h2>
          <p className="text-sm text-gray-600 mb-4">
            Ajoutez une image principale pour votre produit.
          </p>

          {imagePreview ? (
            <div className="relative inline-block group">
              <img
                src={imagePreview}
                alt="Aperçu"
                className="w-48 h-48 object-cover border-4 border-gray-200"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white hover:bg-red-600 transition-colors border-2 border-red-600"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary text-white text-xs font-medium border-2 border-primary">
                Image principale
              </div>
            </div>
          ) : (
            <label className="block cursor-pointer max-w-xs">
              <div className="border-4 border-dashed border-gray-300 hover:border-primary transition-colors p-8 text-center bg-gray-50">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-700 font-medium mb-1">
                  Cliquez pour télécharger
                </p>
                <p className="text-sm text-gray-500">PNG, JPG jusqu'à 5MB</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Product Information */}
        <div className="bg-white shadow-md p-6 md:p-8 border-4 border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations du produit</h2>

          <div className="space-y-5">
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du produit *
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Ex: Samsung Galaxy S24"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Décrivez votre produit en détail..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                required
              />
            </div>

            {/* Prix & Stock */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix (XOF) *
                </label>
                <input
                  type="number"
                  name="prix"
                  value={formData.prix}
                  onChange={handleChange}
                  placeholder="150000"
                  min="0"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité en stock *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="50"
                  min="0"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Catégorie & Statut */}
            <div className="grid sm:grid-cols-2 gap-5">
              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    Catégorie *
                  </span>
                </label>
                {categoriesLoading ? (
                  <div className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 flex items-center gap-2 text-gray-400">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                    <span className="text-sm">Chargement...</span>
                  </div>
                ) : (
                  <select
                    name="categorie"
                    value={formData.categorie?.id ?? ""}
                    onChange={handleCategorieChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  >
                    <option value="" disabled>
                      Sélectionner une catégorie
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.libellé}
                      </option>
                    ))}
                  </select>
                )}
                {!categoriesLoading && categories.length === 0 && (
                  <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    Aucune catégorie disponible. Créez-en une d'abord.
                  </p>
                )}
              </div>

              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut *
                </label>
                <select
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                >
                  <option value="En stock">En stock</option>
                  <option value="Stock limité">Stock limité</option>
                  <option value="Sur commande">Sur commande</option>
                  <option value="Rupture de stock">Rupture de stock</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate("/dashboard/products")}
            className="px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 transition-colors font-medium"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading || categoriesLoading}
            className="px-6 py-3 bg-primary text-white hover:bg-blue-700 transition-colors font-medium shadow-md border-2 border-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{isEdit ? "Enregistrer les modifications" : "Ajouter le produit"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
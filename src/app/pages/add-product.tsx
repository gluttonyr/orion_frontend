import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Upload, X, Save, Image as ImageIcon } from "lucide-react";
import { products } from "../lib/mock-data";

export function AddProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  // Charger le produit existant si on est en mode édition
  const existingProduct = isEdit ? products.find(p => p.id === id) : null;

  const [formData, setFormData] = useState({
    name: existingProduct?.name || "",
    description: existingProduct?.description || "",
    category: existingProduct?.category || "Électronique",
    price: existingProduct?.price || "",
    stock: existingProduct?.stock || "",
    availability: existingProduct?.availability || "En stock",
  });

  const [images, setImages] = useState<string[]>(existingProduct?.images || []);
  const [imagePreview, setImagePreview] = useState<string[]>(existingProduct?.images || []);

  const categories = ["Électronique", "Alimentation", "Mode", "Équipement", "Beauté", "Autre"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPreviews: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === files.length) {
            setImagePreview([...imagePreview, ...newPreviews]);
            setImages([...images, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImagePreview(imagePreview.filter((_, i) => i !== index));
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simuler l'enregistrement
    console.log("Produit sauvegardé:", { ...formData, images });
    navigate("/dashboard/products");
  };

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
            {isEdit ? "Mettez à jour les informations de votre produit" : "Créez un nouveau produit pour votre catalogue"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images Section */}
        <div className="bg-white shadow-md p-6 md:p-8 border-4 border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Images du produit</h2>
          <p className="text-sm text-gray-600 mb-4">
            Ajoutez jusqu'à 5 images de votre produit. La première image sera l'image principale.
          </p>

          {/* Image Preview Grid */}
          {imagePreview.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
              {imagePreview.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-40 object-cover border-4 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white hover:bg-red-600 transition-colors border-2 border-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary text-white text-xs font-medium border-2 border-primary">
                      Image principale
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          {imagePreview.length < 5 && (
            <label className="block cursor-pointer">
              <div className="border-4 border-dashed border-gray-300 hover:border-primary transition-colors p-8 text-center bg-gray-50">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-700 font-medium mb-1">
                  Cliquez pour télécharger des images
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG jusqu'à 5MB ({5 - imagePreview.length} restantes)
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
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
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du produit *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
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

            {/* Category and Price Row */}
            <div className="grid sm:grid-cols-2 gap-5">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix (XOF) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="150000"
                  min="0"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Stock and Availability Row */}
            <div className="grid sm:grid-cols-2 gap-5">
              {/* Stock */}
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

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disponibilité *
                </label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                >
                  <option value="En stock">En stock</option>
                  <option value="Stock limité">Stock limité</option>
                  <option value="Sur commande">Sur commande</option>
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
            className="px-6 py-3 bg-primary text-white hover:bg-blue-700 transition-colors font-medium shadow-md border-2 border-primary flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            <span>{isEdit ? "Enregistrer les modifications" : "Ajouter le produit"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { CreditCard, ArrowLeft, Upload, X } from "lucide-react";
import { useWithdrawalMethods } from "../lib/withdrawal-methods-context";

export function AddWithdrawalMethod() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { methods, addMethod, updateMethod } = useWithdrawalMethods();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!id;
  const existingMethod = methods.find((m) => m.id === id);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: "",
    accountNumber: "",
    accountName: "",
    active: true,
  });

  useEffect(() => {
    if (isEditing && existingMethod) {
      setFormData({
        name: existingMethod.name,
        description: existingMethod.description,
        logo: existingMethod.logo,
        accountNumber: existingMethod.accountNumber || "",
        accountName: existingMethod.accountName || "",
        active: existingMethod.active,
      });
    }
  }, [isEditing, existingMethod]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setFormData({ ...formData, logo: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && id) {
      updateMethod(id, formData);
    } else {
      addMethod(formData);
    }

    navigate("/dashboard/withdrawal-methods");
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/dashboard/withdrawal-methods")}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour aux moyens de retrait
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditing ? "Modifier le moyen de retrait" : "Ajouter un moyen de retrait"}
        </h1>
        <p className="text-gray-600">
          {isEditing
            ? "Mettez à jour les informations de votre moyen de retrait"
            : "Ajoutez un nouveau compte pour recevoir vos gains"}
        </p>
      </div>

      {/* Form */}
      <div className="bg-white border-4 border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Logo du service *
            </label>
            {formData.logo ? (
              <div className="relative w-32 h-32 border-2 border-gray-300 bg-gray-50">
                <img
                  src={formData.logo}
                  alt="Logo"
                  className="w-full h-full object-contain p-2"
                />
                <button
                  title="remove logo"
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
                  PNG, JPG jusqu'à 5MB. Recommandé: format carré 200x200px
                </p>
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Nom du service *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="ex: Orange Money, Wave, TMoney"
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
              placeholder="Décrivez brièvement ce moyen de retrait..."
              rows={2}
              className="w-full px-4 py-3 border-2 border-gray-300 focus:border-primary focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Numéro de compte / Téléphone
            </label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) =>
                setFormData({ ...formData, accountNumber: e.target.value })
              }
              placeholder="ex: +221 77 123 45 67"
              className="w-full px-4 py-3 border-2 border-gray-300 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Account Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Nom du titulaire
            </label>
            <input
              type="text"
              value={formData.accountName}
              onChange={(e) =>
                setFormData({ ...formData, accountName: e.target.value })
              }
              placeholder="ex: Amadou Diallo"
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
              Moyen de retrait actif
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-blue-700 text-white font-medium transition-all shadow-md hover:shadow-lg border-2 border-primary active:scale-95"
            >
              <CreditCard className="w-5 h-5" />
              {isEditing ? "Mettre à jour" : "Ajouter le moyen"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard/withdrawal-methods")}
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
          💡 Conseil de sécurité
        </p>
        <p className="text-sm text-blue-700">
          Vérifiez bien les informations de votre compte avant de les
          enregistrer. En cas d'erreur, vos retraits pourraient échouer ou être
          envoyés à un mauvais destinataire.
        </p>
      </div>
    </div>
  );
}

import { User, Mail, Phone, MapPin, Store, Camera, Save, X } from "lucide-react";
import { useState } from "react";

export function Profile() {
  const userType = localStorage.getItem("userType") || "merchant";
  
  // State pour les infos utilisateur
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "Amadou Diallo",
    email: "amadou.diallo@email.com",
    phone: "+221 77 123 45 67",
    location: "Dakar, Sénégal",
    storeName: "Tech Store Dakar",
    description: "Spécialiste en électronique et équipements professionnels. Livraison rapide dans toute la région.",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    // En production, envoyer à l'API
    console.log("Profil mis à jour:", formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Réinitialiser les données
    setFormData({
      fullName: "Amadou Diallo",
      email: "amadou.diallo@email.com",
      phone: "+221 77 123 45 67",
      location: "Dakar, Sénégal",
      storeName: "Tech Store Dakar",
      description: "Spécialiste en électronique et équipements professionnels. Livraison rapide dans toute la région.",
    });
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-600 mt-1">Gérez vos informations personnelles et préférences</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 bg-primary text-white hover:bg-blue-700 transition-colors font-medium border-2 border-primary"
          >
            Modifier le profil
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-primary to-secondary shadow-md p-8 text-white border-4 border-secondary">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 bg-white border-4 border-white flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-primary" />
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-0 right-0 w-10 h-10 bg-white text-primary border-2 border-white flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <Camera className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold mb-2">{formData.fullName}</h2>
            <p className="text-blue-100 mb-4">
              {userType === "merchant" ? "Commerçant" : "Jeune Entrepreneur"}
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-sm border-2 border-white/30">
                Membre depuis Mars 2025
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-sm border-2 border-white/30">
                87 ventes
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-sm border-2 border-white/30">
                ⭐ 4.8/5
              </span>
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="bg-blue-50 border-4 border-blue-200 p-4">
          <p className="text-sm text-blue-700">
            💡 Mode édition activé. Modifiez vos informations ci-dessous puis cliquez sur "Enregistrer".
          </p>
        </div>
      )}

      {/* Information Sections */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white shadow-md p-6 border-4 border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations personnelles</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
              {isEditing ? (
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              ) : (
                <div className="flex items-center gap-4 p-4 bg-gray-50 border-2 border-gray-100">
                  <User className="w-5 h-5 text-primary flex-shrink-0" />
                  <p className="font-medium text-gray-900">{formData.fullName}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              ) : (
                <div className="flex items-center gap-4 p-4 bg-gray-50 border-2 border-gray-100">
                  <Mail className="w-5 h-5 text-secondary flex-shrink-0" />
                  <p className="font-medium text-gray-900 break-all">{formData.email}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              ) : (
                <div className="flex items-center gap-4 p-4 bg-gray-50 border-2 border-gray-100">
                  <Phone className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <p className="font-medium text-gray-900">{formData.phone}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Localisation</label>
              {isEditing ? (
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              ) : (
                <div className="flex items-center gap-4 p-4 bg-gray-50 border-2 border-gray-100">
                  <MapPin className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <p className="font-medium text-gray-900 break-words">{formData.location}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Business Information */}
        {userType === "merchant" && (
          <div className="bg-white shadow-md p-6 border-4 border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations commerciales</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la boutique</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 border-2 border-gray-100">
                    <Store className="w-5 h-5 text-primary flex-shrink-0" />
                    <p className="font-medium text-gray-900 break-words">{formData.storeName}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégories</label>
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 border-2 border-gray-100">
                  <span className="px-3 py-1 bg-primary text-white text-sm border-2 border-primary">Électronique</span>
                  <span className="px-3 py-1 bg-secondary text-white text-sm border-2 border-secondary">Équipement</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                {isEditing ? (
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                ) : (
                  <div className="p-4 bg-gray-50 border-2 border-gray-100">
                    <p className="text-gray-900 break-words">{formData.description}</p>
                  </div>
                )}
              </div>

              {!isEditing && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-green-50 border-4 border-blue-100">
                    <p className="text-sm text-gray-600 mb-1">Total des ventes</p>
                    <p className="text-2xl font-bold text-primary">2.45M FCFA</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-green-50 border-4 border-green-100">
                    <p className="text-sm text-gray-600 mb-1">Note moyenne</p>
                    <p className="text-2xl font-bold text-secondary">4.8 ⭐</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Entrepreneur Stats */}
        {userType === "entrepreneur" && (
          <div className="bg-white shadow-md p-6 border-4 border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Progression entrepreneuriale</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-green-50 border-4 border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">Formations complétées</p>
                  <span className="text-2xl font-bold text-primary">3/5</span>
                </div>
                <div className="w-full bg-gray-200 h-3 border-2 border-gray-300">
                  <div className="bg-gradient-to-r from-primary to-secondary h-full" style={{ width: "60%" }}></div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-green-50 border-4 border-green-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">Missions accomplies</p>
                  <span className="text-2xl font-bold text-secondary">12</span>
                </div>
                <p className="text-sm text-gray-600">+45 points de réputation</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-green-50 border-4 border-purple-100">
                <p className="font-medium text-gray-900 mb-2">Certifications</p>
                <div className="space-y-2">
                  <span className="inline-block px-3 py-1 bg-white text-sm text-gray-700 border-2 border-blue-200">
                    ✓ Marketing Digital
                  </span>
                  <span className="inline-block px-3 py-1 bg-white text-sm text-gray-700 border-2 border-blue-200 ml-2">
                    ✓ Gestion Financière
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save/Cancel Buttons */}
      {isEditing && (
        <div className="flex gap-4 justify-end">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-8 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
          >
            <X className="w-5 h-5" />
            <span>Annuler</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-3 bg-secondary text-white hover:bg-green-600 transition-colors font-medium border-2 border-secondary"
          >
            <Save className="w-5 h-5" />
            <span>Enregistrer</span>
          </button>
        </div>
      )}
    </div>
  );
}
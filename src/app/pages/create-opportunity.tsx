import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Save } from "lucide-react";
import { useState, useEffect } from "react";

export function CreateOpportunity() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: "",
    type: "Emploi",
    description: "",
    fullDescription: "",
    location: "",
    amount: "",
    paymentFrequency: "Mois",
    duration: "",
    deadline: "",
    requirements: "",
  });

  // Charger les données si on est en mode édition
  useEffect(() => {
    if (isEditing) {
      // En production, charger depuis l'API
      // Pour le moment, utiliser des données mock
      const mockData = {
        title: "Développeur Web Front-End",
        type: "Emploi",
        description: "Nous recherchons un développeur web expérimenté en React et TypeScript.",
        fullDescription: "Description complète de l'opportunité...",
        location: "Dakar, Sénégal",
        amount: "500000",
        paymentFrequency: "Mois",
        duration: "6 mois",
        deadline: "2026-04-30",
        requirements: "3+ ans d'expérience en React\nMaîtrise de TypeScript",
      };
      setFormData(mockData);
    }
  }, [isEditing, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // En production, envoyer à l'API
    console.log(isEditing ? "Opportunité modifiée:" : "Opportunité créée:", formData);
    navigate("/dashboard/opportunities");
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div>
        <Link
          to="/dashboard/opportunities"
          className="inline-flex items-center gap-2 text-primary hover:text-blue-700 font-medium mb-4 border-b-2 border-transparent hover:border-primary transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour aux opportunités</span>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? "Modifier l'opportunité" : "Créer une opportunité"}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditing ? "Mettez à jour les informations de votre opportunité" : "Publiez une offre d'emploi, mission ou projet"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white shadow-md border-4 border-gray-100 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations de base</h2>

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-2">
                Titre de l'opportunité *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: Développeur Web Front-End"
                className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Type & Location */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-900 mb-2">
                  Type *
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="Emploi">Emploi</option>
                  <option value="Mission">Mission</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Formation">Formation</option>
                </select>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-900 mb-2">
                  Localisation *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Ex: Dakar, Sénégal"
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
                Description courte *
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Résumé de l'opportunité (max 200 caractères)"
                className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                maxLength={200}
              />
              <p className="text-sm text-gray-500 mt-1">{formData.description.length}/200 caractères</p>
            </div>

            {/* Full Description */}
            <div>
              <label htmlFor="fullDescription" className="block text-sm font-medium text-gray-900 mb-2">
                Description complète *
              </label>
              <textarea
                id="fullDescription"
                name="fullDescription"
                required
                value={formData.fullDescription}
                onChange={handleChange}
                rows={8}
                placeholder="Description détaillée de l'opportunité, responsabilités, etc."
                className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Compensation & Duration */}
        <div className="bg-white shadow-md border-4 border-gray-100 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Rémunération & Durée</h2>

          <div className="space-y-6">
            {/* Amount & Payment Frequency */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-900 mb-2">
                  Montant (FCFA) *
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  required
                  min="0"
                  step="1000"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Ex: 500000"
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="paymentFrequency" className="block text-sm font-medium text-gray-900 mb-2">
                  Fréquence de paiement *
                </label>
                <select
                  id="paymentFrequency"
                  name="paymentFrequency"
                  required
                  value={formData.paymentFrequency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="Jour">Par jour</option>
                  <option value="Semaine">Par semaine</option>
                  <option value="Mois">Par mois</option>
                  <option value="Année">Par année</option>
                  <option value="Projet">Par projet (paiement unique)</option>
                </select>
              </div>
            </div>

            {/* Duration & Deadline */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-900 mb-2">
                  Durée du travail *
                </label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  required
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="Ex: 6 mois, 2 semaines"
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-900 mb-2">
                  Date limite de candidature *
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  required
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Preview of payment */}
            {formData.amount && formData.paymentFrequency && formData.duration && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 border-4 border-blue-100">
                <p className="text-sm text-gray-700">
                  <strong>Aperçu:</strong> {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "XOF",
                    minimumFractionDigits: 0,
                  }).format(Number(formData.amount))} / {formData.paymentFrequency} pendant {formData.duration}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white shadow-md border-4 border-gray-100 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Exigences & Compétences</h2>

          <div>
            <label htmlFor="requirements" className="block text-sm font-medium text-gray-900 mb-2">
              Compétences requises
            </label>
            <textarea
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows={5}
              placeholder="Listez les compétences, expériences et qualifications requises"
              className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Link
            to="/dashboard/opportunities"
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium text-center"
          >
            Annuler
          </Link>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-secondary text-white hover:bg-green-600 transition-colors font-medium shadow-md border-2 border-secondary"
          >
            <Save className="w-5 h-5" />
            <span>Publier l'opportunité</span>
          </button>
        </div>
      </form>
    </div>
  );
}
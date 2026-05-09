import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Save } from "lucide-react";
import { useState, useEffect } from "react";

import { StatutMission, TypeMission, TypePaiement, type Mission } from "../model/model";

import { userService } from "../service/utilisateur.service";
import { mission } from "../service/mission.service";

export function CreateOpportunity() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditing = !!id;

  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<Partial<Mission>>({
    commercantId: 0,
    titre: "",
    localisation: "",
    type: TypeMission.MISSION,
    statut: StatutMission.OUVERTE,
    descriptionCourte: "",
    description: "",
    montant: 0,
    frequencePaiement: TypePaiement.FIXE,
    dureeMission: 1,
    datePublication: new Date().toISOString().split("T")[0],
    dateLimiteCandidature: new Date().toISOString().split("T")[0],
    requis: "",
  });

  // =========================
  // LOAD USER + MISSION
  // =========================
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token") || undefined;
        const currentUser = await userService.getCurrent(token);

        if (isEditing && id) {
          const existingMission = await mission.getById(Number(id));
          const formattedDeadline = existingMission.dateLimiteCandidature
            ? new Date(existingMission.dateLimiteCandidature).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0];

          setFormData({
            ...existingMission,
            commercantId:
              existingMission.commercantId ||
              (existingMission as any).commercant?.id ||
              currentUser.id,
            dateLimiteCandidature: formattedDeadline,
          });
        } else {
          setFormData((prev) => ({ ...prev, commercantId: currentUser.id }));
        }
      } catch (error) {
        console.error("Erreur chargement données :", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEditing]);

  // =========================
  // HANDLE CHANGE
  // =========================
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "montant" ? Number(value) : value,
    }));
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && id) {
        const updatedMission = await mission.update(Number(id), formData);

        console.log("Mission mise à jour :", updatedMission);
      } else {
        const createdMission = await mission.create(formData);

        console.log("Mission créée :", createdMission);
      }

      navigate("/dashboard/opportunities");
    } catch (error) { console.error("Erreur lors de l'enregistrement :", error);}
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (<div className="p-10 text-center">Chargement...</div>);
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div>
        <Link
          to="/dashboard/opportunities"
          className="inline-flex items-center gap-2 text-primary hover:text-blue-700 font-medium mb-4 border-b-2 border-transparent hover:border-primary transition-all">
          <ArrowLeft className="w-5 h-5" />
          <span>Retour aux opportunités</span>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? "Modifier l'opportunité" : "Créer une opportunité"}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditing
            ? "Mettez à jour les informations de votre opportunité"
            : "Publiez une offre d'emploi, mission ou projet"}
        </p>
      </div>
  
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white shadow-md border-4 border-gray-100 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Informations de base
          </h2>
  
          <div className="space-y-6">
            {/* Title & status */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="titre"
                  className="block text-sm font-medium text-gray-900 mb-2">
                  Titre de l'opportunité *
                </label>
                <input
                  type="text"
                  id="titre"
                  name="titre"
                  required
                  value={formData.titre}
                  onChange={handleChange}
                  placeholder="Ex: Développeur Web Front-End"
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"/>
              </div>
  
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-900 mb-2">
                  Statut *
                </label>
                <select
                  id="statut"
                  name="statut"
                  title="statut"
                  required
                  value={formData.statut || "Ouvert"}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                  {Object.values(StatutMission).map((statut) => (
                    <option key={statut} value={statut}>
                      Mission {statut.charAt(0).toUpperCase() + statut.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
  
            {/* Type & Location */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-900 mb-2">
                  Type *
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                  {Object.values(TypeMission).map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
  
              <div>
                <label
                  htmlFor="localisation"
                  className="block text-sm font-medium text-gray-900 mb-2">
                  Localisation *
                </label>
                <input
                  type="text"
                  id="localisation"
                  name="localisation"
                  required
                  value={formData.localisation}
                  onChange={handleChange}
                  placeholder="Ex: Dakar, Sénégal"
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"/>
              </div>
            </div>
  
            {/* Short Description */}
            <div>
              <label
                htmlFor="descriptionCourte"
                className="block text-sm font-medium text-gray-900 mb-2">
                Description courte *
              </label>
              <textarea
                id="descriptionCourte"
                name="descriptionCourte"
                required
                value={formData.descriptionCourte}
                onChange={handleChange}
                rows={3}
                placeholder="Résumé de l'opportunité (max 200 caractères)"
                className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                maxLength={200}/>
              <p className="text-sm text-gray-500 mt-1">
                {formData.descriptionCourte?.length || 0}/200 caractères
              </p>
            </div>
  
            {/* Full Description */}
            <div>
              <label
                htmlFor="fullDescription"
                className="block text-sm font-medium text-gray-900 mb-2">
                Description complète *
              </label>
              <textarea
                id="fullDescription"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={8}
                placeholder="Description détaillée de l'opportunité, responsabilités, etc."
                className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"/>
            </div>
          </div>
        </div>
  
        {/* Compensation & Duration */}
        <div className="bg-white shadow-md border-4 border-gray-100 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Rémunération & Durée
          </h2>
  
          <div className="space-y-6">
            {/* montant & Payment Frequency */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="montant"
                  className="block text-sm font-medium text-gray-900 mb-2">
                  Montant (FCFA) *
                </label>
                <input
                  type="number"
                  id="montant"
                  name="montant"
                  required
                  min="0"
                  step="1000"
                  value={formData.montant}
                  onChange={handleChange}
                  placeholder="Ex: 500000"
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"/>
              </div>
  
              <div>
                <label
                  htmlFor="frequencePaiement"
                  className="block text-sm font-medium text-gray-900 mb-2">
                  Fréquence de paiement *
                </label>
                <select
                  id="frequencePaiement"
                  name="frequencePaiement"
                  required
                  value={formData.frequencePaiement}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                  {Object.values(TypePaiement).map((type) => (
                    <option key={type} value={type}>
                      Par {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
  
            {/* Duration & dateLimiteCandidature */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="dureeMission"
                  className="block text-sm font-medium text-gray-900 mb-2">
                  Durée du travail *
                </label>
                <input
                  type="number"
                  id="dureeMission"
                  name="dureeMission"
                  required
                  min="1"
                  value={formData.dureeMission}
                  onChange={handleChange}
                  placeholder="Ex: de préférence en une durée estimée (ex: 3 pour 3 mois)"
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"/>
              </div>
  
              <div>
                <label
                  htmlFor="dateLimiteCandidature"
                  className="block text-sm font-medium text-gray-900 mb-2">
                  Date limite de candidature *
                </label>
                <input
                  type="date"
                  id="dateLimiteCandidature"
                  name="dateLimiteCandidature"
                  min={new Date().toISOString().split("T")[0]} // Empêche de choisir une date passée
                  required
                  value={formData.dateLimiteCandidature}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"/>
              </div>
            </div>
  
            {/* Preview of payment */}
            {formData.montant &&
              formData.frequencePaiement &&
              formData.dureeMission && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 border-4 border-blue-100">
                  <p className="text-sm text-gray-700">
                    <strong>Aperçu:</strong>{" "}
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "XOF",
                      minimumFractionDigits: 0,
                    }).format(Number(formData.montant))}{" "}
                    / {formData.frequencePaiement} pendant{" "}
                    {formData.dureeMission}
                  </p>
                </div>
              )}
          </div>
        </div>
  
        {/* Requirements */}
        <div className="bg-white shadow-md border-4 border-gray-100 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Exigences & Compétences
          </h2>
  
          <div>
            <label
              htmlFor="requis"
              className="block text-sm font-medium text-gray-900 mb-2">
              Compétences requises
            </label>
            <textarea
              id="requis"
              name="requis"
              value={formData.requis}
              onChange={handleChange}
              rows={5}
              placeholder="Listez les compétences, expériences et qualifications requises"
              className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"/>
          </div>
        </div>
  
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Link
            to="/dashboard/opportunities"
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium text-center">
            Annuler
          </Link>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-secondary text-white hover:bg-green-600 transition-colors font-medium shadow-md border-2 border-secondary">
            <Save className="w-5 h-5" />
            <span>Publier l'opportunité</span>
          </button>
        </div>
      </form>
    </div>
  );
}
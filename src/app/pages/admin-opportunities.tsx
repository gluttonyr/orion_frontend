import { Link } from "react-router";
import { Plus, Edit2, Trash2, Eye, Users, DollarSign, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "../lib/user-context.tsx";
import { mission } from "../service/mission.service";

interface AdminOpportunity {
  id: string;
  title: string;
  type: string;
  amount: number;
  paymentFrequency: string;
  location: string;
  duration: string;
  deadline: string;
  status: string;
  applicants: number;
  accepted: number;
  totalPaid: number;
  createdAt: string;
  commercantId?: number;
}

export function AdminOpportunities() {
  const [opportunities, setOpportunities] = useState<AdminOpportunity[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [opportunityToDelete, setOpportunityToDelete] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    console.log("Chargement des opportunités administrateur...");
    mission
      .getAll()
      .then((missions) => {
        console.log("Missions récupérées :", missions);
        const formatted = missions.map((missionData) => ({
          id: missionData.id.toString(),
          title: missionData.titre,
          type: missionData.type || "Mission",
          amount: Number(missionData.montant || 0),
          paymentFrequency: missionData.frequencePaiement || "Projet",
          location: missionData.localisation || "À distance",
          duration: `${missionData.dureeMission || 0} mois`,
          deadline: missionData.dateLimiteCandidature
            ? new Date(missionData.dateLimiteCandidature).toLocaleDateString("fr-FR")
            : "À définir",
          status: missionData.statut || "Ouvert",
          applicants: 0,
          accepted: 0,
          totalPaid: 0,
          createdAt: missionData.datePublication
            ? new Date(missionData.datePublication).toLocaleDateString("fr-FR")
            : "N/A",
          commercantId: (missionData as any).commercantId || (missionData as any).commercant?.id,
        }));

        // const filtered = user
        //   ? formatted.filter((opp) => opp.commercantId === user.id)
        //   : formatted;

        setOpportunities(formatted);
      })
      .catch((error) => {
        console.error("Erreur chargement opportunités administrateur :", error);
      });
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleDeleteClick = (id: string) => {
    setOpportunityToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (opportunityToDelete) {
      setOpportunities(opportunities.filter((opp) => opp.id !== opportunityToDelete));
      setShowDeleteModal(false);
      setOpportunityToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ouvert":
        return "bg-green-100 text-green-700 border-green-200";
      case "Fermé":
        return "bg-red-100 text-red-700 border-red-200";
      case "En pause":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const totalApplicants = opportunities.reduce((sum, opp) => sum + opp.applicants, 0);
  const totalAccepted = opportunities.reduce((sum, opp) => sum + opp.accepted, 0);
  const totalPaid = opportunities.reduce((sum, opp) => sum + opp.totalPaid, 0);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Opportunités</h1>
          <p className="text-gray-600 mt-1">Gérez vos offres d'emploi et missions</p>
        </div>
        <Link
          to="/dashboard/opportunities/create"
          className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-white hover:bg-green-600 transition-colors shadow-md border-2 border-secondary font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Créer une opportunité</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow-md p-6 border-4 border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 border-2 border-blue-200 flex items-center justify-center flex-shrink-0">
              <Eye className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{opportunities.length}</h3>
          <p className="text-gray-600 text-sm mt-1">Opportunités créées</p>
        </div>

        <div className="bg-white shadow-md p-6 border-4 border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-100 border-2 border-purple-200 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{totalApplicants}</h3>
          <p className="text-gray-600 text-sm mt-1">Candidatures reçues</p>
        </div>

        <div className="bg-white shadow-md p-6 border-4 border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-100 border-2 border-green-200 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-secondary" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{totalAccepted}</h3>
          <p className="text-gray-600 text-sm mt-1">Candidats acceptés</p>
        </div>

        <div className="bg-white shadow-md p-6 border-4 border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-orange-100 border-2 border-orange-200 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 break-words">{formatCurrency(totalPaid)}</h3>
          <p className="text-gray-600 text-sm mt-1">Total versé</p>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="bg-white shadow-md border-4 border-gray-100">
        <div className="p-6 border-b-4 border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Liste des opportunités</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-4 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Titre</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Rémunération</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Candidatures</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Statut</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-gray-100">
              {opportunities.map((opportunity) => (
                <tr key={opportunity.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 break-words max-w-xs">{opportunity.title}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{opportunity.location}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium border-2 border-blue-200 whitespace-nowrap">
                      {opportunity.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900 break-words">
                        {formatCurrency(opportunity.amount)}
                      </p>
                      <p className="text-sm text-gray-500">/ {opportunity.paymentFrequency}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">{opportunity.applicants}</p>
                      <p className="text-sm text-green-600">{opportunity.accepted} accepté(s)</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-sm font-medium border-2 whitespace-nowrap ${getStatusColor(opportunity.status)}`}>
                      {opportunity.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/dashboard/opportunities/${opportunity.id}`}
                        className="p-2 text-primary hover:bg-blue-50 transition-colors border-2 border-transparent hover:border-primary"
                        title="Voir détails & postulants"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <Link
                        to={`/dashboard/opportunities/edit/${opportunity.id}`}
                        className="p-2 text-orange-600 hover:bg-orange-50 transition-colors border-2 border-transparent hover:border-orange-300"
                        title="Modifier"
                      >
                        <Edit2 className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(opportunity.id)}
                        className="p-2 text-red-600 hover:bg-red-50 transition-colors border-2 border-transparent hover:border-red-300"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {opportunities.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 border-2 border-gray-200 flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune opportunité</h3>
            <p className="text-gray-600 mb-4">Créez votre première opportunité pour commencer</p>
            <Link
              to="/dashboard/opportunities/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white hover:bg-blue-700 transition-colors border-2 border-primary"
            >
              <Plus className="w-5 h-5" />
              <span>Créer une opportunité</span>
            </Link>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-gray-200 max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cette opportunité ? Cette action est irréversible.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors font-medium border-2 border-red-600"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

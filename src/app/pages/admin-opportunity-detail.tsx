import { useParams, Link } from "react-router";
import { ArrowLeft, Edit2, Users, Check, X, DollarSign, CreditCard, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { mission } from "../service/mission.service";

// Mock data
const applicants = [
  {
    id: "1",
    name: "Amadou Diallo",
    email: "amadou.diallo@email.com",
    phone: "+221 77 123 4567",
    location: "Dakar, Sénégal",
    experience: "5 ans",
    appliedAt: "20 Mars 2026",
    status: "pending",
    message: "Bonjour, je suis très intéressé par cette opportunité. J'ai 5 ans d'expérience en développement React.",
  },
  {
    id: "2",
    name: "Fatou Ndiaye",
    email: "fatou.ndiaye@email.com",
    phone: "+221 76 234 5678",
    location: "Thiès, Sénégal",
    experience: "3 ans",
    appliedAt: "21 Mars 2026",
    status: "accepted",
    message: "Je serais ravie de rejoindre votre équipe. Mon portfolio est disponible sur demande.",
    totalPaid: 1500000,
    paymentHistory: [
      { date: "1 Avril 2026", amount: 500000, status: "Payé" },
      { date: "1 Mars 2026", amount: 500000, status: "Payé" },
      { date: "1 Février 2026", amount: 500000, status: "Payé" },
    ],
  },
  {
    id: "3",
    name: "Moussa Sow",
    email: "moussa.sow@email.com",
    phone: "+221 70 345 6789",
    location: "Dakar, Sénégal",
    experience: "7 ans",
    appliedAt: "22 Mars 2026",
    status: "rejected",
    message: "Expérimenté en React, TypeScript et Next.js. Disponible immédiatement.",
  },
];

interface AdminOpportunityDetailType {
  id: string;
  title: string;
  type: string;
  amount: number;
  paymentFrequency: string;
  location: string;
  duration: string;
  deadline: string;
  status: string;
  description: string;
  createdAt: string;
}

export function AdminOpportunityDetail() {
  const { id } = useParams();
  const [applicantsList, setApplicantsList] = useState(applicants);
  const [selectedApplicant, setSelectedApplicant] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [opportunity, setOpportunity] = useState<AdminOpportunityDetailType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOpportunity = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const missionData = await mission.getById(Number(id));
        setOpportunity({
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
          description: missionData.descriptionCourte || missionData.description || "",
          createdAt: missionData.datePublication
            ? new Date(missionData.datePublication).toLocaleDateString("fr-FR")
            : "N/A",
        });
      } catch (error) {
        console.error("Erreur chargement de l'opportunité :", error);
      } finally {
        setLoading(false);
      }
    };

    loadOpportunity();
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAccept = (applicantId: string) => {
    setApplicantsList(
      applicantsList.map((app) =>
        app.id === applicantId ? { ...app, status: "accepted" } : app
      )
    );
  };

  const handleReject = (applicantId: string) => {
    setApplicantsList(
      applicantsList.map((app) =>
        app.id === applicantId ? { ...app, status: "rejected" } : app
      )
    );
  };

  const handleAddPayment = () => {
    if (selectedApplicant && paymentAmount) {
      // En production, envoyer à l'API
      console.log(`Paiement de ${paymentAmount} FCFA ajouté pour ${selectedApplicant}`);
      setShowPaymentModal(false);
      setPaymentAmount("");
      setSelectedApplicant(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <span className="px-3 py-1 bg-green-100 text-green-700 border-2 border-green-200 text-sm font-medium">Accepté</span>;
      case "rejected":
        return <span className="px-3 py-1 bg-red-100 text-red-700 border-2 border-red-200 text-sm font-medium">Rejeté</span>;
      default:
        return <span className="px-3 py-1 bg-orange-100 text-orange-700 border-2 border-orange-200 text-sm font-medium">En attente</span>;
    }
  };

  const pendingCount = applicantsList.filter((a) => a.status === "pending").length;
  const acceptedCount = applicantsList.filter((a) => a.status === "accepted").length;
  const rejectedCount = applicantsList.filter((a) => a.status === "rejected").length;

  if (loading) {
    return <div className="p-10 text-center">Chargement...</div>;
  }

  if (!opportunity) {
    return (
      <div className="p-10 text-center">
        <p className="text-gray-600">Opportunité introuvable.</p>
      </div>
    );
  }

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
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 break-words">{opportunity.title}</h1>
            <p className="text-gray-600 mt-1">Gérez les candidatures pour cette opportunité</p>
          </div>
          <Link
            to={`/dashboard/opportunities/edit/${id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white hover:bg-blue-700 transition-colors border-2 border-primary font-medium"
          >
            <Edit2 className="w-5 h-5" />
            <span>Modifier</span>
          </Link>
        </div>
      </div>

      {/* Opportunity Details */}
      <div className="bg-white shadow-md border-4 border-gray-100 p-6 md:p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Détails de l'opportunité</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 border-2 border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Type</p>
            <p className="font-semibold text-gray-900">{opportunity.type}</p>
          </div>
          <div className="p-4 bg-gray-50 border-2 border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Rémunération</p>
            <p className="font-semibold text-gray-900 break-words">
              {formatCurrency(opportunity.amount)} / {opportunity.paymentFrequency}
            </p>
          </div>
          <div className="p-4 bg-gray-50 border-2 border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Durée</p>
            <p className="font-semibold text-gray-900">{opportunity.duration}</p>
          </div>
          <div className="p-4 bg-gray-50 border-2 border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Localisation</p>
            <p className="font-semibold text-gray-900 break-words">{opportunity.location}</p>
          </div>
          <div className="p-4 bg-gray-50 border-2 border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Date limite</p>
            <p className="font-semibold text-gray-900">{opportunity.deadline}</p>
          </div>
          <div className="p-4 bg-gray-50 border-2 border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Statut</p>
            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 border-2 border-green-200 font-medium">
              {opportunity.status}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="bg-white shadow-md p-6 border-4 border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-orange-100 border-2 border-orange-200 flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{pendingCount}</h3>
          <p className="text-gray-600 text-sm mt-1">En attente</p>
        </div>

        <div className="bg-white shadow-md p-6 border-4 border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-100 border-2 border-green-200 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{acceptedCount}</h3>
          <p className="text-gray-600 text-sm mt-1">Acceptés</p>
        </div>

        <div className="bg-white shadow-md p-6 border-4 border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-red-100 border-2 border-red-200 flex items-center justify-center">
              <X className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{rejectedCount}</h3>
          <p className="text-gray-600 text-sm mt-1">Rejetés</p>
        </div>
      </div>

      {/* Applicants List */}
      <div className="bg-white shadow-md border-4 border-gray-100">
        <div className="p-6 border-b-4 border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Liste des candidats</h2>
        </div>

        <div className="divide-y-4 divide-gray-100">
          {applicantsList.map((applicant) => (
            <div key={applicant.id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                {/* Applicant Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 break-words">{applicant.name}</h3>
                      <p className="text-sm text-gray-600 break-words">{applicant.email}</p>
                      <p className="text-sm text-gray-600">{applicant.phone}</p>
                    </div>
                    {getStatusBadge(applicant.status)}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Localisation: </span>
                      <span className="font-medium text-gray-900 break-words">{applicant.location}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Expérience: </span>
                      <span className="font-medium text-gray-900">{applicant.experience}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Postulé le: </span>
                      <span className="font-medium text-gray-900">{applicant.appliedAt}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 border-2 border-gray-200">
                    <p className="text-sm font-medium text-gray-900 mb-2">Message de motivation:</p>
                    <p className="text-sm text-gray-700 break-words">{applicant.message}</p>
                  </div>

                  {/* Payment History for Accepted Applicants */}
                  {applicant.status === "accepted" && applicant.paymentHistory && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-4 border-green-100">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">Historique des paiements</h4>
                        <span className="text-lg font-bold text-secondary">
                          Total: {formatCurrency(applicant.totalPaid || 0)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {applicant.paymentHistory.map((payment, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white border-2 border-green-200">
                            <div>
                              <p className="font-medium text-gray-900">{payment.date}</p>
                              <p className="text-sm text-gray-600">{payment.status}</p>
                            </div>
                            <p className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="lg:w-48 flex flex-col gap-3">
                  {applicant.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleAccept(applicant.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors font-medium border-2 border-green-600"
                      >
                        <Check className="w-5 h-5" />
                        <span>Accepter</span>
                      </button>
                      <button
                        onClick={() => handleReject(applicant.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors font-medium border-2 border-red-600"
                      >
                        <X className="w-5 h-5" />
                        <span>Rejeter</span>
                      </button>
                    </>
                  )}

                  {applicant.status === "accepted" && (
                    <button
                      onClick={() => {
                        setSelectedApplicant(applicant.id);
                        setShowPaymentModal(true);
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-white hover:bg-green-600 transition-colors font-medium border-2 border-secondary"
                    >
                      <CreditCard className="w-5 h-5" />
                      <span>Charger paiement</span>
                    </button>
                  )}

                  <button className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium">
                    <Eye className="w-5 h-5" />
                    <span>Voir profil</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {applicantsList.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 border-2 border-gray-200 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune candidature</h3>
            <p className="text-gray-600">Aucun candidat n'a postulé pour cette opportunité</p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-gray-200 max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Ajouter un paiement</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enregistrez un nouveau paiement effectué pour ce candidat.
            </p>

            <div className="mb-6">
              <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-900 mb-2">
                Montant (FCFA)
              </label>
              <input
                type="number"
                id="paymentAmount"
                min="0"
                step="1000"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Ex: 500000"
                className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentAmount("");
                  setSelectedApplicant(null);
                }}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleAddPayment}
                disabled={!paymentAmount || Number(paymentAmount) <= 0}
                className="px-6 py-2 bg-secondary text-white hover:bg-green-600 transition-colors font-medium border-2 border-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

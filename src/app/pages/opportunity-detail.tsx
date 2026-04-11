import { useParams, Link } from "react-router";
import { ArrowLeft, Building2, MapPin, DollarSign, Clock, Calendar, Users, Send, CheckCircle } from "lucide-react";
import { useState } from "react";

export function OpportunityDetail() {
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [hasApplied, setHasApplied] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: "1",
      sender: "merchant",
      senderName: "TechAfrique Solutions",
      text: "Bonjour ! Merci de votre intérêt pour ce poste. Avez-vous des questions ?",
      timestamp: "Il y a 2h",
    },
  ]);

  // Mock data - en production, charger depuis l'API
  const opportunity = {
    id: "1",
    title: "Développeur Web Front-End",
    description: "Nous recherchons un développeur web expérimenté en React et TypeScript pour rejoindre notre équipe et travailler sur des projets innovants pour des clients africains.",
    fullDescription: "En tant que développeur front-end, vous serez responsable de la création d'interfaces utilisateur modernes et réactives. Vous travaillerez en étroite collaboration avec notre équipe de design et notre équipe back-end pour créer des expériences utilisateur exceptionnelles.\n\nResponsabilités:\n- Développer des interfaces utilisateur avec React et TypeScript\n- Collaborer avec l'équipe de design\n- Optimiser les performances\n- Maintenir le code existant\n\nCompétences requises:\n- 3+ ans d'expérience en React\n- Maîtrise de TypeScript\n- Connaissance de Tailwind CSS\n- Expérience avec Git",
    company: "TechAfrique Solutions",
    location: "Dakar, Sénégal",
    type: "Emploi",
    amount: 500000,
    duration: "6 mois",
    paymentFrequency: "Mois",
    deadline: "30 Avril 2026",
    status: "Ouvert",
    postedBy: "1",
    applicants: 12,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      setChatMessages([
        ...chatMessages,
        {
          id: Date.now().toString(),
          sender: "user",
          senderName: "Vous",
          text: message,
          timestamp: "À l'instant",
        },
      ]);
      setMessage("");
    }
  };

  const handleApply = () => {
    setHasApplied(true);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-white border-b-4 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/opportunities"
            className="inline-flex items-center gap-2 text-primary hover:text-blue-700 font-medium mb-4 border-b-2 border-transparent hover:border-primary transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour aux opportunités</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Opportunity Details */}
            <div className="bg-white shadow-md border-4 border-gray-100 p-6 md:p-8">
              <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 break-words">{opportunity.title}</h1>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium break-words">{opportunity.company}</span>
                  </div>
                </div>
                <span className="px-4 py-2 bg-blue-100 text-blue-700 font-medium border-2 border-blue-200">
                  {opportunity.type}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-100">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Localisation</p>
                    <p className="font-semibold text-gray-900 break-words">{opportunity.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-green-50 border-2 border-green-100">
                  <DollarSign className="w-5 h-5 text-secondary flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Rémunération</p>
                    <p className="font-semibold text-gray-900 break-words">
                      {formatCurrency(opportunity.amount)} / {opportunity.paymentFrequency}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-green-50 border-2 border-orange-100">
                  <Clock className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Durée</p>
                    <p className="font-semibold text-gray-900">{opportunity.duration}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-green-50 border-2 border-purple-100">
                  <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Date limite</p>
                    <p className="font-semibold text-gray-900">{opportunity.deadline}</p>
                  </div>
                </div>
              </div>

              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Description complète</h2>
                <div className="text-gray-600 whitespace-pre-line break-words">{opportunity.fullDescription}</div>
              </div>
            </div>

            {/* Chat Section */}
            <div className="bg-white shadow-md border-4 border-gray-100">
              <div className="p-6 border-b-4 border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Discussion avec l'entreprise</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Posez vos questions directement au recruteur
                </p>
              </div>

              {/* Chat Messages */}
              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[80%] ${msg.sender === "user" ? "order-2" : "order-1"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{msg.senderName}</span>
                        <span className="text-xs text-gray-500">{msg.timestamp}</span>
                      </div>
                      <div
                        className={`p-4 break-words border-2 ${
                          msg.sender === "user"
                            ? "bg-primary text-white border-primary"
                            : "bg-gray-100 text-gray-900 border-gray-200"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t-4 border-gray-100">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Écrivez votre message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-6 py-3 bg-primary text-white hover:bg-blue-700 transition-colors font-medium border-2 border-primary flex items-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    <span className="hidden sm:inline">Envoyer</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Section */}
            <div className="bg-white shadow-md border-4 border-gray-100 p-6 sticky top-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Users className="w-5 h-5 flex-shrink-0" />
                <span>{opportunity.applicants} candidatures</span>
              </div>

              {hasApplied ? (
                <div className="bg-green-50 border-4 border-green-200 p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-green-900 mb-2">Candidature envoyée !</h3>
                  <p className="text-sm text-green-700">
                    L'entreprise a reçu votre candidature et vous contactera bientôt.
                  </p>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleApply}
                    className="w-full px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg transition-all font-semibold text-lg border-2 border-primary mb-3"
                  >
                    Postuler maintenant
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    En postulant, vous acceptez que vos informations soient partagées avec l'entreprise.
                  </p>
                </>
              )}
            </div>

            {/* Company Info */}
            <div className="bg-white shadow-md border-4 border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">À propos de l'entreprise</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nom</p>
                  <p className="font-medium text-gray-900 break-words">{opportunity.company}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Secteur</p>
                  <p className="font-medium text-gray-900">Technologies</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Taille</p>
                  <p className="font-medium text-gray-900">10-50 employés</p>
                </div>
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-4 border-orange-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">⚠️ Conseils de sécurité</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Ne partagez jamais d'informations bancaires</li>
                <li>• Vérifiez toujours l'entreprise</li>
                <li>• Méfiez-vous des offres trop belles</li>
                <li>• Utilisez la messagerie interne</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
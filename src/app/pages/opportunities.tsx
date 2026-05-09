import { Search, Filter, Calendar, Building2, Award, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { mission } from "../service/mission.service";

interface OpportunityItem {
  id: string;
  title: string;
  description: string;
  provider: string;
  deadline: string;
  type: string;
  status: string;
}

export function Opportunities() {
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("Tous");

  const types = ["Tous", "Financement", "Formation", "Réseau"];

  useEffect(() => {
    console.log("Chargement des opportunités...");
    mission
      .getAll()
      .then((missions) => {
        console.log("Missions récupérées :", missions);
        const formatted = missions.map((missionData) => ({
          id: missionData.id.toString(),
          title: missionData.titre,
          description: missionData.descriptionCourte || missionData.description || "",
          provider: "Partenaire",
          deadline: missionData.dateLimiteCandidature
            ? new Date(missionData.dateLimiteCandidature).toLocaleDateString("fr-FR")
            : "À définir",
          type: missionData.type || "Autre",
          status: missionData.statut || "Ouvert",
        }));
        setOpportunities(formatted);
      })
      .catch((error) => {
        console.error("Erreur chargement opportunités :", error);
      });
  }, []);

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) || opp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "Tous" || opp.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Financement":
        return "bg-green-100 text-green-700";
      case "Formation":
        return "bg-blue-100 text-blue-700";
      case "Réseau":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ouvert":
        return "bg-green-100 text-green-700 border-green-200";
      case "Places limitées":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Permanent":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-secondary rounded-xl shadow-md p-8 text-white">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-3">Opportunités de croissance</h1>
          <p className="text-blue-100 text-lg">
            Découvrez des financements, formations et réseaux pour développer votre activité entrepreneuriale en Afrique
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">24</p>
              <p className="text-gray-600 text-sm">Opportunités actives</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">15</p>
              <p className="text-gray-600 text-sm">Partenaires actifs</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">8</p>
              <p className="text-gray-600 text-sm">Événements ce mois</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une opportunité..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {/* Type Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedType === type
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {filteredOpportunities.map((opportunity) => (
          <div
            key={opportunity.id}
            className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-50 to-green-50 p-6 border-b border-blue-100">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(opportunity.type)}`}>
                  {opportunity.type}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(opportunity.status)}`}>
                  {opportunity.status}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{opportunity.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building2 className="w-4 h-4" />
                <span>{opportunity.provider}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-600 mb-4 leading-relaxed">{opportunity.description}</p>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Date limite: <strong>{opportunity.deadline}</strong></span>
              </div>

              <button className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2">
                <span>En savoir plus</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredOpportunities.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune opportunité trouvée</h3>
          <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
        </div>
      )}

      {/* Call to Action */}
      <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Vous proposez une opportunité ?</h2>
          <p className="text-gray-600 mb-6">
            Partagez vos programmes de financement, formations ou opportunités de réseau avec notre communauté d'entrepreneurs africains
          </p>
          <button className="px-8 py-3 bg-secondary text-white rounded-lg hover:bg-green-600 transition-colors font-medium shadow-md">
            Proposer une opportunité
          </button>
        </div>
      </div>
    </div>
  );
}

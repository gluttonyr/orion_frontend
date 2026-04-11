import { Link } from "react-router";
import { Search, Filter, Calendar, Building2, Award, MapPin, DollarSign, Clock } from "lucide-react";
import { useState } from "react";

// Mock data pour les opportunités publiques
const publicOpportunities = [
  {
    id: "1",
    title: "Développeur Web Front-End",
    description: "Nous recherchons un développeur web expérimenté en React et TypeScript pour rejoindre notre équipe.",
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
  },
  {
    id: "2",
    title: "Mission Marketing Digital",
    description: "Besoin d'un expert en marketing digital pour gérer nos campagnes sur les réseaux sociaux.",
    company: "BizGrow Agency",
    location: "Abidjan, Côte d'Ivoire",
    type: "Mission",
    amount: 250000,
    duration: "3 mois",
    paymentFrequency: "Mois",
    deadline: "15 Avril 2026",
    status: "Ouvert",
    postedBy: "2",
    applicants: 8,
  },
  {
    id: "3",
    title: "Consultant E-commerce",
    description: "Accompagnement pour le lancement d'une boutique en ligne de produits artisanaux.",
    company: "Artisan Market",
    location: "Lomé, Togo",
    type: "Consultation",
    amount: 150000,
    duration: "1 mois",
    paymentFrequency: "Projet",
    deadline: "20 Avril 2026",
    status: "Places limitées",
    postedBy: "3",
    applicants: 15,
  },
  {
    id: "4",
    title: "Graphiste Freelance",
    description: "Création de visuels pour nos produits et campagnes marketing.",
    company: "Creative Hub",
    location: "Accra, Ghana",
    type: "Freelance",
    amount: 200000,
    duration: "2 mois",
    paymentFrequency: "Mois",
    deadline: "10 Mai 2026",
    status: "Ouvert",
    postedBy: "4",
    applicants: 20,
  },
  {
    id: "5",
    title: "Formateur en Comptabilité",
    description: "Formation pour jeunes entrepreneurs sur la gestion comptable de base.",
    company: "EduBiz Africa",
    location: "Cotonou, Bénin",
    type: "Formation",
    amount: 100000,
    duration: "2 semaines",
    paymentFrequency: "Semaine",
    deadline: "25 Avril 2026",
    status: "Ouvert",
    postedBy: "5",
    applicants: 5,
  },
];

export function PublicOpportunities() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("Tous");

  const types = ["Tous", "Emploi", "Mission", "Freelance", "Consultation", "Formation"];

  const filteredOpportunities = publicOpportunities.filter((opp) => {
    const matchesSearch = 
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "Tous" || opp.type === selectedType;
    return matchesSearch && matchesType;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Emploi":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Mission":
        return "bg-green-100 text-green-700 border-green-200";
      case "Freelance":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "Consultation":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Formation":
        return "bg-pink-100 text-pink-700 border-pink-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ouvert":
        return "bg-green-100 text-green-700 border-green-200";
      case "Places limitées":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Fermé":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-secondary border-b-4 border-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Opportunités de Travail
            </h1>
            <p className="text-xl text-blue-100">
              Découvrez des missions, emplois et projets proposés par des commerçants et entrepreneurs africains
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="bg-white shadow-md p-6 border-4 border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 border-2 border-green-200 flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{publicOpportunities.length}</p>
                <p className="text-gray-600 text-sm">Opportunités actives</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md p-6 border-4 border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 border-2 border-blue-200 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">15</p>
                <p className="text-gray-600 text-sm">Entreprises actives</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md p-6 border-4 border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 border-2 border-purple-200 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">8</p>
                <p className="text-gray-600 text-sm">Nouvelles cette semaine</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white shadow-md p-6 border-4 border-gray-100 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une opportunité..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Type Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 font-medium whitespace-nowrap transition-colors border-2 ${
                  selectedType === type
                    ? "bg-primary text-white border-primary"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Opportunities Grid */}
        <div className="grid lg:grid-cols-2 gap-6 pb-8">
          {filteredOpportunities.map((opportunity) => (
            <div
              key={opportunity.id}
              className="bg-white shadow-md border-4 border-gray-100 overflow-hidden hover:shadow-xl transition-all hover:border-primary"
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-blue-50 to-green-50 p-6 border-b-4 border-blue-100">
                <div className="flex items-start justify-between mb-3 gap-3">
                  <span className={`px-3 py-1 text-sm font-medium border-2 ${getTypeColor(opportunity.type)}`}>
                    {opportunity.type}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium border-2 ${getStatusColor(opportunity.status)}`}>
                    {opportunity.status}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 break-words">{opportunity.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="w-4 h-4 flex-shrink-0" />
                  <span className="break-words">{opportunity.company}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <p className="text-gray-600 leading-relaxed break-words">{opportunity.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="break-words">{opportunity.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 text-secondary flex-shrink-0" />
                    <span className="font-semibold">{formatCurrency(opportunity.amount)}</span>
                    <span>/ {opportunity.paymentFrequency}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    <span>Durée: <strong>{opportunity.duration}</strong></span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span>Date limite: <strong>{opportunity.deadline}</strong></span>
                  </div>
                </div>

                <div className="pt-2 border-t-2 border-gray-100">
                  <p className="text-sm text-gray-500 mb-4">
                    {opportunity.applicants} personne{opportunity.applicants > 1 ? "s ont" : " a"} postulé
                  </p>
                  
                  <Link
                    to={`/opportunities/${opportunity.id}`}
                    className="block w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg transition-all font-medium text-center border-2 border-primary"
                  >
                    Savoir plus & Postuler
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredOpportunities.length === 0 && (
          <div className="bg-white shadow-md p-12 text-center border-4 border-gray-100">
            <div className="w-16 h-16 bg-gray-100 border-2 border-gray-200 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune opportunité trouvée</h3>
            <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>
    </div>
  );
}
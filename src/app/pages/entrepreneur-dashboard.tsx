import { Link } from "react-router";
import { TrendingUp, Users, Target, Briefcase, MessageCircle, Calendar, Award, Lightbulb } from "lucide-react";

export function EntrepreneurDashboard() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Stats pour entrepreneur
  const stats = {
    projects: 3,
    opportunities: 12,
    connections: 48,
    funding: 2500000,
  };

  const recentOpportunities = [
    {
      id: "1",
      title: "Programme d'Incubation Tech",
      type: "Formation",
      deadline: "15 Avril 2026",
      status: "Ouvert",
    },
    {
      id: "2",
      title: "Financement Startup Agritech",
      type: "Financement",
      deadline: "30 Mars 2026",
      status: "En cours",
    },
    {
      id: "3",
      title: "Concours Innovation Digitale",
      type: "Concours",
      deadline: "10 Avril 2026",
      status: "Ouvert",
    },
  ];

  const upcomingEvents = [
    {
      id: "1",
      title: "Networking Entrepreneurs",
      date: "20 Mars 2026",
      location: "Dakar",
    },
    {
      id: "2",
      title: "Workshop Business Plan",
      date: "25 Mars 2026",
      location: "En ligne",
    },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-primary to-secondary shadow-md p-6 md:p-8 border-4 border-secondary text-white">
        <h1 className="text-3xl font-bold mb-2">Bienvenue, Entrepreneur ! 👋</h1>
        <p className="text-blue-100">
          Découvrez les opportunités et développez votre projet entrepreneurial
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow-md p-6 border-4 border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 border-2 border-blue-200 flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{stats.projects}</h3>
          <p className="text-gray-600 text-sm mt-1">Projets actifs</p>
        </div>

        <div className="bg-white shadow-md p-6 border-4 border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-100 border-2 border-green-200 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-6 h-6 text-secondary" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{stats.opportunities}</h3>
          <p className="text-gray-600 text-sm mt-1">Opportunités disponibles</p>
        </div>

        <div className="bg-white shadow-md p-6 border-4 border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-100 border-2 border-purple-200 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{stats.connections}</h3>
          <p className="text-gray-600 text-sm mt-1">Connexions</p>
        </div>

        <div className="bg-white shadow-md p-6 border-4 border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-orange-100 border-2 border-orange-200 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 break-words">
            {formatCurrency(stats.funding)}
          </h3>
          <p className="text-gray-600 text-sm mt-1">Financement obtenu</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Opportunities List */}
        <div className="lg:col-span-2 bg-white shadow-md p-6 md:p-8 border-4 border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Opportunités Récentes</h2>
            <Link
              to="/dashboard/opportunities"
              className="text-primary hover:text-blue-700 font-medium text-sm border-b-2 border-transparent hover:border-primary transition-all"
            >
              Voir tout
            </Link>
          </div>

          <div className="space-y-4">
            {recentOpportunities.map((opportunity) => (
              <div
                key={opportunity.id}
                className="p-5 border-4 border-gray-100 hover:border-primary transition-all cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-2 break-words">
                      {opportunity.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-primary text-sm font-medium border-2 border-blue-200">
                        {opportunity.type}
                      </span>
                      <span className={`px-3 py-1 text-sm font-medium border-2 ${
                        opportunity.status === "Ouvert"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-orange-100 text-orange-700 border-orange-200"
                      }`}>
                        {opportunity.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 flex-shrink-0">
                    <Calendar className="w-4 h-4" />
                    <span className="whitespace-nowrap">{opportunity.deadline}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/dashboard/opportunities"
            className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white hover:bg-blue-700 transition-colors font-medium border-2 border-primary"
          >
            <Briefcase className="w-5 h-5" />
            <span>Explorer toutes les opportunités</span>
          </Link>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div className="bg-white shadow-md p-6 border-4 border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Événements à venir</h2>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-4 bg-gradient-to-r from-blue-50 to-green-50 border-4 border-blue-100">
                  <h4 className="font-medium text-gray-900 mb-2 break-words">{event.title}</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="break-words">{event.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 ml-6 break-words">{event.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow-md p-6 border-4 border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions rapides</h2>
            <div className="space-y-3">
              <Link
                to="/dashboard/opportunities"
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all border-2 border-blue-200"
              >
                <Briefcase className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="font-medium text-gray-900">Voir opportunités</span>
              </Link>

              <Link
                to="/dashboard/messages"
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all border-2 border-green-200"
              >
                <MessageCircle className="w-5 h-5 text-secondary flex-shrink-0" />
                <span className="font-medium text-gray-900">Messagerie</span>
              </Link>

              <Link
                to="/dashboard/profile"
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all border-2 border-purple-200"
              >
                <Users className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <span className="font-medium text-gray-900">Mon profil</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 shadow-md p-6 md:p-8 border-4 border-blue-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary border-2 border-secondary flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Conseil du jour</h3>
            <p className="text-gray-700 break-words">
              Rejoignez des événements de networking pour élargir votre réseau et découvrir de nouvelles 
              opportunités de collaboration. Le réseau est la clé du succès entrepreneurial en Afrique !
            </p>
          </div>
        </div>
      </div>

      {/* Achievement Section */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white shadow-md p-6 border-4 border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 border-2 border-orange-400 flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Vos réalisations</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 border-2 border-gray-200">
              <span className="text-gray-700 font-medium">Profil complété</span>
              <span className="text-primary font-bold">100%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 border-2 border-gray-200">
              <span className="text-gray-700 font-medium">Candidatures envoyées</span>
              <span className="text-primary font-bold">5</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary to-secondary shadow-md p-6 border-4 border-secondary text-white">
          <h2 className="text-xl font-semibold mb-3">Besoin d'aide ?</h2>
          <p className="text-blue-100 mb-4">
            Notre équipe est là pour vous accompagner dans votre parcours entrepreneurial.
          </p>
          <Link
            to="/dashboard/messages"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary hover:bg-gray-100 transition-colors font-medium border-2 border-white"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Contactez-nous</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

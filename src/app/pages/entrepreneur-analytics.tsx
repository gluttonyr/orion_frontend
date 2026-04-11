import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Target, Users, Award, TrendingUp, Briefcase, Calendar } from "lucide-react";

export function EntrepreneurAnalytics() {
  // Données pour entrepreneurs
  const applicationStats = [
    { month: "Oct", candidatures: 2, acceptées: 1 },
    { month: "Nov", candidatures: 3, acceptées: 2 },
    { month: "Déc", candidatures: 4, acceptées: 2 },
    { month: "Jan", candidatures: 5, acceptées: 3 },
    { month: "Fév", candidatures: 6, acceptées: 4 },
    { month: "Mar", candidatures: 8, acceptées: 5 },
  ];

  const networkGrowth = [
    { month: "Oct", connexions: 10 },
    { month: "Nov", connexions: 18 },
    { month: "Déc", connexions: 25 },
    { month: "Jan", connexions: 32 },
    { month: "Fév", connexions: 40 },
    { month: "Mar", connexions: 48 },
  ];

  const topSkills = [
    { skill: "Leadership", level: 85 },
    { skill: "Marketing Digital", level: 75 },
    { skill: "Gestion Financière", level: 70 },
    { skill: "Innovation", level: 90 },
    { skill: "Networking", level: 80 },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analyses et Statistiques</h1>
        <p className="text-gray-600 mt-1">Suivez votre progression entrepreneuriale</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow-md p-6 border-4 border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 border-2 border-blue-200 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm text-green-600 font-medium whitespace-nowrap ml-2">+25%</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">28</h3>
          <p className="text-gray-600 text-sm mt-1">Candidatures totales</p>
        </div>

        <div className="bg-white shadow-md p-6 border-4 border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-100 border-2 border-green-200 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-secondary" />
            </div>
            <span className="text-sm text-green-600 font-medium whitespace-nowrap ml-2">+40%</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">17</h3>
          <p className="text-gray-600 text-sm mt-1">Acceptations</p>
        </div>

        <div className="bg-white shadow-md p-6 border-4 border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-100 border-2 border-purple-200 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-green-600 font-medium whitespace-nowrap ml-2">+20%</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">48</h3>
          <p className="text-gray-600 text-sm mt-1">Connexions réseau</p>
        </div>

        <div className="bg-white shadow-md p-6 border-4 border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-orange-100 border-2 border-orange-200 flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm text-gray-600 font-medium whitespace-nowrap ml-2">3 actifs</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">3</h3>
          <p className="text-gray-600 text-sm mt-1">Projets en cours</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Applications Chart */}
        <div className="bg-white shadow-md p-6 md:p-8 border-4 border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Candidatures & Acceptations</h2>
            <TrendingUp className="w-5 h-5 text-secondary" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={applicationStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "2px solid #e5e7eb",
                  borderRadius: "0px",
                }}
              />
              <Legend />
              <Bar dataKey="candidatures" fill="#1e3a8a" name="Candidatures" radius={[0, 0, 0, 0]} />
              <Bar dataKey="acceptées" fill="#10b981" name="Acceptées" radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Network Growth Chart */}
        <div className="bg-white shadow-md p-6 md:p-8 border-4 border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Croissance du réseau</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={networkGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "2px solid #e5e7eb",
                  borderRadius: "0px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="connexions"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: "#10b981", r: 4 }}
                name="Connexions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Skills Assessment */}
      <div className="bg-white shadow-md p-6 md:p-8 border-4 border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Évaluation des compétences</h2>
        <div className="space-y-5">
          {topSkills.map((item) => (
            <div key={item.skill}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{item.skill}</span>
                <span className="text-sm font-semibold text-primary">{item.level}%</span>
              </div>
              <div className="w-full bg-gray-200 h-3 border-2 border-gray-300">
                <div
                  className="bg-gradient-to-r from-primary to-secondary h-full transition-all"
                  style={{ width: `${item.level}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-md p-6 md:p-8 border-4 border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Activités récentes</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 border-4 border-blue-100">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary border-2 border-secondary flex items-center justify-center text-white font-bold flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 mb-1">Candidature acceptée</h4>
                <p className="text-sm text-gray-600 break-words">Programme d'Incubation Tech - Il y a 2 jours</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 border-4 border-blue-100">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary border-2 border-secondary flex items-center justify-center text-white font-bold flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 mb-1">Nouveau contact</h4>
                <p className="text-sm text-gray-600 break-words">5 nouvelles connexions cette semaine</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 border-4 border-blue-100">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary border-2 border-secondary flex items-center justify-center text-white font-bold flex-shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 mb-1">Formation complétée</h4>
                <p className="text-sm text-gray-600 break-words">Workshop Business Plan - Il y a 5 jours</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary to-secondary shadow-md p-6 md:p-8 border-4 border-secondary text-white">
          <h2 className="text-xl font-semibold mb-4">Objectifs du mois</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100">Postuler à 5 opportunités</span>
                <span className="font-semibold">4/5</span>
              </div>
              <div className="w-full bg-white/20 h-2 border-2 border-white/30">
                <div className="bg-white h-full" style={{ width: "80%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100">Élargir réseau (10 contacts)</span>
                <span className="font-semibold">8/10</span>
              </div>
              <div className="w-full bg-white/20 h-2 border-2 border-white/30">
                <div className="bg-white h-full" style={{ width: "80%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100">Compléter 2 formations</span>
                <span className="font-semibold">2/2</span>
              </div>
              <div className="w-full bg-white/20 h-2 border-2 border-white/30">
                <div className="bg-white h-full" style={{ width: "100%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-gradient-to-br from-primary to-secondary shadow-md p-6 md:p-8 text-white border-4 border-secondary">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Exporter votre portfolio</h2>
            <p className="text-blue-100">Téléchargez un rapport complet de vos activités et réalisations</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button className="px-6 py-3 bg-white text-primary hover:bg-gray-100 transition-colors font-medium shadow-md border-2 border-white">
              PDF
            </button>
            <button className="px-6 py-3 bg-white text-primary hover:bg-gray-100 transition-colors font-medium shadow-md border-2 border-white">
              Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

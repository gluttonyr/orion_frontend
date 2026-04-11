import { Link } from "react-router";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Clock, ArrowRight, Star } from "lucide-react";
import { dashboardStats, recentSales, missions } from "../lib/mock-data";

export function MerchantDashboard() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-1">Bienvenue sur votre espace Orion</p>
        </div>
        <Link
          to="/dashboard/marketplace"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white hover:bg-blue-700 transition-colors shadow-md border-2 border-primary"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Voir le Marketplace</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="bg-white shadow-md p-6 border-4 border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 border-2 border-blue-200 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            {dashboardStats.revenueGrowth > 0 ? (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                +{dashboardStats.revenueGrowth}%
              </span>
            ) : (
              <span className="flex items-center gap-1 text-sm text-red-600">
                <TrendingDown className="w-4 h-4" />
                {dashboardStats.revenueGrowth}%
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardStats.revenue)}</h3>
          <p className="text-gray-600 text-sm mt-1">Revenus totaux</p>
        </div>

        {/* Sales Card */}
        <div className="bg-white shadow-md p-6 border-4 border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 border-2 border-green-200 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-secondary" />
            </div>
            <span className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              +{dashboardStats.salesGrowth}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{dashboardStats.sales}</h3>
          <p className="text-gray-600 text-sm mt-1">Ventes ce mois</p>
        </div>

        {/* Stock Card */}
        <div className="bg-white shadow-md p-6 border-4 border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 border-2 border-purple-200 flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <span className="flex items-center gap-1 text-sm text-red-600">
              <TrendingDown className="w-4 h-4" />
              {dashboardStats.stockGrowth}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{dashboardStats.stock}</h3>
          <p className="text-gray-600 text-sm mt-1">Articles en stock</p>
        </div>

        {/* Pending Orders Card */}
        <div className="bg-white shadow-md p-6 border-4 border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 border-2 border-orange-200 flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <span className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              +{dashboardStats.ordersGrowth}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{dashboardStats.pendingOrders}</h3>
          <p className="text-gray-600 text-sm mt-1">Commandes en cours</p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Sales */}
        <div className="lg:col-span-2 bg-white shadow-md p-6 border-4 border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Ventes récentes</h2>
            <Link to="/dashboard/analytics" className="text-primary hover:text-blue-700 text-sm font-medium">
              Voir tout
            </Link>
          </div>

          <div className="space-y-4">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 border-2 border-gray-100 hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{sale.product}</h4>
                  <p className="text-sm text-gray-500 mt-1">{sale.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(sale.amount)}</p>
                  <span className={`text-xs px-2 py-1 mt-1 inline-block border-2 ${
                    sale.status === "Livré" ? "bg-green-100 text-green-700 border-green-200" :
                    sale.status === "En cours" ? "bg-blue-100 text-blue-700 border-blue-200" :
                    "bg-yellow-100 text-yellow-700 border-yellow-200"
                  }`}>
                    {sale.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Missions */}
        <div className="bg-white shadow-md p-6 border-4 border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Missions en cours</h2>
            <Link to="/dashboard/opportunities" className="text-primary hover:text-blue-700">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="space-y-4">
            {missions.map((mission) => (
              <div key={mission.id} className="p-4 bg-gradient-to-br from-blue-50 to-green-50 border-4 border-blue-100">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-gray-900 pr-2">{mission.title}</h4>
                  <span className="text-xs px-2 py-1 bg-white text-primary border-2 border-primary">
                    {mission.type}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Progression</span>
                    <span className="font-medium text-gray-900">{mission.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2">
                    <div
                      className="bg-gradient-to-r from-primary to-secondary h-2 transition-all"
                      style={{ width: `${mission.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Échéance: {mission.deadline}</span>
                  <div className="flex items-center gap-1 text-secondary">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-medium">{mission.reward.split(" ")[0]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-primary to-secondary shadow-md p-6 text-white border-4 border-secondary">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Développez votre activité</h2>
            <p className="text-blue-100">Explorez nos opportunités de financement et formations</p>
          </div>
          <Link
            to="/dashboard/opportunities"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary hover:bg-gray-100 transition-colors font-medium shadow-md border-2 border-white"
          >
            <span>Découvrir les opportunités</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign, ShoppingCart, Package, Eye } from "lucide-react";
import { analyticsData, dashboardStats } from "../lib/mock-data";

export function MerchantAnalytics() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = ["#1e3a8a", "#10b981", "#3b82f6", "#22d3ee", "#34d399"];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analyses et Statistiques</h1>
        <p className="text-gray-600 mt-1">Vue d'ensemble de votre performance commerciale</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow-md p-6 border-4 border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 border-2 border-blue-200 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm text-green-600 font-medium whitespace-nowrap ml-2">+{dashboardStats.revenueGrowth}%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 break-words">{formatCurrency(dashboardStats.revenue)}</h3>
          <p className="text-gray-600 text-sm mt-1">Revenus totaux</p>
        </div>

        <div className="bg-white shadow-md p-6 border-4 border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-100 border-2 border-green-200 flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-6 h-6 text-secondary" />
            </div>
            <span className="text-sm text-green-600 font-medium whitespace-nowrap ml-2">+{dashboardStats.salesGrowth}%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{dashboardStats.sales}</h3>
          <p className="text-gray-600 text-sm mt-1">Ventes totales</p>
        </div>

        <div className="bg-white shadow-md p-6 border-4 border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-100 border-2 border-purple-200 flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600 font-medium whitespace-nowrap ml-2">{dashboardStats.stock} unités</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 break-words">
            {formatCurrency(dashboardStats.revenue / dashboardStats.sales)}
          </h3>
          <p className="text-gray-600 text-sm mt-1">Valeur moyenne</p>
        </div>

        <div className="bg-white shadow-md p-6 border-4 border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-orange-100 border-2 border-orange-200 flex items-center justify-center flex-shrink-0">
              <Eye className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm text-green-600 font-medium whitespace-nowrap ml-2">+18.5%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">2,847</h3>
          <p className="text-gray-600 text-sm mt-1">Visiteurs uniques</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="bg-white shadow-md p-6 md:p-8 border-4 border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Évolution des ventes</h2>
            <TrendingUp className="w-5 h-5 text-secondary" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.salesByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "2px solid #e5e7eb",
                  borderRadius: "0px",
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="ventes"
                stroke="#1e3a8a"
                strokeWidth={3}
                dot={{ fill: "#1e3a8a", r: 4 }}
                name="Ventes (FCFA)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sales by Category Chart */}
        <div className="bg-white shadow-md p-6 md:p-8 border-4 border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Ventes par catégorie</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.salesByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData.salesByCategory.map((entry) => (
                  <Cell key={entry.id} fill={COLORS[analyticsData.salesByCategory.indexOf(entry) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Performance Chart */}
        <div className="bg-white shadow-md p-6 md:p-8 border-4 border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance mensuelle</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.salesByMonth}>
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
              <Bar dataKey="commandes" fill="#10b981" radius={[0, 0, 0, 0]} name="Commandes" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products Table */}
        <div className="bg-white shadow-md p-6 md:p-8 border-4 border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Produits les plus vendus</h2>
          <div className="space-y-3">
            {analyticsData.topProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 border-4 border-blue-100"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary border-2 border-secondary flex items-center justify-center text-white font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                  <p className="text-sm text-gray-600">{product.sales} ventes</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-primary break-words">{formatCurrency(product.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white shadow-md p-6 md:p-8 border-4 border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Répartition par catégorie</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {analyticsData.salesByCategory.map((category, index) => (
            <div
              key={category.id}
              className="p-4 border-4 border-gray-100 hover:border-primary transition-colors"
            >
              <div
                className="w-full h-3 mb-4 border-2"
                style={{ 
                  backgroundColor: COLORS[index % COLORS.length],
                  borderColor: COLORS[index % COLORS.length]
                }}
              ></div>
              <h4 className="font-medium text-gray-900 mb-2 break-words">{category.name}</h4>
              <p className="text-2xl font-bold text-gray-900 mb-2 break-words">{formatCurrency(category.value)}</p>
              <p className="text-sm text-gray-600">{category.percentage}% du total</p>
            </div>
          ))}
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-gradient-to-br from-primary to-secondary shadow-md p-6 md:p-8 text-white border-4 border-secondary">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Exporter vos données</h2>
            <p className="text-blue-100">Téléchargez vos rapports détaillés au format PDF ou Excel</p>
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

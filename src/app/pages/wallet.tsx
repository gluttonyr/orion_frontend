import { useState } from "react";
import { Link } from "react-router";
import {
  Wallet as WalletIcon,
  TrendingUp,
  Clock,
  DollarSign,
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  Filter,
  Download,
  CreditCard,
  Smartphone,
  Settings,
} from "lucide-react";
import { useWallet } from "../lib/wallet-context";
import { useWithdrawalMethods } from "../lib/withdrawal-methods-context";

export function Wallet() {
  const { totalRevenue, availableBalance, pendingBalance, transactions, withdrawFunds } = useWallet();
  const { methods } = useWithdrawalMethods();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedMethodId, setSelectedMethodId] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "vente" | "retrait" | "commission">("all");

  const activeMethods = methods.filter((m) => m.active);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Veuillez entrer un montant valide");
      return;
    }
    withdrawFunds(amount);
    setShowWithdrawModal(false);
    setWithdrawAmount("");
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "vente":
        return <ArrowUpCircle className="w-5 h-5 text-secondary" />;
      case "retrait":
        return <ArrowDownCircle className="w-5 h-5 text-orange-600" />;
      case "commission":
        return <DollarSign className="w-5 h-5 text-purple-600" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "vente":
        return "text-secondary";
      case "retrait":
        return "text-orange-600";
      case "commission":
        return "text-purple-600";
      default:
        return "text-gray-900";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="px-2 py-1 bg-secondary border-2 border-secondary text-white text-xs font-medium">Complété</span>;
      case "pending":
        return <span className="px-2 py-1 bg-orange-100 border-2 border-orange-300 text-orange-800 text-xs font-medium">En attente</span>;
      case "cancelled":
        return <span className="px-2 py-1 bg-red-100 border-2 border-red-300 text-red-800 text-xs font-medium">Annulé</span>;
      default:
        return null;
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === "all") return true;
    return t.type === filterType;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Portefeuille</h1>
          <p className="text-gray-600">Gérez vos revenus et retraits</p>
        </div>
        <button
          onClick={() => setShowWithdrawModal(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-green-600 text-white font-medium transition-all shadow-md hover:shadow-lg border-2 border-secondary active:scale-95"
        >
          <ArrowDownCircle className="w-5 h-5" />
          Retirer des fonds
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 shadow-md p-6 border-4 border-blue-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 border-2 border-white/40 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{formatCurrency(totalRevenue)}</h3>
          <p className="text-blue-100 text-sm">Revenus totaux</p>
        </div>

        {/* Available Balance */}
        <div className="bg-gradient-to-br from-secondary to-green-600 shadow-md p-6 border-4 border-secondary text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 border-2 border-white/40 flex items-center justify-center">
              <WalletIcon className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{formatCurrency(availableBalance)}</h3>
          <p className="text-green-100 text-sm">Solde disponible</p>
        </div>

        {/* Pending Balance */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 shadow-md p-6 border-4 border-orange-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 border-2 border-white/40 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{formatCurrency(pendingBalance)}</h3>
          <p className="text-orange-100 text-sm">Solde en attente</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-blue-50 border-4 border-blue-200 p-4 flex items-start gap-3">
          <WalletIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-900 font-medium mb-1">
              À propos de votre portefeuille
            </p>
            <p className="text-sm text-blue-700">
              Les fonds des ventes sont disponibles immédiatement après confirmation.
              Les retraits sont traités dans un délai de 24-48h.
            </p>
          </div>
        </div>

        <Link
          to="/dashboard/withdrawal-methods"
          className="bg-white border-4 border-gray-200 p-4 hover:border-primary hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              <p className="text-sm font-medium text-gray-900">
                Moyens de retrait
              </p>
            </div>
            <span className="text-xs bg-primary text-white px-2 py-1 border-2 border-primary">
              {activeMethods.length}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Gérez vos comptes et méthodes de paiement
          </p>
        </Link>
      </div>

      {/* Transactions */}
      <div className="bg-white border-4 border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900">Historique des transactions</h2>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border-2 border-gray-300 focus:border-primary focus:outline-none bg-white"
            >
              <option value="all">Toutes</option>
              <option value="vente">Ventes</option>
              <option value="retrait">Retraits</option>
              <option value="commission">Commissions</option>
            </select>
            <button className="p-2 border-2 border-gray-300 hover:border-primary transition-colors">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <WalletIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Aucune transaction</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border-2 border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-gray-100 border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {transaction.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-500">
                        {transaction.date.toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      {transaction.orderId && (
                        <>
                          <span className="text-gray-300">•</span>
                          <p className="text-sm text-gray-500">{transaction.orderId}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  {getStatusBadge(transaction.status)}
                  <p
                    className={`font-bold text-lg ${getTransactionColor(
                      transaction.type
                    )}`}
                  >
                    {transaction.amount > 0 ? "+" : ""}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-gray-200 max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Retirer des fonds
            </h2>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-1">Solde disponible</p>
              <p className="text-3xl font-bold text-secondary">
                {formatCurrency(availableBalance)}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Montant à retirer (FCFA)
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Entrez le montant"
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Méthode de retrait
                  </label>
                  <Link
                    to="/dashboard/withdrawal-methods"
                    className="text-xs text-primary hover:underline"
                  >
                    Gérer les méthodes
                  </Link>
                </div>
                {activeMethods.length === 0 ? (
                  <div className="p-4 border-2 border-dashed border-gray-300 text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      Aucun moyen de retrait actif
                    </p>
                    <Link
                      to="/dashboard/withdrawal-methods/add"
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      Ajouter un moyen →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedMethodId(method.id)}
                        className={`w-full p-3 border-2 flex items-center gap-3 transition-all ${
                          selectedMethodId === method.id
                            ? "border-primary bg-blue-50"
                            : "border-gray-300"
                        }`}
                      >
                        <div className="w-10 h-10 border-2 border-gray-200 bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {method.logo ? (
                            <img
                              src={method.logo}
                              alt={method.name}
                              className="w-full h-full object-contain p-1"
                            />
                          ) : (
                            <CreditCard className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900">{method.name}</p>
                          {method.accountNumber && (
                            <p className="text-xs text-gray-600">
                              {method.accountNumber}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 font-medium transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleWithdraw}
                disabled={!selectedMethodId || activeMethods.length === 0}
                className="flex-1 px-6 py-3 bg-secondary hover:bg-green-600 text-white font-medium transition-all border-2 border-secondary active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmer
              </button>
            </div>

            {activeMethods.length === 0 && (
              <p className="text-xs text-orange-600 text-center mt-2">
                Vous devez ajouter au moins un moyen de retrait pour continuer
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

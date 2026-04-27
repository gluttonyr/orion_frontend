import { useState } from "react";
import { Link } from "react-router";
import {
  CreditCard,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Hash,
} from "lucide-react";
import { useWithdrawalMethods } from "../lib/withdrawal-methods-context";

export function WithdrawalMethods() {
  const { methods, deleteMethod, toggleMethodStatus } = useWithdrawalMethods();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteMethod(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <div className="pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Moyens de retrait
          </h1>
          <p className="text-gray-600">
            Gérez vos méthodes de retrait et comptes bancaires
          </p>
        </div>
        <Link
          to="/dashboard/withdrawal-methods/add"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-blue-700 text-white font-medium transition-all shadow-md hover:shadow-lg border-2 border-primary active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Ajouter un moyen
        </Link>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-4 border-blue-200 p-4 mb-6 flex items-start gap-3">
        <CreditCard className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-900 font-medium mb-1">
            Configuration des retraits
          </p>
          <p className="text-sm text-blue-700">
            Ajoutez vos comptes Mobile Money, comptes bancaires ou autres
            moyens de paiement pour recevoir vos gains. Vous pouvez activer ou
            désactiver chaque méthode à tout moment.
          </p>
        </div>
      </div>

      {/* Methods List */}
      <div className="space-y-4">
        {methods.length === 0 ? (
          <div className="bg-white border-4 border-gray-200 p-12 text-center">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Aucun moyen de retrait
            </h3>
            <p className="text-gray-600 mb-6">
              Ajoutez votre premier moyen de retrait pour recevoir vos gains
            </p>
            <Link
              to="/dashboard/withdrawal-methods/add"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-blue-700 text-white font-medium transition-all shadow-md hover:shadow-lg border-2 border-primary active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Ajouter un moyen
            </Link>
          </div>
        ) : (
          methods.map((method) => (
            <div
              key={method.id}
              className={`bg-white border-4 p-6 ${
                method.active ? "border-gray-200" : "border-gray-300 opacity-60"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Logo */}
                <div className="w-16 h-16 border-2 border-gray-300 bg-gray-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {method.logo ? (
                    <img
                      src={method.logo}
                      alt={method.name}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <CreditCard className="w-8 h-8 text-gray-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {method.name}
                        {method.active && (
                          <span className="ml-2 text-xs bg-secondary text-white px-2 py-1 border-2 border-secondary">
                            ACTIF
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-600">{method.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleMethodStatus(method.id)}
                        className={`p-2 border-2 transition-all ${
                          method.active
                            ? "text-secondary border-secondary hover:bg-secondary hover:text-white"
                            : "text-gray-400 border-gray-300 hover:border-gray-400"
                        }`}
                        title={
                          method.active
                            ? "Désactiver ce moyen"
                            : "Activer ce moyen"
                        }
                      >
                        {method.active ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap gap-4 mb-4">
                    {method.accountNumber && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Hash className="w-4 h-4" />
                        {method.accountNumber}
                      </div>
                    )}
                    {method.accountName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        {method.accountName}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      Ajouté le{" "}
                      {new Date(method.createdAt).toLocaleDateString("fr-FR")}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/dashboard/withdrawal-methods/edit/${method.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 hover:border-primary hover:text-primary transition-all font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </Link>
                    <button
                      onClick={() => handleDelete(method.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2 border-2 font-medium transition-all ${
                        deleteConfirm === method.id
                          ? "bg-red-600 border-red-600 text-white"
                          : "bg-white border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600"
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                      {deleteConfirm === method.id
                        ? "Confirmer ?"
                        : "Supprimer"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

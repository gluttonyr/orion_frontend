import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface Transaction {
  id: string;
  type: "vente" | "retrait" | "commission" | "remboursement";
  amount: number;
  status: "completed" | "pending" | "cancelled";
  description: string;
  date: Date;
  orderId?: string;
}

interface WalletContextType {
  totalRevenue: number;
  availableBalance: number;
  pendingBalance: number;
  transactions: Transaction[];
  withdrawFunds: (amount: number) => void;
  addTransaction: (transaction: Omit<Transaction, "id" | "date">) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Transactions par défaut pour la démo
const defaultTransactions: Transaction[] = [
  {
    id: "1",
    type: "vente",
    amount: 45000,
    status: "completed",
    description: "Vente - iPhone 12 Pro",
    date: new Date("2026-04-20"),
    orderId: "ORD-001",
  },
  {
    id: "2",
    type: "vente",
    amount: 125000,
    status: "completed",
    description: "Vente - Laptop Dell XPS",
    date: new Date("2026-04-18"),
    orderId: "ORD-002",
  },
  {
    id: "3",
    type: "vente",
    amount: 28000,
    status: "pending",
    description: "Vente - Samsung Galaxy Buds",
    date: new Date("2026-04-22"),
    orderId: "ORD-003",
  },
  {
    id: "4",
    type: "retrait",
    amount: -50000,
    status: "completed",
    description: "Retrait vers Mobile Money",
    date: new Date("2026-04-15"),
  },
  {
    id: "5",
    type: "vente",
    amount: 85000,
    status: "completed",
    description: "Vente - Apple Watch Series 7",
    date: new Date("2026-04-12"),
    orderId: "ORD-004",
  },
  {
    id: "6",
    type: "commission",
    amount: -3500,
    status: "completed",
    description: "Commission plateforme (5%)",
    date: new Date("2026-04-20"),
  },
  {
    id: "7",
    type: "vente",
    amount: 65000,
    status: "pending",
    description: "Vente - AirPods Pro",
    date: new Date("2026-04-23"),
    orderId: "ORD-005",
  },
];

export function WalletProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("orion-wallet-transactions");
    return saved ? JSON.parse(saved).map((t: Transaction) => ({
      ...t,
      date: new Date(t.date)
    })) : defaultTransactions;
  });

  useEffect(() => {
    localStorage.setItem("orion-wallet-transactions", JSON.stringify(transactions));
  }, [transactions]);

  // Calculer les statistiques
  const totalRevenue = transactions
    .filter((t) => t.type === "vente" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingBalance = transactions
    .filter((t) => t.type === "vente" && t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawn = transactions
    .filter((t) => t.type === "retrait" && t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalCommissions = transactions
    .filter((t) => t.type === "commission" && t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const availableBalance = totalRevenue - totalWithdrawn - totalCommissions;

  const withdrawFunds = (amount: number) => {
    if (amount > availableBalance) {
      alert("Solde insuffisant pour effectuer ce retrait");
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: "retrait",
      amount: -amount,
      status: "completed",
      description: "Retrait vers Mobile Money",
      date: new Date(),
    };

    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const addTransaction = (transaction: Omit<Transaction, "id" | "date">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date(),
    };

    setTransactions((prev) => [newTransaction, ...prev]);
  };

  return (
    <WalletContext.Provider
      value={{
        totalRevenue,
        availableBalance,
        pendingBalance,
        transactions,
        withdrawFunds,
        addTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet doit être utilisé dans un WalletProvider");
  }
  return context;
}

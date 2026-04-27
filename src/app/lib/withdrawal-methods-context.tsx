import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface WithdrawalMethod {
  id: string;
  name: string;
  description: string;
  logo: string;
  accountNumber?: string;
  accountName?: string;
  active: boolean;
  createdAt: Date;
}

interface WithdrawalMethodsContextType {
  methods: WithdrawalMethod[];
  addMethod: (method: Omit<WithdrawalMethod, "id" | "createdAt">) => void;
  updateMethod: (id: string, updates: Partial<WithdrawalMethod>) => void;
  deleteMethod: (id: string) => void;
  toggleMethodStatus: (id: string) => void;
}

const WithdrawalMethodsContext = createContext<WithdrawalMethodsContextType | undefined>(undefined);

// Méthodes par défaut pour la démo
const defaultMethods: WithdrawalMethod[] = [
  {
    id: "1",
    name: "Orange Money",
    description: "Retrait via Orange Money",
    logo: "",
    accountNumber: "+221 77 123 45 67",
    accountName: "Amadou Diallo",
    active: true,
    createdAt: new Date("2025-01-10"),
  },
  {
    id: "2",
    name: "Wave",
    description: "Retrait via Wave",
    logo: "",
    accountNumber: "+221 77 123 45 67",
    accountName: "Amadou Diallo",
    active: true,
    createdAt: new Date("2025-02-15"),
  },
];

export function WithdrawalMethodsProvider({ children }: { children: ReactNode }) {
  const [methods, setMethods] = useState<WithdrawalMethod[]>(() => {
    const saved = localStorage.getItem("orion-withdrawal-methods");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((method: any) => ({
        ...method,
        createdAt: new Date(method.createdAt)
      }));
    }
    return defaultMethods;
  });

  useEffect(() => {
    localStorage.setItem("orion-withdrawal-methods", JSON.stringify(methods));
  }, [methods]);

  const addMethod = (methodData: Omit<WithdrawalMethod, "id" | "createdAt">) => {
    const newMethod: WithdrawalMethod = {
      ...methodData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setMethods((prev) => [...prev, newMethod]);
  };

  const updateMethod = (id: string, updates: Partial<WithdrawalMethod>) => {
    setMethods((prev) =>
      prev.map((method) => (method.id === id ? { ...method, ...updates } : method))
    );
  };

  const deleteMethod = (id: string) => {
    setMethods((prev) => prev.filter((method) => method.id !== id));
  };

  const toggleMethodStatus = (id: string) => {
    setMethods((prev) =>
      prev.map((method) =>
        method.id === id ? { ...method, active: !method.active } : method
      )
    );
  };

  return (
    <WithdrawalMethodsContext.Provider
      value={{
        methods,
        addMethod,
        updateMethod,
        deleteMethod,
        toggleMethodStatus,
      }}
    >
      {children}
    </WithdrawalMethodsContext.Provider>
  );
}

export function useWithdrawalMethods() {
  const context = useContext(WithdrawalMethodsContext);
  if (!context) {
    throw new Error("useWithdrawalMethods doit être utilisé dans un WithdrawalMethodsProvider");
  }
  return context;
}

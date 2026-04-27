import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface Store {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  logo?: string;
  createdAt: Date;
  active: boolean;
}

interface StoreContextType {
  stores: Store[];
  activeStore: Store | null;
  setActiveStore: (store: Store) => void;
  addStore: (store: Omit<Store, "id" | "createdAt">) => void;
  updateStore: (id: string, updates: Partial<Store>) => void;
  deleteStore: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Boutiques par défaut pour demo
const defaultStores: Store[] = [
  {
    id: "1",
    name: "Boutique Central Market",
    description: "Notre boutique principale au coeur de Dakar",
    category: "Électronique",
    location: "Dakar Central",
    createdAt: new Date("2024-01-15"),
    active: true,
  },
  {
    id: "2",
    name: "Boutique Sandaga",
    description: "Point de vente au marché Sandaga",
    category: "Mode & Accessoires",
    location: "Sandaga",
    createdAt: new Date("2024-06-20"),
    active: true,
  },
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [stores, setStores] = useState<Store[]>(() => {
    const saved = localStorage.getItem("orion-stores");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((store: any) => ({
        ...store,
        createdAt: new Date(store.createdAt)
      }));
    }
    return defaultStores;
  });

  const [activeStore, setActiveStoreState] = useState<Store | null>(() => {
    const savedActiveId = localStorage.getItem("orion-active-store");
    if (savedActiveId) {
      const savedStores = localStorage.getItem("orion-stores");
      let storesList = defaultStores;
      if (savedStores) {
        const parsed = JSON.parse(savedStores);
        storesList = parsed.map((store: any) => ({
          ...store,
          createdAt: new Date(store.createdAt)
        }));
      }
      const store = storesList.find((s: Store) => s.id === savedActiveId);
      return store || null;
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem("orion-stores", JSON.stringify(stores));
  }, [stores]);

  const setActiveStore = (store: Store) => {
    setActiveStoreState(store);
    localStorage.setItem("orion-active-store", store.id);
  };

  const addStore = (storeData: Omit<Store, "id" | "createdAt">) => {
    const newStore: Store = {
      ...storeData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setStores((prev) => [...prev, newStore]);
  };

  const updateStore = (id: string, updates: Partial<Store>) => {
    setStores((prev) =>
      prev.map((store) => (store.id === id ? { ...store, ...updates } : store))
    );
    if (activeStore?.id === id) {
      setActiveStoreState((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deleteStore = (id: string) => {
    setStores((prev) => prev.filter((store) => store.id !== id));
    if (activeStore?.id === id) {
      setActiveStoreState(null);
      localStorage.removeItem("orion-active-store");
    }
  };

  return (
    <StoreContext.Provider
      value={{
        stores,
        activeStore,
        setActiveStore,
        addStore,
        updateStore,
        deleteStore,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore doit être utilisé dans un StoreProvider");
  }
  return context;
}

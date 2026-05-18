import { createContext, useContext, useState, useEffect, useCallback, type ReactNode, } from "react";
import type { Boutique } from "../model/model";
import { boutiqueService } from "../service/boutique.service";
import { API_BASE_URL } from "../service/api.config";

interface StoreContextType {
  stores: Boutique[];
  activeStore: Boutique | null;
  loading: boolean;
  error: string | null;
  setActiveStore: (store: Boutique) => void;
  addStore: (store: Omit<Boutique, "id" | "createdAt"> & { file?: File | null }) => Promise<void>;
  updateStore: (id: number, updates: Partial<Boutique>) => Promise<void>;
  deleteStore: (id: number) => Promise<void>;
  refreshStores: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// ─── Adaptateurs ─────────────────────────────────────────────────────────────
// Convertit un Boutique (backend) → Boutique (frontend)
function toStore(b: Boutique): Boutique {
  return {
    id: b.id,
    nom: b.nom,
    description: b.description ?? "",
    category: b.category ?? "",
    location: b.location ?? "",
    logo: b.logo ? (b.logo.startsWith('/') ? `${API_BASE_URL}${b.logo}` : b.logo) : undefined,
    dateCreation: b.dateCreation ? new Date(b.dateCreation) : null,
    active: b.active ?? true,
  };
}

// Convertit un Boutique (frontend) → Partial<Boutique> (backend)
// function toBoutique(s: Partial<Boutique> & { proprietaireId?: number }): Partial<Boutique> {
//   return {
//     nom: s.nom,
//     description: s.description,
//     category: s.category,
//     location: s.location,
//     logo: s.logo,
//     active: s.active,
//     proprietaireId: s.proprietaireId,
//   };
// }
// ─────────────────────────────────────────────────────────────────────────────
export function StoreProvider({ children }: { children: ReactNode }) {
  const [stores, setStores] = useState<Boutique[]>([]);
  const [activeStore, setActiveStoreState] = useState<Boutique | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Chargement initial ───────────────────────────────────────────────────
  const refreshStores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const boutiques = await boutiqueService.getAll();
      const mapped = boutiques.map(toStore);
      setStores(mapped);

      // Restaurer la boutique active depuis localStorage si elle existe encore
      const savedActiveId = localStorage.getItem("orion-active-store");
      if (savedActiveId) {
        const found = mapped.find((s) => s.id === Number(savedActiveId));
        setActiveStoreState(found ?? null);
        if (!found) localStorage.removeItem("orion-active-store");
      }
    } catch { setError("Impossible de charger les boutiques.");
    } finally { setLoading(false);}
  }, []);

  useEffect(() => { refreshStores();}, [refreshStores]);

  // ── Boutique active ──────────────────────────────────────────────────────
  const setActiveStore = useCallback((store: Boutique) => {
    setActiveStoreState(store);
    localStorage.setItem("orion-active-store", store.id.toString());
  }, []);

 

const addStore = useCallback(
  async (storeData: Omit<Boutique, "id" | "createdAt"> & {file?: File | null;}) => {
    setError(null);

    try {
      const fd = new FormData();

      const boutiquePayload = {
        nom: storeData.nom,
        description: storeData.description,
        category: storeData.category,
        location: storeData.location,
        active: storeData.active,
      };

      fd.append("data", JSON.stringify(boutiquePayload),);
      if (storeData.file) {fd.append("logo", storeData.file);}

      const created = await boutiqueService.create(fd);

      setStores((prev) => [...prev, toStore(created)]);
    } catch { setError("Erreur lors de la création de la boutique."); throw new Error("create_failed");}
  },
  []
);

// ── Modifier ─────────────────────────────────────────────────────────────
const updateStore = useCallback(
  async (id: number, updates: Partial<Boutique> & {file?: File | null;}) => {
    setError(null);
    try {
      const fd = new FormData();

      const boutiquePayload = {
        nom: updates.nom,
        description: updates.description,
        category: updates.category,
        location: updates.location,
        active: updates.active,
      };

      fd.append("data", JSON.stringify(boutiquePayload),);

      if (updates.file) { fd.append("logo", updates.file);}

      const updated = await boutiqueService.update(Number(id), fd,);
      const mapped = toStore(updated);

      setStores((prev) => prev.map((s) => s.id === id ? { ...s, ...mapped } : s));

      if (activeStore?.id === id) { setActiveStoreState((prev) => prev ? { ...prev, ...mapped } : null);}

    } catch {setError("Erreur lors de la mise à jour de la boutique."); throw new Error("update_failed");}
  },
  [activeStore]
);

  // ── Supprimer ────────────────────────────────────────────────────────────
  const deleteStore = useCallback(
    async (id: number) => {
      setError(null);
      try {
        await boutiqueService.delete(Number(id));
        setStores((prev) => prev.filter((s) => s.id !== id));
        if (activeStore?.id === id) {
          setActiveStoreState(null);
          localStorage.removeItem("orion-active-store");
        }
      } catch {
        setError("Erreur lors de la suppression de la boutique.");
        throw new Error("delete_failed");
      }
    },
    [activeStore]
  );

  return (
    <StoreContext.Provider
      value={{
        stores,
        activeStore,
        loading,
        error,
        setActiveStore,
        addStore,
        updateStore,
        deleteStore,
        refreshStores,
      }}>{children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {throw new Error("useStore doit être utilisé dans un StoreProvider");}
  return context;
}
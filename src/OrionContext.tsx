import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getCurrentUser, loginUser, registerUser } from "./lib/auth-service";
import { getProducts, type ProductRecord } from "./lib/catalog-service";
import { getUploadUrl } from "./lib/api";
import { getMyCart, saveMyCart } from "./lib/cart-service";

export type UserRole = "UTILISATEUR" | "COMMERCANT" | "ADMIN";

export type OrionSession = {
  token: string;
  userId?: number;
  email: string;
  name: string;
  role: UserRole;
  image?: string;
  activeStoreId?: string | null;
};

export type Product = {
  id: string;
  name: string;
  store: string;
  category: string;
  price: number;
  promotionalPrice?: number | null;
  stock: number;
  description: string;
  image: string;
  secondaryImages?: string[];
  status?: string;
  featured?: boolean;
  country?: string;
  ownerId?: number;
  storeId?: number;
};

export type OpportunityRecord = {
  id: string;
  title: string;
  company: string;
  type: string;
  location: string;
  amount: string;
  duration: string;
  description: string;
  requirements?: string[];
  accent: string;
};

export type CartLine = {
  product: Product;
  quantity: number;
};

const liveAttributionKey = "orion-live-attribution";

function readLiveAttribution(): number | null {
  if (typeof window === "undefined") return null;
  const value = Number(window.localStorage.getItem(liveAttributionKey));
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

export const fallbackCatalogProducts: Product[] = [
  {
    id: "kente-tote",
    name: "Tote Kente Héritage",
    store: "Atelier Naya",
    category: "Mode",
    price: 18500,
    stock: 18,
    description: "Un cabas structuré tissé à Accra, pensé pour accompagner les journées qui bougent.",
    image: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1100&q=88",
    featured: true,
  },
  {
    id: "sheabutter-box",
    name: "Rituel Karité & Baobab",
    store: "Maison Sira",
    category: "Beauté",
    price: 12500,
    stock: 24,
    description: "Un duo de soins naturels, formulé au Burkina Faso à partir d'ingrédients sourcés avec soin.",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1100&q=88",
    featured: true,
  },
  {
    id: "ceramic-set",
    name: "Service Terre Rouge",
    store: "Studio Sira",
    category: "Maison",
    price: 32000,
    stock: 9,
    description: "Six pièces en grès tournées à la main, avec une finition mate inspirée des terres du Sahel.",
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1100&q=88",
    featured: true,
  },
  {
    id: "woven-lamp",
    name: "Lampe Sable",
    store: "Kora Living",
    category: "Maison",
    price: 27500,
    stock: 7,
    description: "Une lumière douce et sculpturale, réalisée avec des fibres naturelles tressées à la main.",
    image: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1100&q=88",
  },
  {
    id: "indigo-print",
    name: "Étoffe Indigo 01",
    store: "Mali Matière",
    category: "Édition",
    price: 9800,
    stock: 31,
    description: "Une pièce textile teinte à l'indigo, chaque variation portant la trace du geste de l'artisan.",
    image: "https://images.unsplash.com/photo-1577083288073-40892c0860a4?auto=format&fit=crop&w=1100&q=88",
  },
  {
    id: "coffee-box",
    name: "Café Mont Cameroun",
    store: "Altitude 4",
    category: "Épicerie",
    price: 8500,
    stock: 42,
    description: "Un café de terroir aux notes de cacao, torréfié en petites quantités pour garder son relief.",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1100&q=88",
  },
];

export let catalogProducts: Product[] = [...fallbackCatalogProducts];

export function syncCatalogProducts(products: Product[]): void {
  catalogProducts = products;
}

export function mapBackendProduct(product: ProductRecord): Product {
  const price = Number(product.prix ?? 0);
  const promotionalPrice = product.prixPromotionnel == null || product.prixPromotionnel === ''
    ? null
    : Number(product.prixPromotionnel);
  const category = typeof product.categorie === "string"
    ? product.categorie
    : product.categorie?.libellé;
  return {
    id: String(product.id),
    name: product.nom,
    store: product.boutiqueNom ?? "Boutique Orion",
    category: category || "Divers",
    price: Number.isFinite(price) ? price : 0,
    promotionalPrice: Number.isFinite(promotionalPrice) && promotionalPrice > 0 && promotionalPrice < price ? promotionalPrice : null,
    stock: Number(product.stock ?? 0),
    description: product.description ?? "Produit disponible sur Orion.",
    image: getUploadUrl(product.image || product.images_secondaires?.[0]) || "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=88",
    secondaryImages: (product.images_secondaires ?? []).map((image) => getUploadUrl(image)).filter(Boolean),
    status: product.statut,
    featured: true,
    country: product.pays || undefined,
    ownerId: product.proprietaireId ?? undefined,
    storeId: product.boutiqueId ?? undefined,
  };
}

export function getSellingPrice(product: Pick<Product, "price" | "promotionalPrice">): number {
  const promotionalPrice = Number(product.promotionalPrice);
  return Number.isFinite(promotionalPrice) && promotionalPrice > 0 && promotionalPrice < product.price
    ? promotionalPrice
    : product.price;
}

export const opportunityCatalog: OpportunityRecord[] = [
  {
    id: "brand-director",
    title: "Direction artistique pour une maison engagée",
    company: "Studio Serein",
    type: "Collaboration",
    location: "Abidjan · Hybride",
    amount: "450 000 FCFA",
    duration: "3 semaines",
    description: "Studio Serein cherche un regard créatif pour accompagner le lancement d'une collection d'objets du quotidien.",
    accent: "gold",
  },
  {
    id: "social-manager",
    title: "Social media manager pour une marque locale",
    company: "Maison Sira",
    type: "Mission rémunérée",
    location: "Dakar · À distance",
    amount: "250 000 FCFA / mois",
    duration: "2 mois",
    description: "Faites grandir une marque de soin naturel avec une stratégie éditoriale claire et une voix chaleureuse.",
    accent: "coral",
  },
  {
    id: "delivery-partner",
    title: "Partenaire livraison pour commerces de quartier",
    company: "Mbolo Market",
    type: "Service",
    location: "Lomé · Sur place",
    amount: "À la course",
    duration: "Flexible",
    description: "Rejoignez un réseau de livraison fiable pour aider les petites boutiques à mieux servir leurs clients.",
    accent: "mint",
  },
  {
    id: "product-photographer",
    title: "Photographe produit pour une collection d'automne",
    company: "L'Atelier N°7",
    type: "Projet court",
    location: "Cotonou · 2 jours",
    amount: "180 000 FCFA",
    duration: "2 jours",
    description: "Créez une série d'images simples et sensibles pour raconter le travail de la matière et du geste.",
    accent: "blue",
  },
];

const demoSessionKey = "orion-demo-session";
const legacyCartStorageKey = "orion-cart";
const guestCartStorageKey = "orion-cart:guest";
const userCartStorageKey = (userId: number) => `orion-cart:user:${userId}`;

function readStoredCart(key = guestCartStorageKey): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = window.localStorage.getItem(key) ?? window.localStorage.getItem(legacyCartStorageKey);
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((line): line is CartLine => Boolean(
      line && typeof line === "object" &&
      typeof line.product?.id === "string" &&
      Number.isSafeInteger(Number(line.quantity)) && Number(line.quantity) > 0,
    ));
  } catch {
    return [];
  }
}

function readStoredSession(): OrionSession | null {
  if (typeof window === "undefined") return null;
  try {
    const value: string | null = window.localStorage.getItem(demoSessionKey);
    return value ? (JSON.parse(value) as OrionSession) : null;
  } catch {
    return null;
  }
}

type OrionContextValue = {
  session: OrionSession | null;
  products: Product[];
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    role: UserRole;
    nom?: string;
    prenom?: string;
    contact?: string;
    indicatifPays?: string;
  }) => Promise<void>;
  logout: () => void;
  updateSession: (updates: Partial<Omit<OrionSession, "role">>) => void;
  activeStoreId: string | null;
  setActiveStoreId: (storeId: string | null) => void;
  cart: CartLine[];
  cartCount: number;
  cartTotal: number;
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  liveAttribution: number | null;
  setLiveAttribution: (liveSessionId: number | null) => void;
};

const OrionContext = createContext<OrionContextValue | undefined>(undefined);

export function OrionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<OrionSession | null>(readStoredSession);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeStoreId, setActiveStoreIdState] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("orion-active-store") ?? readStoredSession()?.activeStoreId ?? "";
  });
  const [cart, setCart] = useState<CartLine[]>(() => {
    const initialSession = readStoredSession();
    return readStoredCart(initialSession?.userId ? userCartStorageKey(initialSession.userId) : guestCartStorageKey);
  });
  const cartRef = useRef(cart);
  const cartReadyTokenRef = useRef<string | null>(null);
  const pendingCartSaveRef = useRef<number | undefined>(undefined);
  cartRef.current = cart;
  const [liveAttribution, setLiveAttributionState] = useState<number | null>(readLiveAttribution);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = session?.userId ? userCartStorageKey(session.userId) : guestCartStorageKey;
    window.localStorage.setItem(key, JSON.stringify(cart));
    window.localStorage.removeItem(legacyCartStorageKey);
  }, [cart, session?.userId]);

  useEffect(() => {
    let isMounted = true;

    getProducts()
      .then((products) => {
        if (!isMounted) return;
        const mapped = products.map(mapBackendProduct);
        console.log("Fetched products from backend:", mapped);
        setProducts(mapped);
        syncCatalogProducts(mapped);
        const mappedById = new Map(mapped.map((product) => [product.id, product]));
        setCart((current) => current.map((line) => {
          const latestProduct = mappedById.get(line.product.id);
          return latestProduct ? { ...line, product: latestProduct } : line;
        }));
      })
      .catch(() => {
        if (isMounted) {
          console.error("Failed to fetch products from backend.");
          setProducts([]);
          syncCatalogProducts([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const persistSession = (nextSession: OrionSession | null): void => {
    setSession(nextSession);
    if (typeof window === "undefined") return;
    if (nextSession) window.localStorage.setItem(demoSessionKey, JSON.stringify(nextSession));
    else {
      window.localStorage.removeItem(demoSessionKey);
      window.localStorage.removeItem("orion-token");
      window.localStorage.removeItem("orion-active-store");
      setActiveStoreIdState("");
      setCart(readStoredCart(guestCartStorageKey));
    }
  };

  useEffect(() => {
    if (!session?.token) return;
    let isMounted = true;
    getCurrentUser(session.token)
      .then((user) => {
        if (!isMounted) return;
        persistSession({ ...session, userId: user.id });
      })
      .catch((error) => {
        if (!isMounted) return;
        const message = error instanceof Error ? error.message : "";
        if (/token invalide|token.*expir|session invalide|session.*expir|unauthorized|utilisateur.*trouv|not found|authentification requise/i.test(message)) {
          persistSession(null);
        } else {
          console.warn("La session n’a pas pu être vérifiée pour le moment.", error);
        }
      });
    return () => { isMounted = false; };
  }, [session?.token]);

  useEffect(() => {
    const token = session?.token;
    if (!token) {
      cartReadyTokenRef.current = null;
      return;
    }
    let isMounted = true;
    cartReadyTokenRef.current = null;
    getMyCart(token)
      .then(async (serverCart) => {
        if (!isMounted) return;
        const merged = new Map(serverCart.items.flatMap(({ product, quantity }) => {
          const mappedProduct = mapBackendProduct(product);
          const availableQuantity = Math.min(quantity, mappedProduct.stock);
          return availableQuantity > 0 ? [[mappedProduct.id, { product: mappedProduct, quantity: availableQuantity }] as const] : [];
        }));
        for (const localLine of cartRef.current) {
          const existing = merged.get(localLine.product.id);
          const quantity = Math.min(Math.max(existing?.quantity ?? 0, localLine.quantity), localLine.product.stock);
          if (quantity > 0) merged.set(localLine.product.id, { product: localLine.product, quantity });
        }
        const nextCart = [...merged.values()];
        setCart(nextCart);
        cartReadyTokenRef.current = token;
        try {
          await saveMyCart(token, nextCart.map((line) => ({ productId: Number(line.product.id), quantity: line.quantity })));
          window.localStorage.removeItem(guestCartStorageKey);
        } catch (error) {
          console.warn("Impossible de synchroniser le panier avec Orion.", error);
        }
      })
      .catch((error) => console.warn("Impossible de charger le panier du compte.", error));
    return () => { isMounted = false; };
  }, [session?.token]);

  useEffect(() => {
    if (!session?.token || cartReadyTokenRef.current !== session.token) return;
    if (pendingCartSaveRef.current !== undefined) window.clearTimeout(pendingCartSaveRef.current);
    pendingCartSaveRef.current = window.setTimeout(() => {
      void saveMyCart(session.token, cart.map((line) => ({
        productId: Number(line.product.id),
        quantity: line.quantity,
      }))).catch((error) => console.warn("Impossible d’enregistrer le panier côté serveur.", error));
    }, 300);
    return () => {
      if (pendingCartSaveRef.current !== undefined) window.clearTimeout(pendingCartSaveRef.current);
    };
  }, [session?.token, cart]);

  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    const response = await loginUser(email, password);
    const user = response.user;
    const displayName = [user.prenom, user.nom].filter(Boolean).join(" ") || email.split("@")[0]?.replace(/[._-]/g, " ") || "Membre Orion";
    const nextRole = (user.role as UserRole) ?? role;
    setActiveStoreIdState("");
    if (typeof window !== "undefined") window.localStorage.removeItem("orion-active-store");

    persistSession({
      token: response.access_token,
      userId: user.id,
      email: user.email,
      name: displayName,
      role: nextRole,
    });

    if (typeof window !== "undefined") {
      window.localStorage.setItem("orion-token", response.access_token);
    }

    if (response.access_token) {
      try {
        await getCurrentUser(response.access_token);
      } catch {
        // Non-blocking: the session already exists and the app keeps working.
      }
    }
  };

  const register = async (payload: {
    email: string;
    password: string;
    role: UserRole;
    nom?: string;
    prenom?: string;
    contact?: string;
    indicatifPays?: string;
  }): Promise<void> => {
    const registrationResponse = await registerUser({
      ...payload,
      nom: payload.nom ?? payload.email.split("@")[0] ?? "Membre",
      prenom: payload.prenom ?? "Orion",
      contact: payload.contact ?? "",
      indicatifPays: payload.indicatifPays,
      role: payload.role,
    });

    // Some deployed API instances still return the created user without a JWT.
    // Log in immediately in that case so registration works with both response shapes.
    const response = registrationResponse?.access_token && registrationResponse?.user
      ? registrationResponse
      : await loginUser(payload.email, payload.password);

    const user = response.user;
    const displayName = [user.prenom, user.nom].filter(Boolean).join(" ") || payload.email.split("@")[0]?.replace(/[._-]/g, " ") || "Membre Orion";
    setActiveStoreIdState("");
    if (typeof window !== "undefined") window.localStorage.removeItem("orion-active-store");

    persistSession({
      token: response.access_token,
      userId: user.id,
      email: user.email,
      name: displayName,
      role: (user.role as UserRole) ?? payload.role,
    });

    if (typeof window !== "undefined") {
      window.localStorage.setItem("orion-token", response.access_token);
    }
  };

  const logout = (): void => persistSession(null);

  const updateSession = (updates: Partial<Omit<OrionSession, "role">>): void => {
    if (session) persistSession({ ...session, ...updates });
  };

  const setActiveStoreId = (storeId: string | null): void => {
    setActiveStoreIdState(storeId ?? "");
    if (typeof window !== "undefined") {
      if (storeId) window.localStorage.setItem("orion-active-store", storeId);
      else window.localStorage.removeItem("orion-active-store");
    }
    if (session) persistSession({ ...session, activeStoreId: storeId });
  };

  const addToCart = (product: Product, quantity: number = 1): void => {
    setCart((current) => {
      const existing: CartLine | undefined = current.find((line) => line.product.id === product.id);
      if (!existing) return [...current, { product, quantity: Math.max(1, quantity) }];
      return current.map((line) => line.product.id === product.id ? { ...line, quantity: Math.min(line.quantity + quantity, product.stock) } : line);
    });
  };

  const updateCartQuantity = (productId: string, quantity: number): void => {
    setCart((current) => current.map((line) => line.product.id === productId ? { ...line, quantity: Math.max(1, Math.min(quantity, line.product.stock)) } : line));
  };

  const removeFromCart = (productId: string): void => setCart((current) => current.filter((line) => line.product.id !== productId));
  const clearCart = useCallback((): void => setCart([]), []);
  const setLiveAttribution = useCallback((liveSessionId: number | null): void => {
    setLiveAttributionState(liveSessionId);
    if (typeof window === "undefined") return;
    if (liveSessionId && Number.isSafeInteger(liveSessionId) && liveSessionId > 0) {
      window.localStorage.setItem(liveAttributionKey, String(liveSessionId));
    } else {
      window.localStorage.removeItem(liveAttributionKey);
    }
  }, []);

  const value: OrionContextValue = useMemo(() => ({
    session,
    products,
    login,
    register,
    logout,
    updateSession,
    activeStoreId,
    setActiveStoreId,
    cart,
    cartCount: cart.reduce((total, line) => total + line.quantity, 0),
    cartTotal: cart.reduce((total, line) => total + getSellingPrice(line.product) * line.quantity, 0),
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    liveAttribution,
    setLiveAttribution,
  }), [session, products, activeStoreId, cart, liveAttribution, setLiveAttribution]);

  return <OrionContext.Provider value={value}>{children}</OrionContext.Provider>;
}

export function useOrion(): OrionContextValue {
  const context: OrionContextValue | undefined = useContext(OrionContext);
  if (!context) throw new Error("useOrion must be used inside OrionProvider");
  return context;
}

export function formatCfa(value: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}

export function roleLabel(role: UserRole | undefined): string {
  if (role === "COMMERCANT") return "Commerçant";
  if (role === "ADMIN") return "Administrateur";
  return "Jeune entrepreneur";
}

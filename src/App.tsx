import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthPage } from "./pages/AuthPages";
import { OrionProvider, useOrion } from "./OrionContext";
import { getMyStores } from "./lib/store-service";
import {
  CartPage,
  CheckoutPage,
  HomePage,
  MarketplacePage,
  OpportunityDetailPage,
  OpportunitiesPage,
  ProductPage,
  ProfileSelectionPage,
  PurchasesPage,
  PublicLayout,
  StoreSelectionPage,
} from "./pages/PublicPages";

const queryClient = new QueryClient();

function DashboardGate() {
  const { session, activeStoreId } = useOrion();
  const location = useLocation();
  const [ownedStoreIds, setOwnedStoreIds] = useState<string[] | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!session?.token || session.role !== "COMMERCANT") {
      setOwnedStoreIds(null);
      return () => { isMounted = false; };
    }
    setOwnedStoreIds(null);
    getMyStores(session.token)
      .then((stores) => {
        if (isMounted) setOwnedStoreIds(stores.map((store) => String(store.id)));
      })
      .catch(() => {
        if (isMounted) setOwnedStoreIds([]);
      });
    return () => { isMounted = false; };
  }, [session?.token, session?.role]);

  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  const merchantOnlyPath: boolean = /^\/dashboard\/(stores|products|subscriptions|wallet|withdrawal-methods)(\/|$)/.test(location.pathname);
  if (merchantOnlyPath && session.role !== "COMMERCANT") return <Navigate to="/dashboard" replace />;

  // Store management must remain reachable so a merchant can create/select their first store.
  const isStoreManagementPath = /^\/dashboard\/stores(\/|$)/.test(location.pathname);
  if (session.role === "COMMERCANT" && !isStoreManagementPath) {
    if (ownedStoreIds === null) return <div className="dashboard-gate-loading" role="status">Chargement de votre boutique…</div>;
    if (!activeStoreId || !ownedStoreIds.includes(activeStoreId)) {
      return <Navigate to="/store-selection" replace state={{ from: location.pathname }} />;
    }
  }
  return <Index />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <OrionProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/opportunities" element={<OpportunitiesPage />} />
              <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/purchases" element={<PurchasesPage />} />
            </Route>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage register />} />
            <Route path="/profile-selection" element={<ProfileSelectionPage />} />
            <Route path="/store-selection" element={<StoreSelectionPage />} />
            <Route path="/dashboard/*" element={<DashboardGate />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </OrionProvider>
  </QueryClientProvider>
);

export default App;

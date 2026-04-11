import { createBrowserRouter } from "react-router";
import { PublicLayout } from "./components/public-layout";
import { DashboardLayout } from "./components/dashboard-layout";
import { Home } from "./pages/home";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import { ProfileSelection } from "./pages/profile-selection";
import { Dashboard } from "./pages/dashboard";
import { Marketplace } from "./pages/marketplace";
import { ProductDetail } from "./pages/product-detail";
import { Checkout } from "./pages/checkout";
import { Analytics } from "./pages/analytics";
import { Messages } from "./pages/messages";
import { Profile } from "./pages/profile";
import { Opportunities } from "./pages/opportunities";
import { Products } from "./pages/products";
import { AddProduct } from "./pages/add-product";
import { ProductDetailAdmin } from "./pages/product-detail-admin";
import { PublicOpportunities } from "./pages/public-opportunities";
import { OpportunityDetail } from "./pages/opportunity-detail";
import { AdminOpportunities } from "./pages/admin-opportunities";
import { CreateOpportunity } from "./pages/create-opportunity";
import { AdminOpportunityDetail } from "./pages/admin-opportunity-detail";
import { Cart } from "./pages/cart";
import { CheckoutPage } from "./pages/checkout-page";

export const router = createBrowserRouter([
  // Public routes (accueil et marketplace accessibles sans connexion)
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "marketplace",
        element: <Marketplace />,
      },
      {
        path: "product/:id",
        element: <ProductDetail />,
      },
      {
        path: "opportunities",
        element: <PublicOpportunities />,
      },
      {
        path: "opportunities/:id",
        element: <OpportunityDetail />,
      },
      {
        path: "cart",
        element: <Cart />,
      },
      {
        path: "checkout",
        element: <CheckoutPage />,
      },
    ],
  },
  // Auth routes (sans layout)
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/profile-selection",
    element: <ProfileSelection />,
  },
  // Dashboard routes (avec sidebar pour utilisateurs connectés)
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "marketplace",
        element: <Marketplace />,
      },
      {
        path: "product/:id",
        element: <ProductDetail />,
      },
      {
        path: "checkout",
        element: <Checkout />,
      },
      {
        path: "analytics",
        element: <Analytics />,
      },
      {
        path: "opportunities",
        element: <AdminOpportunities />,
      },
      {
        path: "opportunities/create",
        element: <CreateOpportunity />,
      },
      {
        path: "opportunities/edit/:id",
        element: <CreateOpportunity />,
      },
      {
        path: "opportunities/:id",
        element: <AdminOpportunityDetail />,
      },
      {
        path: "messages",
        element: <Messages />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "products",
        element: <Products />,
      },
      {
        path: "products/add",
        element: <AddProduct />,
      },
      {
        path: "products/edit/:id",
        element: <AddProduct />,
      },
      {
        path: "products/:id",
        element: <ProductDetailAdmin />,
      },
    ],
  },
]);
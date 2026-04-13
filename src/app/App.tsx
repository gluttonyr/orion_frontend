import { RouterProvider } from "react-router";
import { router } from "./routes";
import { CartProvider } from "./lib/cart-context";
import { NotificationProvider } from "./lib/notification-context";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <NotificationProvider>
      <CartProvider>
        <RouterProvider router={router} />

        {/* IMPORTANT : ici */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          theme="colored"
        />
      </CartProvider>
    </NotificationProvider>
  );
}
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { CartProvider } from "./lib/cart-context";
import { NotificationProvider } from "./lib/notification-context";

export default function App() {
  return (
    <NotificationProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </NotificationProvider>
  );
}
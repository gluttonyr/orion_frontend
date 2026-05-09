import { RouterProvider } from "react-router";
import { router } from "./routes";
import { CartProvider } from "./lib/cart-context";
import { NotificationProvider } from "./lib/notification-context";
import { StoreProvider } from "./lib/store-context";
import { SubscriptionProvider } from "./lib/subscription-context";
import { WalletProvider } from "./lib/wallet-context";
import { WithdrawalMethodsProvider } from "./lib/withdrawal-methods-context";
import { ImageProvider } from "./lib/image-context";
import { UserProvider } from "./lib/user-context";
export default function App() {
  return (
    <UserProvider>
    <ImageProvider>
      <NotificationProvider>
        <SubscriptionProvider>
          <WithdrawalMethodsProvider>
            <WalletProvider>
              <StoreProvider>
                <CartProvider>
                  <RouterProvider router={router} />
                </CartProvider>
              </StoreProvider>
            </WalletProvider>
          </WithdrawalMethodsProvider>
        </SubscriptionProvider>
      </NotificationProvider>
    </ImageProvider>
    </UserProvider>
  );
}
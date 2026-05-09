import { MerchantDashboard } from "./merchant-dashboard";
import { EntrepreneurDashboard } from "./entrepreneur-dashboard";
import { isUser } from "../lib/user-role";

export function Dashboard() {
  // Afficher le bon dashboard selon le type d'utilisateur
  // if (isUser) {
  //   return <EntrepreneurDashboard />;
  // }
  return <MerchantDashboard />;
}
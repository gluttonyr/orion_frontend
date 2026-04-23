import { MerchantDashboard } from "./merchant-dashboard";
import { EntrepreneurDashboard } from "./entrepreneur-dashboard";
import { isEntrepreneur } from "../lib/user-context";

export function Dashboard() {
  // Afficher le bon dashboard selon le type d'utilisateur
  if (isEntrepreneur()) { return <EntrepreneurDashboard />;}
  
  return <MerchantDashboard />;
}
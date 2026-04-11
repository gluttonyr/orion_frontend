import { MerchantAnalytics } from "./merchant-analytics";
import { EntrepreneurAnalytics } from "./entrepreneur-analytics";
import { isEntrepreneur } from "../lib/user-context";

export function Analytics() {
  // Afficher les bonnes analytics selon le type d'utilisateur
  if (isEntrepreneur()) {
    return <EntrepreneurAnalytics />;
  }
  
  return <MerchantAnalytics />;
}

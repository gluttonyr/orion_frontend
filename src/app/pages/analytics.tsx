import { MerchantAnalytics } from "./merchant-analytics";
import { EntrepreneurAnalytics } from "./entrepreneur-analytics";
import { isUser } from "../lib/user-role";

export function Analytics() {
  // Afficher les bonnes analytics selon le type d'utilisateur
  if (isUser) {
    return <EntrepreneurAnalytics />;
  }
  
  return <MerchantAnalytics />;
}

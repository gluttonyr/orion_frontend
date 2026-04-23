import { MerchantAnalytics } from "./merchant-analytics";
import { EntrepreneurAnalytics } from "./entrepreneur-analytics";
import { useUser } from "../lib/user-context";

export function Analytics() {
  const { user } = useUser();

  // Afficher les bonnes analytics selon le type d'utilisateur
  if (user?.role === 'ENTREPRENEUR') {
    return <EntrepreneurAnalytics />;
  }
  
  return <MerchantAnalytics />;
}

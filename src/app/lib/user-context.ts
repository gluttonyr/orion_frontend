// Simuler le contexte utilisateur
// Dans une vraie application, cela viendrait d'un Context React ou d'un state management
export type UserType = "merchant" | "commercant";

// Changer cette valeur pour tester les deux profils
// "merchant" = Client ou Utilisateur
// "commercant" = Jeune Commerçant
export const currentUserType: UserType = "merchant";

// Fonction helper pour vérifier le type d'utilisateur
export const isMerchant = () => currentUserType === "merchant";
export const isEntrepreneur = () => !isMerchant();
export enum UserRole {
  UTILISATEUR = 'UTILISATEUR',
  COMMERCANT = 'COMMERCANT',
}

export interface Utilisateur{
  id: number;
  nom: string;
  prenom: string;
  email: string;
  date_naissance: string;
  adresse: string;
  role: UserRole;
  password: string;
}

export interface produits {
  id: number;
  nom: string;
  description: string;
  prix: number;
  stock: number;
  image: string;
  images_secondaires: string[];
  statut: string;
}

export interface Commande {
  id: number;
  utilisateurId: number;
  produitId: number;
  quantite: number;
  dateCommande: string;
}
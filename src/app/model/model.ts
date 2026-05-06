export enum UserRole {
  UTILISATEUR = 'UTILISATEUR',
  COMMERCANT = 'COMMERCANT',
  ADMIN = 'ADMIN'
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
  specialite?: string;
  localisation?: string;
  contact?: string;
}

export interface produits {
  id: number;
  nom: string;
  description: string;
  prix: number;
  stock: number;
  image: string;
  images_secondaires?: string[];
  statut: string;
  categorie: Categorie;
}

export interface Commande {
  id: number;
  utilisateurId: number;
  produitId: number;
  quantite: number;
  dateCommande: Date;
}


export interface Categorie {
  id: number;
  libellé: string;
  description: string;
}


export interface Demande {
  id: number;
  statue: string;
  date_envoi: Date;
}

export interface Discussion {
  id: number;
  date_debut: Date;
  statue: string;
}

export interface Message {
  id: number;
  heure: Date;
  contenu: string;
  date_debut: Date;
  type_message: string;
  statue: string;
}

export interface Mission {
  id: number;
  nom: string;
  duree: string;
  prix_total: number;
  description: string;
  date_debut: string;
  date_fin: string;
  statue: string;
}

export interface Vente {
  id: number;
  date_achat: string;
  prix_total: number;
  reference: string;
}

export interface Panier {
  id: number;
  utilisateurId: number;
  produitId: number[];
  quantite: number[];
  dateCommande: Date;
  statut: string;
}

export interface Boutique {
  id: number;
  nom: string;
  // Champs alignés avec le backend pour la boutique
  description?: string;
  category?: string;
  location?: string;
  logo?: string;
  active: boolean;
  // Limite de 30 produits par boutique côté backend, ici on expose le compteur
  nombreProduits: number;
  // Selon les réponses de l'API, vous pouvez recevoir la liste d'objets produits
  // ou uniquement leurs identifiants. Laissez les deux en option pour plus de souplesse.
  produits?: produits[];
  produitIds?: number[];
  proprietaireId?: number;
  dateCreation: Date;
}

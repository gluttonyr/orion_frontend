export enum UserRole {
  UTILISATEUR = 'UTILISATEUR',
  COMMERCANT = 'COMMERCANT',
  ADMIN = 'ADMIN'
}

export enum TypeMission {
  AUTRE = 'autre',
  EMPLOI = 'emploi',
  SERVICE = 'service',
  MISSION = 'mission',
  FORMATION = 'formation',
  FREELANCE = 'freelance',
  LIVRAISON = 'livraison',
}

export enum TypePaiement {
  FIXE = 'fixe',
  HORAIRE = 'horaire',
  JOURNALIER = 'journalier',
  MENSUEL = 'mensuel',
  PROJET = 'projet',
}

export enum StatutMission {
  OUVERTE = 'ouverte',
  EN_COURS = 'en_cours',
  TERMINEE = 'terminée',
  ANNULEE = 'annulée',
}

export enum StatutCandidature {
  EN_ATTENTE = 'en_attente',
  ACCEPTE = 'accepté',
  REFUSE = 'refusé',
}

export enum Categories {
  ELECTRONIQUE = "ELECTRONIQUE",
  VETEMENTS = "VETEMENTS",
  MAISON = "MAISON"
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
  utilisateurId: number;
  type: string;
  description: string;
  statut: string;
  date_envoi: Date;
}

export interface Discussion {
  id: number;
  participants?: Utilisateur[];
  messages?: Message[];
  date_debut: Date;
  statut: string;
}

export interface Message {
  id: number;
  discussionId: number;
  utilisateurId: number;
  contenu: string;
  date_envoi: Date;
  type_message: string;
  statue: string;
}

export interface Mission {
  id: number;
  commercantId: number;
  titre: string;
  localisation: string;
  type: string;
  statut: string;
  descriptionCourte: string;
  description: string;
  montant: number;
  frequencePaiement: TypePaiement;
  dureeMission: number;
  datePublication: any;
  dateLimiteCandidature: any;
  requis: string;
  candidatures?: Record<number, { user: number; statut: StatutCandidature }> | StatutCandidature.EN_ATTENTE;
}

export interface Vente {
  id: number;
  utilisateurId: number;
  produits?: produits[];
  quantites: number[];
  date_achat: string;
  prix_total: number;
  reference: string;
  statut: string;
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

export interface Plan {
  id: number;
  titre: string;
  type: string;
  prix: number;
  avantages: string;
  description: string;
  nombreBoutiques: number;
  nombreProduits: number;
  dureeEnMois: number;
  dateCreation: Date;
  dateExpiration: Date;
}

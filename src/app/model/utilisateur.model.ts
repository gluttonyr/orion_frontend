
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
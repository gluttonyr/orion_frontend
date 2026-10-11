# Orion — structure fonctionnelle à conserver pendant la refonte

## Objectif produit

Orion est une marketplace africaine qui relie acheteurs, commerçants et jeunes entrepreneurs. La nouvelle interface peut changer complètement de direction artistique, mais doit conserver les parcours ci-dessous : découverte et achat de produits, gestion de boutiques et produits, opportunités/missions, messagerie, abonnement et portefeuille.

## Utilisateurs et espaces

| Type | Finalité | Espace principal |
| --- | --- | --- |
| Visiteur / acheteur | Découvrir les produits et opportunités, constituer un panier, acheter | Site public |
| Commerçant | Gérer ses boutiques, produits, ventes, abonnement et retraits ; publier des opportunités | Dashboard commerçant |
| Jeune entrepreneur | Trouver des opportunités, candidater, suivre son activité et échanger avec les entreprises | Dashboard entrepreneur |
| Administrateur | Rôle présent dans les données (`ADMIN`), mais aucun espace d'administration séparé n'est actuellement implémenté | À concevoir si nécessaire |

Les rôles techniques existants sont `UTILISATEUR`, `COMMERCANT` et `ADMIN`. Dans le design cible, ne pas confondre les permissions avec le simple affichage : chaque route privée doit être protégée côté interface et côté API.

## Architecture générale

```text
Orion
├── Site public
│   ├── Accueil
│   ├── Marketplace → produit → panier → paiement
│   └── Opportunités → détail → candidature / discussion
├── Authentification et choix de contexte
│   ├── Connexion / inscription
│   ├── Choix du profil
│   └── Choix de la boutique active
└── Espace connecté (dashboard)
    ├── Commerçant : commerce, finances, opportunités et messages
    └── Entrepreneur : opportunités, analyses, messages et profil
```

### Layout public

En-tête fixe : logo Orion, liens Accueil / Marketplace / Opportunités, icône de panier avec compteur, bouton Connexion. Chaque page publique est suivie d’un pied de page avec présentation, liens rapides, support et réseaux sociaux.

### Layout dashboard

Sur ordinateur, une barre latérale fixe ; sur mobile, un en-tête avec menu latéral repliable. Le layout comprend : logo, notifications avec état lu/non lu, navigation adaptée au rôle, profil et déconnexion. Pour le commerçant, il affiche aussi la boutique active et permet de la changer.

## Plan des routes et pages

### Routes publiques

| URL | Page | Contenu et actions à préserver |
| --- | --- | --- |
| `/` | Accueil | Proposition de valeur, statistiques, produits populaires, appels à l'action vers marketplace, inscription et opportunités. |
| `/marketplace` | Marketplace | Catalogue de produits ; recherche/filtrage éventuels ; clic vers la fiche produit. |
| `/product/:id` | Fiche produit publique | Images, prix, stock, description et ajout au panier. |
| `/opportunities` | Opportunités publiques | Liste d'offres/emplois/services/missions/formations/freelance/livraisons ; accès au détail. |
| `/opportunities/:id` | Détail d'une opportunité | Description, entreprise, conditions et action de candidature ou de discussion. |
| `/cart` | Panier | Lignes de produits, quantités, suppression, total et passage au paiement. |
| `/checkout` | Paiement commande | Récapitulatif, lancement du paiement, succès ou erreur de paiement. |

### Authentification et configuration initiale

| URL | Page | Contenu et actions à préserver |
| --- | --- | --- |
| `/login` | Connexion | Email, mot de passe, récupération/affichage des erreurs, redirection vers l'espace approprié. |
| `/register` | Inscription | Création de compte et sélection Commerçant ou Jeune entrepreneur. |
| `/profile-selection` | Choix de profil | Écran visuel de choix du rôle lors de l'onboarding. |
| `/store-selection` | Sélection boutique | Liste des boutiques du commerçant, sélection de la boutique active, création d'une boutique. |

### Routes privées communes

Toutes les routes suivantes sont dans le layout `/dashboard`.

| URL | Page | Fonction |
| --- | --- | --- |
| `/dashboard` | Tableau de bord | Synthèse adaptée au rôle : indicateurs, activité récente, opportunités et actions rapides. |
| `/dashboard/marketplace` | Marketplace interne | Même catalogue, accessible depuis le dashboard. |
| `/dashboard/product/:id` | Fiche produit interne | Consultation d'un produit depuis le dashboard. |
| `/dashboard/checkout` | Paiement interne | Finalisation d'un achat depuis le dashboard. |
| `/dashboard/analytics` | Analyses | Indicateurs et graphiques selon le rôle. |
| `/dashboard/messages` | Messages | Liste des discussions, conversation, envoi de messages et éventuellement médias. |
| `/dashboard/profile` | Profil | Informations personnelles, informations commerciales ou progression entrepreneuriale, abonnement. |

### Gestion commerçant

| URL | Page | Fonction |
| --- | --- | --- |
| `/dashboard/stores` | Mes boutiques | Liste, création, modification et sélection de boutique. |
| `/dashboard/stores/add` | Ajouter une boutique | Formulaire : nom, description, catégorie, localisation, logo. |
| `/dashboard/stores/edit/:id` | Modifier une boutique | Même formulaire en préremplissage. |
| `/dashboard/products` | Mes produits | Liste, recherche/gestion et suppression de produits de la boutique active. |
| `/dashboard/products/add` | Ajouter un produit | Formulaire : image(s), nom, description, prix, stock, statut, catégorie. |
| `/dashboard/products/edit/:id` | Modifier un produit | Même formulaire en préremplissage. |
| `/dashboard/products/:id` | Détail produit gestion | Détails, statistiques et suppression. |
| `/dashboard/opportunities` | Mes opportunités | Liste des opportunités publiées, actions création, édition et suppression. |
| `/dashboard/opportunities/create` | Créer une opportunité | Formulaire d'offre : titre, type, localisation, description, montant, fréquence de paiement, durée, dates, prérequis. |
| `/dashboard/opportunities/edit/:id` | Modifier une opportunité | Même formulaire en préremplissage. |
| `/dashboard/opportunities/:id` | Détail opportunité gestion | Détails, liste des candidats et traitement de candidature. |
| `/dashboard/subscriptions` | Abonnements | Plans Basique, Pro, Premium, Business, avantages et FAQ. |
| `/dashboard/subscriptions/checkout/:plan` | Paiement abonnement | Récapitulatif du plan et choix de moyen de paiement. |
| `/dashboard/subscriptions/success` | Abonnement confirmé | Confirmation et prochaines étapes. |
| `/dashboard/wallet` | Portefeuille | Solde, actions de retrait et historique des transactions. |
| `/dashboard/withdrawal-methods` | Moyens de retrait | Comptes Mobile Money, bancaires ou autres ; activation, modification et suppression. |
| `/dashboard/withdrawal-methods/add` | Ajouter moyen de retrait | Formulaire du compte de retrait. |
| `/dashboard/withdrawal-methods/edit/:id` | Modifier moyen de retrait | Même formulaire en préremplissage. |

### Navigation attendue par rôle

```text
Commerçant
Tableau de bord · Mes boutiques · Mes produits · Marketplace · Portefeuille
· Analyses · Opportunités · Abonnements · Messages · Profil

Entrepreneur
Tableau de bord · Opportunités · Analyses · Messages · Profil
```

## Données et domaines métier

Le frontend communique avec une API REST authentifiée par jeton Bearer stocké localement. Ressources actuellement utilisées :

```text
utilisateur  : inscription, connexion, profil
boutique     : CRUD boutiques et boutique active côté UI
produits     : catalogue et gestion de produits avec téléversement d'images
panier       : panier utilisateur et checkout
vente        : commandes, initialisation de paiement et historique
paiement     : vérification d'une référence de paiement
mission      : opportunités/missions et candidatures
discussion   : conversations
message      : messages texte, image, vidéo, audio ou fichier
plan         : abonnements
categorie    : catégories de produits
demande      : demandes métier
```

Objets principaux : utilisateur, boutique, produit, panier, vente/commande, opportunité (mission), candidature, discussion, message, plan, transaction et moyen de retrait.

## États globaux à conserver ou remplacer proprement

Le projet actuel possède des contextes pour : utilisateur, panier, boutique active, notifications, abonnements, portefeuille, moyens de retrait et URLs d'images. Lors de la refonte, conserver ces capacités, mais il est recommandé de centraliser les données serveur dans une solution de cache de requêtes (par exemple TanStack Query) et de ne garder en état client que les préférences et l'UI.

## Direction de refonte : brief prêt à donner à un générateur ou designer

> Reconcevoir l'interface web responsive d'Orion, une marketplace africaine B2C/B2B. Conserver strictement les parcours, les routes, les rôles et les fonctions du document ci-dessus, sans changer le modèle métier ni les URLs. Créer un système visuel moderne, chaleureux, premium et accessible, mobile-first. Prévoir deux layouts : un site public avec header, panier et footer ; un dashboard avec sidebar responsive, notifications, profil et navigation conditionnelle par rôle. Construire des composants réutilisables pour cartes produit, cartes opportunité, tables/listes de gestion, formulaires, étapes de paiement, cartes KPI, graphiques, messagerie, états vides, chargement, erreur et confirmation destructive. Les pages de gestion doivent privilégier des actions rapides, des filtres et une excellente lisibilité ; les pages publiques doivent valoriser la découverte, la confiance et la conversion. Ne produire aucune page fictive qui remplace les fonctions existantes.

## Points d'attention avant développement

- Les routes dashboard existent, mais la protection d'accès n'est pas centralisée dans le routeur actuel : la refonte doit ajouter un garde d'authentification et de rôle.
- Le rôle `ADMIN` existe dans les modèles mais n'a pas encore de navigation ni de routes dédiées : il faut décider s'il s'agit d'un vrai back-office à créer ou d'un rôle API uniquement.
- Le code sélectionne aujourd'hui un dashboard commerçant par défaut ; l'affichage entrepreneur est présent mais non activé. Il faut corriger cette décision durant l'intégration.
- Plusieurs données (notifications, portefeuille, moyens de retrait, abonnement) sont aujourd'hui gérées localement par contexte ; confirmer les endpoints API à utiliser avant de rendre ces écrans pleinement persistants.

## Description détaillée des écrans existants

Cette section décrit les composants réellement présents dans le projet. Elle sert de spécification fonctionnelle plus précise que le plan de routes.

### Site public et achat

**Accueil (`/`)** — Page marketing construite en cinq séquences : héros avec promesse de commerce africain et deux CTA (Marketplace, inscription) ; bandeau de preuves chiffrées (produits disponibles, paiement sécurisé, pays, commerçants actifs) ; grille de produits populaires chargés depuis le catalogue avec ajout rapide au panier et lien fiche produit ; trois bénéfices (paiement sécurisé, opportunités de croissance, réseau panafricain) ; CTA final pour créer un compte ou explorer le catalogue. Les cartes produit affichent image, nom, notation visuelle, prix et retour temporaire « ajouté au panier ».

**Marketplace (`/marketplace` et `/dashboard/marketplace`)** — Catalogue paginé visuellement sous un titre et un sous-titre. Il charge les produits de l'API, permet une recherche texte, un tri et un accès à chaque fiche. Chaque carte montre image, nom, description courte, prix FCFA, stock restant et une action d'ajout au panier. La refonte doit prévoir chargement, erreur API et état vide « aucun produit trouvé » avec suggestion de modifier les critères.

**Fiche produit publique (`/product/:id` et `/dashboard/product/:id`)** — Charge le produit par identifiant. Elle comporte retour au catalogue, galerie d'image principale et miniatures/images secondaires, bouton favori (actuellement seulement visuel), nom, prix unitaire, stock disponible, sélecteur de quantité, total calculé, ajout au panier et achat immédiat/checkout. La fin d'écran présente la description complète. Les cas « chargement » et « produit non trouvé » existent.

**Panier (`/cart`)** — Si vide, affiche une incitation à retourner au catalogue. Sinon, affiche une ligne par produit : visuel, nom, vendeur, suppression, boutons moins/plus, quantité, prix unitaire et sous-total. Un panneau de résumé calcule sous-total, livraison et total, propose de continuer les achats puis de passer au paiement. Les garanties de paiement/livraison sont présentes comme éléments de confiance.

**Paiement de commande (`/checkout` et `/dashboard/checkout`)** — Vérifie d'abord l'authentification, le panier et le statut éventuel de retour de paiement. L'écran normal affiche la commande (nom, quantité, montant), le total et l'action de paiement. Il gère explicitement les écrans : vérification en cours, panier vide, paiement échoué, et commande confirmée avec retour vers accueil ou marketplace. La logique actuelle initie le paiement via le domaine `vente` et vérifie la référence via `paiement` : la nouvelle interface doit conserver ce cycle et ne pas confirmer une vente seulement côté client.

### Authentification et entrée dans le produit

**Connexion (`/login`)** — Écran à fond dégradé avec logo, formulaire email/mot de passe, validation des champs, messages toast de succès ou d'erreur, lien vers l'inscription et redirection `/dashboard` après connexion. Le jeton est conservé pour les requêtes API suivantes.

**Inscription (`/register`)** — Parcours en deux étapes sur fond dégradé. Étape 1 : prénom, nom, e-mail, téléphone, date de naissance, adresse optionnelle, mot de passe, confirmation et acceptation obligatoire des conditions. Étape 2 : choix du rôle. La carte Commerçant explique la vente, les stocks, ventes et statistiques ; la carte Jeune entrepreneur explique opportunités, formations, financements et mentors. La création de compte n'intervient qu'après le choix de rôle, avec état de chargement et affichage d'erreur.

**Choix de profil (`/profile-selection`)** — Variante simplifiée de l'étape rôle : deux grandes cartes explicatives. Le choix commerçant mène à la sélection de boutique ; l'entrepreneur mène directement au dashboard. À conserver uniquement si ce choix doit être proposé après inscription ; sinon éviter de dupliquer ce parcours avec `/register`.

**Sélection de boutique (`/store-selection`)** — Écran centré destiné au commerçant multi-boutiques. Il affiche les boutiques sous forme de cartes (logo, nom, description, localisation, catégorie), une carte « créer une nouvelle boutique », puis un rappel de la gestion multi-boutiques. Cliquer une boutique la définit comme contexte actif, avant navigation vers le dashboard. C'est important : produits, commandes et statistiques doivent toujours être filtrés par cette boutique active.

### Dashboard commerçant : exploitation du commerce

**Tableau de bord (`/dashboard`)** — Le composant actif est actuellement le tableau de bord commerçant : cartes de statistiques, ventes récentes, missions/opportunités en cours et CTA pour développer l'activité. Un dashboard entrepreneur existe également (projets actifs, opportunités disponibles, connexions, financement obtenu, opportunités récentes, événements, actions rapides, conseil du jour, réalisations et aide). La refonte doit sélectionner réellement le bon tableau à partir du rôle.

**Mes boutiques (`/dashboard/stores`)** — Espace de gestion multi-boutiques. Il rappelle les limites du plan/abonnement, met en évidence la boutique active, liste les boutiques avec leur statut et leurs actions (sélectionner, modifier), fournit un bouton d'ajout et un état vide. Le nombre de boutiques doit être comparé aux droits de l'abonnement avant de permettre la création.

**Créer/modifier une boutique (`/dashboard/stores/add`, `/dashboard/stores/edit/:id`)** — Formulaire à une carte : chargement/suppression d'un logo (PNG/JPG jusqu'à 5 Mo, recommandation 200×200), nom obligatoire, description, catégorie obligatoire, localisation obligatoire et case « boutique active ». Après création ou modification, retour à la liste. Une aide rappelle que chaque boutique a ses produits, commandes et statistiques propres.

**Mes produits (`/dashboard/products`)** — Tableau/liste de catalogue avec bouton d'ajout, recherche et suppression confirmée. Les cartes KPI affichent total de produits, valeur de stock et nombre de produits en stock faible. Chaque ligne produit affiche image, nom, description, prix, stock, statut et actions : consulter, modifier, supprimer. Prévoir chargement, erreur de l'API et état vide avec CTA d'ajout.

**Créer/modifier un produit (`/dashboard/products/add`, `/dashboard/products/edit/:id`)** — Formulaire en deux zones : téléversement/prévisualisation/suppression de l'image (PNG/JPG jusqu'à 5 Mo) et informations. Champs : nom obligatoire, description, prix FCFA obligatoire, stock obligatoire, catégorie, statut. En édition, les données sont chargées avant affichage. Le formulaire revient à la liste après sauvegarde ou annulation.

**Détail produit de gestion (`/dashboard/products/:id`)** — Page de contrôle d'un produit : galerie navigable, édition, suppression avec confirmation, prix, niveau de stock avec alerte visuelle sous 10 unités, catégorie, description, note produit et KPI (valeur totale de stock, ventes). À la différence de la fiche publique, elle n'a pas de panier : elle sert à la gestion.

**Analyses commerçant (`/dashboard/analytics`)** — Vue de performance qui affiche revenus totaux, ventes totales, panier moyen et nombre de clients, suivis de graphiques « évolution des ventes », « ventes par catégorie » et « performance mensuelle ». Utiliser les ventes réelles de la boutique active ; certains chiffres actuels semblent être des valeurs de démonstration.

### Dashboard commerçant : opportunités, abonnement et finance

**Mes opportunités (`/dashboard/opportunities`)** — Page de pilotage des offres du commerçant. En tête : créer une opportunité. Quatre indicateurs : offres créées, candidatures reçues, candidats acceptés, total versé. La liste présente titre, rémunération/fréquence, nombre de candidatures, montants payés et actions voir/modifier/supprimer ; la suppression ouvre une confirmation. État vide avec CTA de création.

**Créer/modifier une opportunité (`/dashboard/opportunities/create`, `/dashboard/opportunities/edit/:id`)** — Formulaire organisé par blocs :

- Informations de base : titre, statut (ouverte, en cours, terminée, annulée), type (emploi, service, mission, formation, freelance, livraison, autre), localisation, résumé limité à 200 caractères, description complète.
- Rémunération et durée : montant FCFA, fréquence (fixe, horaire, journalière, mensuelle, projet), durée estimée et date limite future ; aperçu du montant formaté.
- Exigences : compétences, expérience et qualifications requises.

La page utilise le même écran pour création et édition, charge les données dans le second cas et revient sur la liste après sauvegarde.

**Détail opportunité de gestion (`/dashboard/opportunities/:id`)** — Permet au commerçant de gérer les candidatures. Affiche les détails de l'offre (type, montant, fréquence, durée, lieu, date limite, statut), les compteurs en attente/acceptés/refusés, puis une carte par candidat : identité, e-mail, téléphone, message de motivation, statut, total payé et historique de paiements. Le gestionnaire peut accepter/refuser et ouvrir un formulaire « ajouter un paiement » avec montant. Prévoir le cas sans candidature et le cas opportunité introuvable.

**Abonnements (`/dashboard/subscriptions`)** — Comparateur de plans Basique, Pro, Premium et Business, avec prix, avantages, limites (nombre de boutiques/produits), plan courant et action de souscription. Il inclut une FAQ sur le changement de plan, l'annulation et la sécurité de paiement. Le design doit distinguer clairement le plan actif, le plan conseillé et les limitations.

**Paiement d'abonnement (`/dashboard/subscriptions/checkout/:plan`)** — Vérifie que le plan demandé existe, montre son récapitulatif, puis laisse choisir Mobile Money (MTN/Moov/Wave), Orange Money ou carte bancaire. Les champs changent selon le mode choisi : téléphone pour mobile money, numéro/date/CVV pour carte. L'écran contient une promesse de chiffrement/sécurité et retourne une confirmation vers `/dashboard/subscriptions/success`.

**Confirmation d'abonnement (`/dashboard/subscriptions/success`)** — Confirmation visuelle du plan, récapitulatif de paiement et « prochaines étapes » : création de boutique, ajout de produits, utilisation du dashboard. Les CTA mènent au dashboard et aux boutiques.

**Portefeuille (`/dashboard/wallet`)** — Tableau financier avec trois soldes : revenus totaux, disponible et en attente ; bannière expliquant les retraits ; lien vers les moyens de retrait ; historique des transactions (libellé, date, commande, montant, statut). Un dialogue de retrait demande un montant, rappelle le solde disponible et oblige à choisir un moyen actif ; il redirige vers la configuration si aucun moyen n'est disponible. Il faut remplacer les valeurs/contextes de démonstration par un grand livre de transactions côté serveur.

**Moyens de retrait (`/dashboard/withdrawal-methods`)** — Liste des comptes de versement (Mobile Money, banque, autres) : logo, nom, description, numéro de compte/téléphone, titulaire, date de création, statut actif/inactif. Actions : activer/désactiver, modifier, supprimer avec second clic de confirmation. L'état vide comporte une explication et un CTA.

**Créer/modifier un moyen de retrait (`/dashboard/withdrawal-methods/add`, `/dashboard/withdrawal-methods/edit/:id`)** — Formulaire avec logo facultatif, nom du service, description, numéro de compte ou téléphone, nom du titulaire et état actif. Une aide conseille d'utiliser des informations exactes, car elles seront utilisées lors du versement.

### Dashboard entrepreneur et collaboration

**Opportunités côté entrepreneur (`/dashboard/opportunities`)** — Attention : le routeur actuel branche cette URL vers la page de gestion commerçant. Il existe aussi une page `opportunities.tsx`, pensée pour l'entrepreneur : héros « opportunités de croissance », compteurs (opportunités, partenaires, événements), recherche, cartes d'offres et CTA pour proposer une opportunité. Lors de la refonte, conserver une URL unique mais afficher la liste/candidature au rôle entrepreneur et la gestion/candidats au rôle commerçant.

**Liste publique d'opportunités (`/opportunities`)** — Version visiteur/entrepreneur de la découverte : héro, compteurs d'opportunités, entreprises actives et nouveautés, champ de recherche, cartes avec titre, descriptif, métadonnées et lien détail. Elle doit exploiter les données `mission` actives et afficher un état vide explicite.

**Détail opportunité public (`/opportunities/:id`)** — Fiche destinée à la candidature : titre, lieu, rémunération et fréquence, durée, date limite, description complète, encart entreprise, conseils de sécurité et zone « discussion avec l'entreprise ». La soumission d'une candidature affiche une confirmation et doit empêcher les doublons. Cette page devra demander la connexion avant l'envoi et relier la messagerie à une vraie discussion.

**Analyses entrepreneur (`/dashboard/analytics`)** — Alternative des analytics selon le rôle : candidatures totales, acceptations, connexions réseau, projets en cours, graphiques candidatures/acceptations et croissance du réseau, évaluation des compétences, activité récente, objectifs mensuels et export de portfolio. Les métriques 28/17/48/3 et les activités sont actuellement des exemples : connecter aux candidatures, contacts, projets et formations réels.

**Messagerie (`/dashboard/messages`)** — Interface à deux colonnes : recherche de conversations à gauche, discussion sélectionnée à droite. Une conversation affiche avatar, nom, dernier message et indicateur ; le fil montre les bulles de messages et leur chronologie. En bas, champ de saisie et bouton d'envoi ; en tête, statut « en ligne » et menu d'options. À conserver avec une vraie gestion de chargement, absence de conversation et envoi/lecture temps réel si le backend le permet.

**Profil (`/dashboard/profile`)** — Page de compte avec avatar modifiable, nom, rôle, localisation et mode édition/consultation. Le tronc commun contient nom complet, e-mail, téléphone, localisation. Pour un commerçant : encart abonnement courant, prochaine facturation, limites, lien vers les plans, informations de boutique, total des ventes et note moyenne. Pour un entrepreneur : progression (formations, missions, réputation, certifications). Les données de profil doivent être sauvegardées via `utilisateur` et les sous-sections filtrées par rôle.

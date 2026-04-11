export const products = [
  {
    id: "1",
    name: "Smartphone Samsung Galaxy A54",
    price: 185000,
    category: "Électronique",
    availability: "En stock",
    rating: 4.5,
    images: [
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
    ],
    description: "Smartphone dernière génération avec écran AMOLED 6.4\", caméra 50MP, batterie 5000mAh. Idéal pour les professionnels et entrepreneurs.",
    merchantId: "1",
    stock: 15,
  },
  {
    id: "2",
    name: "Sac de Riz Local Premium 50kg",
    price: 32000,
    category: "Alimentation",
    availability: "En stock",
    rating: 4.8,
    images: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500",
      "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=500",
    ],
    description: "Riz de qualité supérieure cultivé localement. Parfait pour les restaurants et commerces alimentaires. Livraison disponible.",
    merchantId: "2",
    stock: 50,
  },
  {
    id: "3",
    name: "Machine à Coudre Industrielle",
    price: 450000,
    category: "Équipement",
    availability: "En stock",
    rating: 4.6,
    images: [
      "https://images.unsplash.com/photo-1597199123394-f1a7f5e5e5e5?w=500",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500",
    ],
    description: "Machine à coudre professionnelle pour ateliers de couture. Robuste et fiable. Garantie 2 ans incluse.",
    merchantId: "1",
    stock: 5,
  },
  {
    id: "4",
    name: "Lot de Tissus Africains Wax",
    price: 25000,
    category: "Mode",
    availability: "En stock",
    rating: 4.9,
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500",
      "https://images.unsplash.com/photo-1558769132-cb1aea9c563d?w=500",
    ],
    description: "Collection de tissus wax authentiques, motifs variés. 6 mètres par pièce. Qualité premium pour créateurs et boutiques.",
    merchantId: "3",
    stock: 100,
  },
  {
    id: "5",
    name: "Générateur Électrique 5.5kVA",
    price: 280000,
    category: "Équipement",
    availability: "Stock limité",
    rating: 4.4,
    images: [
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=500",
      "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=500",
    ],
    description: "Générateur fiable et économique. Idéal pour commerces et ateliers. Consommation optimisée.",
    merchantId: "2",
    stock: 3,
  },
  {
    id: "6",
    name: "Lot de Produits Cosmétiques Naturels",
    price: 15000,
    category: "Beauté",
    availability: "En stock",
    rating: 4.7,
    images: [
      "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=500",
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500",
    ],
    description: "Gamme complète de cosmétiques naturels fabriqués localement. Beurre de karité, huiles essentielles, savons artisanaux.",
    merchantId: "3",
    stock: 40,
  },
];

export const merchants = [
  {
    id: "1",
    name: "Amadou Diallo",
    shopName: "Tech Store Dakar",
    rating: 4.5,
    totalSales: 156,
    location: "Dakar, Sénégal",
    specialties: ["Électronique", "Équipement"],
  },
  {
    id: "2",
    name: "Fatou Ndiaye",
    shopName: "Marché Bio Abidjan",
    rating: 4.8,
    totalSales: 342,
    location: "Abidjan, Côte d'Ivoire",
    specialties: ["Alimentation", "Agriculture"],
  },
  {
    id: "3",
    name: "Kofi Mensah",
    shopName: "Afrique Mode",
    rating: 4.9,
    totalSales: 278,
    location: "Accra, Ghana",
    specialties: ["Mode", "Beauté"],
  },
];

export const dashboardStats = {
  revenue: 2450000,
  sales: 87,
  stock: 245,
  pendingOrders: 12,
  revenueGrowth: 12.5,
  salesGrowth: 8.3,
  stockGrowth: -5.2,
  ordersGrowth: 15.7,
};

export const recentSales = [
  { id: "1", product: "Smartphone Samsung", amount: 185000, date: "2026-03-05", status: "Livré" },
  { id: "2", product: "Sac de Riz 50kg", amount: 32000, date: "2026-03-05", status: "En cours" },
  { id: "3", product: "Tissus Wax", amount: 25000, date: "2026-03-04", status: "Livré" },
  { id: "4", product: "Cosmétiques Naturels", amount: 15000, date: "2026-03-04", status: "En attente" },
  { id: "5", product: "Machine à Coudre", amount: 450000, date: "2026-03-03", status: "Livré" },
];

export const missions = [
  {
    id: "1",
    title: "Formation Marketing Digital",
    type: "Formation",
    progress: 65,
    deadline: "2026-03-15",
    reward: "Certificat + 50000 FCFA",
  },
  {
    id: "2",
    title: "Développer votre réseau commercial",
    type: "Challenge",
    progress: 40,
    deadline: "2026-03-20",
    reward: "Accès réseau premium",
  },
  {
    id: "3",
    title: "Optimiser votre inventaire",
    type: "Tutoriel",
    progress: 80,
    deadline: "2026-03-10",
    reward: "Outil de gestion gratuit",
  },
];

export const analyticsData = {
  salesByMonth: [
    { id: "m1", month: "Oct", ventes: 1200000, commandes: 45 },
    { id: "m2", month: "Nov", ventes: 1580000, commandes: 52 },
    { id: "m3", month: "Déc", ventes: 1950000, commandes: 68 },
    { id: "m4", month: "Jan", ventes: 2100000, commandes: 71 },
    { id: "m5", month: "Fév", ventes: 2280000, commandes: 79 },
    { id: "m6", month: "Mar", ventes: 2450000, commandes: 87 },
  ],
  salesByCategory: [
    { id: "c1", name: "Électronique", value: 850000, percentage: 35 },
    { id: "c2", name: "Mode", value: 610000, percentage: 25 },
    { id: "c3", name: "Alimentation", value: 490000, percentage: 20 },
    { id: "c4", name: "Équipement", value: 365000, percentage: 15 },
    { id: "c5", name: "Beauté", value: 135000, percentage: 5 },
  ],
  topProducts: [
    { id: "p1", name: "Smartphone Samsung", sales: 15, revenue: 2775000 },
    { id: "p2", name: "Machine à Coudre", sales: 8, revenue: 3600000 },
    { id: "p3", name: "Tissus Wax", sales: 42, revenue: 1050000 },
    { id: "p4", name: "Riz Local 50kg", sales: 35, revenue: 1120000 },
    { id: "p5", name: "Générateur 5.5kVA", sales: 6, revenue: 1680000 },
  ],
};

export const conversations = [
  {
    id: "1",
    userName: "Amadou Diallo",
    lastMessage: "Bonjour, le produit est-il toujours disponible ?",
    timestamp: "Il y a 5 min",
    unread: 2,
    avatar: "AD",
  },
  {
    id: "2",
    userName: "Fatou Ndiaye",
    lastMessage: "Merci pour la livraison rapide !",
    timestamp: "Il y a 1h",
    unread: 0,
    avatar: "FN",
  },
  {
    id: "3",
    userName: "Kofi Mensah",
    lastMessage: "Pouvez-vous me faire un prix de gros ?",
    timestamp: "Il y a 2h",
    unread: 1,
    avatar: "KM",
  },
];

export const messages = [
  {
    id: "1",
    conversationId: "1",
    sender: "Amadou Diallo",
    text: "Bonjour, le produit est-il toujours disponible ?",
    timestamp: "10:45",
    isOwn: false,
  },
  {
    id: "2",
    conversationId: "1",
    sender: "Vous",
    text: "Bonjour ! Oui, il est en stock. Combien souhaitez-vous commander ?",
    timestamp: "10:47",
    isOwn: true,
  },
  {
    id: "3",
    conversationId: "1",
    sender: "Amadou Diallo",
    text: "J'en voudrais 5 unités. Livraison possible à Dakar ?",
    timestamp: "10:50",
    isOwn: false,
  },
];

export const opportunities = [
  {
    id: "1",
    title: "Programme de Micro-crédit",
    type: "Financement",
    description: "Accédez à des prêts de 100 000 à 5 000 000 FCFA avec des taux préférentiels pour développer votre activité.",
    provider: "Banque Africaine de Développement",
    deadline: "2026-04-30",
    status: "Ouvert",
  },
  {
    id: "2",
    title: "Formation Gestion d'Entreprise",
    type: "Formation",
    description: "Formation gratuite de 3 mois en gestion, comptabilité et marketing pour jeunes entrepreneurs.",
    provider: "Centre Entrepreneurial d'Afrique",
    deadline: "2026-03-25",
    status: "Places limitées",
  },
  {
    id: "3",
    title: "Marketplace Régionale",
    type: "Réseau",
    description: "Rejoignez notre réseau de 500+ commerçants et accédez à de nouveaux marchés en Afrique de l'Ouest.",
    provider: "CEDEAO Commerce",
    deadline: "Permanent",
    status: "Ouvert",
  },
  {
    id: "4",
    title: "Subvention Innovation",
    type: "Financement",
    description: "Jusqu'à 2 000 000 FCFA de subvention pour projets innovants dans le commerce et l'agriculture.",
    provider: "Fonds d'Innovation Africain",
    deadline: "2026-05-15",
    status: "Ouvert",
  },
];

export const cartItems = [
  {
    id: "1",
    productId: "1",
    name: "Smartphone Samsung Galaxy A54",
    price: 185000,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200",
  },
  {
    id: "2",
    productId: "4",
    name: "Lot de Tissus Africains Wax",
    price: 25000,
    quantity: 2,
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=200",
  },
];
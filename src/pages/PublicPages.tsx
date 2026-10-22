import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, Navigate, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronLeft,
  CircleHelp,
  CreditCard,
  Filter,
  Globe2,
  Heart,
  LockKeyhole,
  MapPin,
  Menu,
  Minus,
  Package,
  Plus,
  Search,
  ShieldCheck,
  Truck,
  Headphones,
  UserRound,
  Send,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  Trash2,
  X,
} from "lucide-react";
import {
  formatCfa,
  getSellingPrice,
  useOrion,
  type OpportunityRecord,
  type Product,
  type UserRole,
} from "../OrionContext";
import { getProductById } from "../lib/catalog-service";
import { mapBackendProduct } from "../OrionContext";
import { getUploadUrl } from "../lib/api";
import { applyToMission, formatMissionRemuneration, getMissionById, getMissions, getMyMissionApplication, type MissionRecord } from "../lib/mission-service";
import { checkFedaPayPayment, createFedaPayPayment, recordLiveProductVisit } from "../lib/live-service";
import { getMyStores, type StoreRecord } from "../lib/store-service";
import { getCurrentUser, type AuthUser } from "../lib/auth-service";
import { getSiteSettings } from "../lib/admin-service";
import { getMyPurchases, type PurchaseRecord } from "../lib/order-service";
import { ThemeModeButton } from "../ThemeMode";
import { toast } from "../components/ui/sonner";

function OrionLogo({ light = false }: { light?: boolean }) {
  return <Link to="/" className={`orion-public-logo ${light ? "is-light" : ""}`} aria-label="Orion accueil"><img src="/orion.jpeg" alt="Logo Orion" /></Link>;
}

function ProductPrice({ product, className = "" }: { product: Product; className?: string }) {
  const sellingPrice = getSellingPrice(product);
  const isPromotional = sellingPrice < product.price;
  const discount = isPromotional && product.price > 0 ? Math.round((1 - sellingPrice / product.price) * 100) : 0;
  return <span className={`product-price-display ${className} ${isPromotional ? "has-promotion" : ""}`}>
    <strong>{formatCfa(sellingPrice)}</strong>
    {isPromotional ? <><del>{formatCfa(product.price)}</del><small>-{discount}%</small></> : null}
  </span>;
}

function ProductCard({ product, onAdd }: { product: Product; onAdd?: (product: Product) => void }) {
  const { addToCart } = useOrion();
  const handleAdd = (): void => {
    if (onAdd) onAdd(product);
    else { addToCart(product); toast.success(`${product.name} ajouté au panier.`); }
  };
  return <article className="public-product-card">
    <Link to={`/product/${product.id}`} className="public-product-image-link"><div className="public-product-image"><img src={product.image} alt={product.name} />{getSellingPrice(product) < product.price ? <span className="product-discount-badge">PROMO</span> : null}<span className="product-save"><Heart size={16} /></span>{product.featured ? <span className="product-featured">SÉLECTION</span> : null}</div></Link>
    <div className="public-product-info"><div><p className="public-product-category">{product.category}</p><Link to={`/product/${product.id}`}><h3>{product.name}</h3></Link><p className="public-product-store">{product.store}</p></div><ProductPrice product={product} className="public-product-price" /></div>
    <button type="button" className="product-add-button" onClick={handleAdd}><ShoppingCart size={15} /> Ajouter au panier</button>
  </article>;
}

function OpportunityCard({ opportunity }: { opportunity: OpportunityRecord }) {
  return <Link to={`/opportunities/${opportunity.id}`} className="public-opportunity-card">
    <div className="public-opportunity-placeholder"><BriefcaseBusiness size={42} strokeWidth={1.25} /><span className={`public-opportunity-tag tag-${opportunity.accent}`}>{opportunity.type}</span><span className="public-opportunity-arrow"><ArrowUpRight size={17} /></span></div>
    <div className="public-opportunity-body"><div className="opportunity-company"><span className="company-avatar">{opportunity.company.slice(0, 1)}</span><span>{opportunity.company}</span><BadgeCheck size={14} /></div><h3>{opportunity.title}</h3><div className="public-opportunity-meta"><span><MapPin size={14} /> {opportunity.location}</span><strong>{opportunity.amount}</strong></div></div>
  </Link>;
}

function mapMissionToOpportunity(mission: MissionRecord): OpportunityRecord {
  return {
    id: String(mission.id),
    title: mission.titre,
    company: "Boutique Orion",
    type: mission.type ?? "Mission rémunérée",
    location: mission.localisation ?? "Afrique",
    amount: formatMissionRemuneration(mission.montant, mission.frequencePaiement),
    duration: mission.dureeMission ? `${mission.dureeMission} mois` : "Flexible",
    description: mission.description ?? mission.descriptionCourte ?? "Mission disponible",
    requirements: mission.requis?.split(/\r?\n/).map((item) => item.trim().replace(/^[•·*-]\s*/, "")).filter(Boolean),
    accent: "gold",
  };
}

export function PublicLayout() {
  const { cartCount, session } = useOrion();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  return <div className="public-site-shell">
    <header className="public-header"><div className="public-header-inner"><OrionLogo /><nav className={`public-nav ${menuOpen ? "is-open" : ""}`}><Link to="/" onClick={() => setMenuOpen(false)}>Accueil</Link><Link to="/marketplace" onClick={() => setMenuOpen(false)}>Marketplace</Link><Link to="/opportunities" onClick={() => setMenuOpen(false)}>Opportunités</Link><Link to="/#about" onClick={() => setMenuOpen(false)}>A propos</Link></nav><form className="public-header-search" onSubmit={(event) => { event.preventDefault(); const query = searchQuery.trim(); navigate(query ? `/marketplace?search=${encodeURIComponent(query)}` : "/marketplace"); }}><Search size={19} /><input aria-label="Rechercher dans Orion" placeholder="Rechercher un produit, une marque, une catégorie..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} /></form><div className="public-header-actions"><ThemeModeButton className="theme-mode-button" /><Link to="/cart" className="public-cart-button" aria-label="Ouvrir le panier"><ShoppingCart size={19} /><span>Panier</span>{cartCount > 0 ? <b>{cartCount}</b> : null}</Link>{session ? <div className="public-account-menu"><button type="button" className="public-account-button" aria-expanded={accountMenuOpen} aria-haspopup="menu" onClick={() => setAccountMenuOpen((current) => !current)}><span className="public-account-avatar">{session.name.slice(0, 2).toUpperCase()}</span><span>{session.name}</span><ChevronDown size={14} /></button>{accountMenuOpen ? <div className="public-account-dropdown" role="menu"><span className="public-account-dropdown-name">Connecté en tant que<br /><strong>{session.name}</strong></span><Link to="/dashboard" role="menuitem" onClick={() => setAccountMenuOpen(false)}>Aller au dashboard <ArrowUpRight size={15} /></Link></div> : null}</div> : <Link to="/login" className="public-account-button"><UserRound size={22} /><span>Mon compte</span><ChevronDown size={14} /></Link>}<button type="button" className="public-menu-button" aria-label="Ouvrir le menu" onClick={() => setMenuOpen((current) => !current)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button></div></div></header>
    <Outlet />
  </div>;
}

function PublicFooter() {
  return <footer className="public-footer"><div className="public-footer-main"><div className="public-footer-brand"><OrionLogo light /><p>Une marketplace africaine pour découvrir, acheter et faire grandir les idées locales.</p><div className="public-socials"><a href="#instagram" aria-label="Instagram">ig</a><a href="#linkedin" aria-label="LinkedIn">in</a><a href="#x" aria-label="X">x</a></div></div><div className="public-footer-column"><p>EXPLORER</p><Link to="/marketplace">Marketplace</Link><Link to="/opportunities">Opportunités</Link><Link to="/register">Rejoindre Orion</Link></div><div className="public-footer-column"><p>ORION</p><Link to="/login">Connexion</Link><Link to="/profile-selection">Choisir son profil</Link><a href="#about">À propos</a></div><div className="public-footer-column"><p>SUPPORT</p><a href="mailto:bonjour@orion.africa">Nous contacter</a><a href="mailto:support@orion.africa">Centre d'aide</a><a href="#terms">Conditions</a></div></div><div className="public-footer-bottom"><span>© 2026 Orion Africa</span><span>Fait avec soin pour les personnes qui font avancer les choses.</span><span>Abidjan · Dakar · Nairobi</span></div></footer>;
}

export function HomePage() {
  const { products } = useOrion();
  const catalog = products;
  const slides = catalog.slice(0, 4);
  const [siteImages, setSiteImages] = useState<{ heroImages: string[]; carouselImages: string[] }>({ heroImages: [], carouselImages: [] });
  const [activeSlide, setActiveSlide] = useState(0);
  const [opportunities, setOpportunities] = useState<OpportunityRecord[]>([]);

  useEffect(() => {
    getMissions().then((response) => setOpportunities(response.map(mapMissionToOpportunity))).catch(() => setOpportunities([]));
  }, []);

  useEffect(() => { getSiteSettings().then(setSiteImages).catch(() => undefined); }, []);

  useEffect(() => {
    const count = siteImages.carouselImages.length || slides.length;
    if (count < 2) return;
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % count), 6000);
    return () => window.clearInterval(timer);
  }, [siteImages.carouselImages.length, slides.length]);

  const featured = slides[activeSlide];
  const moveSlide = (direction: number) => setActiveSlide((current) => (current + direction + slides.length) % slides.length);

  return <>
    <main className="public-home">
      <section className="public-home-hero">
        <div className="public-hero-copy">
          <span className="public-kicker">PRODUITS AFRICAINS. TALENTS LOCAUX. UN AVENIR MEILLEUR.</span>
          <h1>Tout ce qu’il vous faut,<br />au même endroit.</h1>
          <p>Mode, beauté, artisanat, high-tech et bien plus encore.<br className="desktop-break" /> Découvrez le meilleur de l’Afrique sur ORION.</p>
          <div className="public-hero-actions"><Link to="/marketplace" className="public-primary-button">Explorer le marketplace <ArrowRight size={19} /></Link><Link to="/opportunities" className="public-secondary-button">Voir les opportunités</Link></div>
          <div className="public-trust-line">
            <span><ShieldCheck size={25} /><span><strong>Paiement sécurisé</strong><small>Vos transactions sont protégées</small></span></span>
            <span><Truck size={27} /><span><strong>Livraison rapide</strong><small>Partout en Afrique</small></span></span>
            <span><Headphones size={25} /><span><strong>Service client</strong><small>À votre écoute 7j/7</small></span></span>
          </div>
        </div>
        <div className="public-hero-art" aria-label="Une sélection de produits africains">
          <div className="hero-collage-background" aria-hidden="true"><span className="hero-art-halo" /><span className="hero-art-plinth" /></div>
          {(siteImages.heroImages.length ? siteImages.heroImages.slice(0, 3).map((image) => getUploadUrl(image)) : slides.slice(0, 3).map((product) => product.image)).map((image, index) => <Link to="/marketplace" aria-label={`Découvrir le visuel ${index + 1}`} className={`hero-collage-item hero-collage-item-${index + 1} ${siteImages.heroImages.length ? "is-admin-image" : ""}`} key={`${image}-${index}`}><img src={image} alt={`Sélection Orion ${index + 1}`} /></Link>)}
        </div>
      </section>
      {siteImages.carouselImages.length ? <section className="home-featured-carousel home-admin-image-carousel" aria-label="Images à la une"><button type="button" className="home-carousel-arrow home-carousel-prev" aria-label="Image précédente" onClick={() => setActiveSlide((current) => (current - 1 + siteImages.carouselImages.length) % siteImages.carouselImages.length)}><ArrowLeft size={22} /></button><Link to="/marketplace" className="home-admin-carousel-image"><img src={getUploadUrl(siteImages.carouselImages[activeSlide % siteImages.carouselImages.length])} alt={`Image à la une ${activeSlide + 1}`} /></Link><div className="home-carousel-dots">{siteImages.carouselImages.map((image, index) => <button type="button" key={`${image}-${index}`} aria-label={`Afficher l’image ${index + 1}`} aria-current={index === activeSlide % siteImages.carouselImages.length} className={index === activeSlide % siteImages.carouselImages.length ? "is-active" : ""} onClick={() => setActiveSlide(index)} />)}</div><button type="button" className="home-carousel-arrow home-carousel-next" aria-label="Image suivante" onClick={() => setActiveSlide((current) => (current + 1) % siteImages.carouselImages.length)}><ArrowRight size={22} /></button></section> : featured ? <section className="home-featured-carousel" aria-label="Produits à la une">
        <button type="button" className="home-carousel-arrow home-carousel-prev" aria-label="Produit précédent" onClick={() => moveSlide(-1)}><ArrowLeft size={22} /></button>
        <div className="home-carousel-copy"><span className="home-carousel-badge">{getSellingPrice(featured) < featured.price ? "Promotion" : "Nouveau"}</span><span className="home-carousel-category">{featured.category}</span><h2>{featured.name}</h2><ProductPrice product={featured} className="home-carousel-price" /><Link to={`/product/${featured.id}`} className="home-carousel-cta">Voir le produit <ArrowRight size={18} /></Link></div>
        <Link to={`/product/${featured.id}`} className="home-carousel-product"><img src={featured.image} alt={featured.name} /></Link>
        <ul className="home-carousel-specs"><li><ShieldCheck size={20} /><span>Achat sécurisé<br />sur Orion</span></li><li><Package size={20} /><span>{featured.category || "Création locale"}<br />choisie pour vous</span></li><li><Truck size={21} /><span>Livraison rapide<br />partout en Afrique</span></li></ul>
        <div className="home-carousel-dots">{slides.map((product, index) => <button type="button" key={product.id} aria-label={`Afficher ${product.name}`} aria-current={index === activeSlide} className={index === activeSlide ? "is-active" : ""} onClick={() => setActiveSlide(index)} />)}</div>
        <button type="button" className="home-carousel-arrow home-carousel-next" aria-label="Produit suivant" onClick={() => moveSlide(1)}><ArrowRight size={22} /></button>
      </section> : null}
      <section className="public-section public-products-section"><div className="public-section-heading"><div><span className="public-kicker">CHOISIS POUR VOUS</span><h2>Ce qui mérite<br /><em>votre attention.</em></h2></div><Link to="/marketplace" className="public-text-link">Tout découvrir <ArrowUpRight size={16} /></Link></div><div className="public-products-grid">{catalog.filter((product) => product.featured).slice(0, 3).map((product) => <ProductCard product={product} key={product.id} />)}</div></section>
      <section className="public-section public-opportunities-section"><div className="public-section-heading"><div><span className="public-kicker">PLUS QU’UN ACHAT</span><h2>Les opportunités<br /><em>ouvrent des portes.</em></h2></div><Link to="/opportunities" className="public-text-link">Explorer les missions <ArrowUpRight size={16} /></Link></div><div className="public-opportunities-grid">{opportunities.slice(0, 3).map((opportunity) => <OpportunityCard opportunity={opportunity} key={opportunity.id} />)}</div></section>
      <section className="public-join-banner" id="about"><div><span className="public-kicker">VOUS AVEZ QUELQUE CHOSE À PARTAGER ?</span><h2>Votre boutique a<br /><em>sa place ici.</em></h2><p>Rejoignez une communauté de commerçants et d’entrepreneurs qui construisent l’économie de demain.</p><Link to="/register" className="public-primary-button">Créer mon espace <ArrowRight size={17} /></Link></div><div className="join-banner-shape"><Store size={50} strokeWidth={1} /><span>ORION<br /><i>COMMERCE</i></span></div></section>
    </main><PublicFooter />
  </>;
}
export function MarketplacePage() {
  const { products } = useOrion();
  const location = useLocation();
  const [query, setQuery] = useState<string>(() => new URLSearchParams(location.search).get("search") ?? "");
  const [category, setCategory] = useState<string>("Tout");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [sort, setSort] = useState<string>("Recommandés");
  const categories: string[] = ["Tout", ...Array.from(new Set(products.map((product) => product.category).filter(Boolean)))];
  const filteredProducts: Product[] = useMemo(() => {
    const normalized: string = query.toLowerCase().trim();
    const result: Product[] = products.filter((product) => (category === "Tout" || product.category === category) && (!normalized || `${product.name} ${product.store} ${product.category}`.toLowerCase().includes(normalized)));
    if (sort === "Prix croissant") return [...result].sort((a, b) => getSellingPrice(a) - getSellingPrice(b));
    if (sort === "Prix décroissant") return [...result].sort((a, b) => getSellingPrice(b) - getSellingPrice(a));
    return result;
  }, [category, products, query, sort]);
  return <><main className="public-page"><div className="public-page-heading"><div><span className="public-kicker">ORION MARKETPLACE</span><h1>Des objets qui<br /><em>portent une histoire.</em></h1><p>Découvrez des produits pensés, fabriqués et vendus par des talents du continent.</p></div><div className="public-page-heading-aside"><span>342 produits</span><span>18 pays</span><span>Vendeurs vérifiés</span></div></div><div className="marketplace-discovery-bar"><div className="public-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un produit, une boutique..." aria-label="Rechercher un produit" /></div><button type="button" className={`public-filter-button ${showFilters ? "is-active" : ""}`} onClick={() => setShowFilters((current) => !current)}><Filter size={16} /> Filtres</button><label className="public-sort-select"><span>Trier par</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option>Recommandés</option><option>Prix croissant</option><option>Prix décroissant</option></select><ChevronDown size={14} /></label></div>{showFilters ? <div className="marketplace-filter-panel"><span>Catégorie</span>{categories.map((item) => <button type="button" key={item} className={category === item ? "is-active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div> : null}<div className="public-category-pills">{categories.map((item) => <button type="button" className={category === item ? "is-active" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="marketplace-result-heading"><span>{filteredProducts.length} résultats</span><span>Chaque achat soutient un commerce local <Heart size={14} /></span></div><div className="public-products-grid public-marketplace-grid">{filteredProducts.map((product) => <ProductCard product={product} key={product.id} />)}</div>{filteredProducts.length === 0 ? <EmptyState title="Aucun produit trouvé" copy="Essayez un autre mot-clé ou une autre catégorie." action="Réinitialiser" onAction={() => { setQuery(""); setCategory("Tout"); }} /> : null}</main><PublicFooter /></>;
}

export function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, products, setLiveAttribution } = useOrion();
  const [product, setProduct] = useState<Product | null>(() => products.find((item) => item.id === id) ?? null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  useEffect(() => {
    if (!id) return;
    getProductById(Number(id))
      .then((record) => setProduct(mapBackendProduct(record)))
      .catch(() => setProduct(products.find((item) => item.id === id) ?? null));
  }, [id, products]);
  useEffect(() => { setSelectedImage(product?.image ?? null); }, [product?.id, product?.image]);
  useEffect(() => {
    const rawLiveSessionId = new URLSearchParams(location.search).get("liveSession");
    if (!rawLiveSessionId) return;
    const liveSessionId = Number(rawLiveSessionId);
    const productId = Number(id);
    if (!Number.isSafeInteger(liveSessionId) || liveSessionId <= 0 || !Number.isSafeInteger(productId) || productId <= 0) {
      setLiveAttribution(null);
      return;
    }

    let isMounted = true;
    recordLiveProductVisit(liveSessionId, productId)
      .then(() => { if (isMounted) setLiveAttribution(liveSessionId); })
      .catch((error: unknown) => {
        console.error("Live product visit tracking failed.", error);
        if (isMounted) setLiveAttribution(null);
      });
    return () => { isMounted = false; };
  }, [id, location.search, setLiveAttribution]);
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState<boolean>(false);
  if (!product) return <main className="public-page"><EmptyState title="Produit introuvable" copy="Ce produit n'est pas disponible actuellement." action="Retour à la marketplace" onAction={() => navigate("/marketplace")} /></main>;
  const productImages = Array.from(new Set([product.image, ...(product.secondaryImages ?? [])].filter(Boolean)));
  const addProduct = (): void => { addToCart(product, quantity); setAdded(true); toast.success(`${quantity} × ${product.name} ajouté${quantity > 1 ? 's' : ''} au panier.`); };
  return <><main className="public-page product-detail-page"><button type="button" className="back-link" onClick={() => navigate(-1)}><ChevronLeft size={16} /> Retour à la marketplace</button><div className="product-detail-grid"><div className="product-detail-gallery"><div className="product-detail-main-image"><img src={selectedImage || product.image} alt={product.name} /><span className="product-gallery-label">{product.category}</span></div><div className="product-detail-thumb-row">{productImages.map((image, index) => <button type="button" key={`${image}-${index}`} className={`product-thumb ${(selectedImage || product.image) === image ? "is-active" : ""}`} onClick={() => setSelectedImage(image)} aria-label={`Afficher l’image ${index + 1} de ${product.name}`}><img src={image} alt="" /></button>)}</div></div><div className="product-detail-copy"><div className="product-detail-brand"><span className="company-avatar">{product.store.slice(0, 1)}</span><span>{product.store}</span><BadgeCheck size={15} /></div><span className="public-kicker">{product.category.toUpperCase()}</span><h1>{product.name}</h1><div className="product-rating"><span>★★★★★</span><strong>4,9</strong><a href="#reviews">24 avis</a></div><p className="product-detail-description">{product.description}</p><ProductPrice product={product} className="product-detail-price" /><div className="product-stock"><span className="stock-dot" /> En stock · expédié sous 48h</div><div className="product-purchase-row"><div className="quantity-control"><button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} aria-label="Diminuer la quantité"><Minus size={15} /></button><span>{quantity}</span><button type="button" onClick={() => setQuantity((current) => Math.min(product.stock, current + 1))} aria-label="Augmenter la quantité"><Plus size={15} /></button></div><button type="button" className="public-primary-button product-buy-button" onClick={addProduct}><ShoppingCart size={17} /> {added ? "Ajouté au panier" : "Ajouter au panier"}</button></div><div className="product-reassurance"><div><Package size={18} /><span>Livraison<br /><b>Partout en Afrique</b></span></div><div><LockKeyhole size={18} /><span>Paiement<br /><b>100% sécurisé</b></span></div><div><CircleHelp size={18} /><span>Besoin d'aide ?<br /><b>Écrivez-nous</b></span></div></div></div></div><section className="product-detail-bottom"><span className="public-kicker">L'HISTOIRE DERRIÈRE L'OBJET</span><h2>Un objet fait pour<br /><em>vivre avec vous.</em></h2><p>Chez Orion, nous croyons que les meilleurs objets ne sont pas seulement beaux. Ils racontent un lieu, un geste, une personne — et trouvent une nouvelle histoire entre vos mains.</p></section></main><PublicFooter /></>;
}

export function OpportunitiesPage() {
  const [query, setQuery] = useState<string>("");
  const [type, setType] = useState<string>("Toutes");
  const [opportunities, setOpportunities] = useState<OpportunityRecord[]>([]);
  const types: string[] = ["Toutes", "Collaboration", "Mission rémunérée", "Service", "Projet court"];

  useEffect(() => {
    let isMounted = true;

    getMissions()
      .then((response) => {
        if (!isMounted || response.length === 0) return;

        setOpportunities(response.map(mapMissionToOpportunity));
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered: OpportunityRecord[] = opportunities.filter((item) => {
    const matchesType: boolean = type === "Toutes" || item.type === type;
    const matchesQuery: boolean = !query || `${item.title} ${item.company} ${item.location}`.toLowerCase().includes(query.toLowerCase());
    return matchesType && matchesQuery;
  });

  return <><main className="public-page opportunities-page"><div className="public-page-heading opportunities-heading"><div><span className="public-kicker">ORION OPEN CALL</span><h1>Les idées ont besoin<br /><em>des bonnes personnes.</em></h1><p>Des missions, des collaborations et des occasions de faire un pas de plus.</p></div><div className="opportunities-heading-art"><BriefcaseBusiness size={46} strokeWidth={1} /><span>Votre prochain<br /><i>projet commence ici.</i></span></div></div><div className="opportunities-tools"><div className="public-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une mission..." aria-label="Rechercher une opportunité" /></div><div className="opportunity-type-pills">{types.map((item) => <button type="button" key={item} className={type === item ? "is-active" : ""} onClick={() => setType(item)}>{item}</button>)}</div></div><div className="opportunities-count"><span>{filtered.length} opportunités ouvertes</span><span>Mis à jour aujourd'hui</span></div>{filtered.length > 0 ? <div className="public-opportunities-grid public-opportunities-result-grid">{filtered.map((item) => <OpportunityCard opportunity={item} key={item.id} />)}</div> : <EmptyState title="Aucune opportunité trouvée" copy={opportunities.length ? "Essayez un autre mot-clé ou un autre type de mission." : "Aucune mission n'est publiée pour le moment."} action="Réinitialiser les filtres" onAction={() => { setQuery(""); setType("Toutes"); }} />}</main><PublicFooter /></>;
}

export function OpportunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useOrion();
  const [opportunities, setOpportunities] = useState<OpportunityRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>("");
  const [applied, setApplied] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [applicationError, setApplicationError] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    const missionId = Number(id);
    setOpportunities([]);
    setLoadError("");
    setIsLoading(true);

    if (!Number.isInteger(missionId) || missionId <= 0) {
      setLoadError("L’identifiant de cette opportunité est invalide.");
      setIsLoading(false);
      return () => { isMounted = false; };
    }

    getMissionById(missionId)
      .then((mission) => { if (isMounted) setOpportunities([mapMissionToOpportunity(mission)]); })
      .catch((error: unknown) => { if (isMounted) setLoadError(error instanceof Error ? error.message : "Cette opportunité est introuvable."); })
      .finally(() => { if (isMounted) setIsLoading(false); });

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    setApplied(false);
    if (!session?.token || !id || session.role !== "UTILISATEUR") return () => { isMounted = false; };
    getMyMissionApplication(Number(id), session.token)
      .then((application) => { if (isMounted) setApplied(Boolean(application)); })
      .catch(() => undefined);
    return () => { isMounted = false; };
  }, [id, session?.token, session?.role]);

  const opportunity: OpportunityRecord | undefined = opportunities.find((item) => item.id === id);
  if (isLoading) return <><main className="public-page opportunity-detail-page"><p className="opportunity-loading-state">Chargement de l’opportunité…</p></main><PublicFooter /></>;
  if (!opportunity) return <><main className="public-page opportunity-detail-page"><EmptyState title="Opportunité introuvable" copy={loadError || "Cette mission n’existe pas ou n’est plus disponible."} action="Retour aux opportunités" onAction={() => navigate("/opportunities")} icon={<BriefcaseBusiness size={30} />} /></main><PublicFooter /></>;
  const handleApply = async (): Promise<void> => {
    if (!session) {
      navigate("/login", { state: { from: `/opportunities/${opportunity.id}` } });
      return;
    }

    setIsApplying(true);
    setApplicationError("");

    try {
      await applyToMission(Number(id ?? opportunity.id), "Candidature envoyée depuis Orion.", session.token);
      setApplied(true);
      toast.success("Votre candidature a bien été envoyée.");
    } catch (error) {
      setApplicationError(error instanceof Error ? error.message : "Impossible d’envoyer votre candidature.");
    } finally {
      setIsApplying(false);
    }
  };
  return <><main className="public-page opportunity-detail-page"><button type="button" className="back-link" onClick={() => navigate(-1)}><ChevronLeft size={16} /> Retour aux opportunités</button><div className="opportunity-detail-hero">
    <div className="opportunity-detail-placeholder">
     <BriefcaseBusiness size={46} strokeWidth={1.25} /><span className={`public-opportunity-tag tag-${opportunity.accent}`}>{opportunity.type}</span></div><div className="opportunity-detail-main"><div className="opportunity-company large"><span className="company-avatar">{opportunity.company.slice(0, 1)}</span><span>{opportunity.company}</span><BadgeCheck size={15} /></div><h1>{opportunity.title}</h1><div className="opportunity-detail-facts"><span><MapPin size={16} /> {opportunity.location}</span><span><Banknote size={16} /> {opportunity.amount}</span><span><Package size={16} /> {opportunity.duration}</span></div><p>{opportunity.description}</p><div className="opportunity-detail-actions"><button type="button" className="public-primary-button" onClick={handleApply} disabled={isApplying || applied}>{applied ? <><Check size={17} /> Candidature envoyée</> : isApplying ? "Envoi..." : <>Candidater à cette opportunité <ArrowRight size={17} /></>}</button><button type="button" className="public-secondary-button" onClick={() => session ? navigate("/dashboard/messages") : navigate("/login", { state: { from: `/opportunities/${opportunity.id}` } })}><Send size={16} /> Poser une question</button></div>{applicationError ? <p className="auth-error">{applicationError}</p> : null}</div></div><div className="opportunity-detail-columns"><article><span className="public-kicker">À PROPOS DE LA MISSION</span><h2>Ce que vous allez<br /><em>construire ensemble.</em></h2><p>{opportunity.description}</p>{opportunity.requirements?.length ? <><span className="public-kicker">PRÉREQUIS</span><ul className="detail-check-list">{opportunity.requirements.map((requirement) => <li key={requirement}><Check size={15} /> {requirement}</li>)}</ul></> : null}</article><aside className="opportunity-side-card"><span className="public-kicker">À RETENIR</span><div><strong>{opportunity.amount}</strong><span>Rémunération</span></div><div><strong>{opportunity.duration}</strong><span>Durée estimée</span></div><div><strong>Vérifiée</strong><span>Entreprise validée</span></div></aside></div></main><PublicFooter /></>;
}

export function CartPage() {
  const navigate = useNavigate();
  const { cart, cartCount, cartTotal, updateCartQuantity, removeFromCart } = useOrion();
  return <><main className="public-page cart-page"><div className="public-page-heading compact"><div><span className="public-kicker">VOTRE SÉLECTION</span><h1>Votre panier<span className="cart-count-title"> · {cartCount}</span></h1><p>Les objets que vous avez choisi de faire entrer dans votre histoire.</p></div></div>{cart.length === 0 ? <EmptyState title="Votre panier est encore vide" copy="Explorez la marketplace pour trouver les objets et produits qui vous ressemblent." action="Découvrir la marketplace" onAction={() => navigate("/marketplace")} icon={<ShoppingBag size={30} />} /> : <div className="cart-layout"><div className="cart-lines">{cart.map((line) => <div className="cart-line" key={line.product.id}><img src={line.product.image} alt="" /><div className="cart-line-copy"><span>{line.product.store}</span><h3>{line.product.name}</h3><p><ProductPrice product={line.product} /></p></div><div className="quantity-control"><button type="button" onClick={() => updateCartQuantity(line.product.id, line.quantity - 1)} aria-label="Diminuer"><Minus size={14} /></button><span>{line.quantity}</span><button type="button" onClick={() => updateCartQuantity(line.product.id, line.quantity + 1)} aria-label="Augmenter"><Plus size={14} /></button></div><strong>{formatCfa(getSellingPrice(line.product) * line.quantity)}</strong><button type="button" className="remove-line" onClick={() => removeFromCart(line.product.id)} aria-label={`Supprimer ${line.product.name}`}><Trash2 size={16} /></button></div>)}</div><aside className="cart-summary"><span className="public-kicker">RÉCAPITULATIF</span><div className="cart-summary-row"><span>Sous-total</span><strong>{formatCfa(cartTotal)}</strong></div><div className="cart-summary-row"><span>Livraison</span><span>Calculée au paiement</span></div><div className="cart-summary-total"><span>Total estimé</span><strong>{formatCfa(cartTotal)}</strong></div><button type="button" className="public-primary-button checkout-button" onClick={() => navigate("/checkout")}>Passer au paiement <ArrowRight size={17} /></button><p className="secure-note"><LockKeyhole size={14} /> Paiement sécurisé par Orion</p></aside></div>}</main><PublicFooter /></>;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, cart, cartTotal, clearCart, liveAttribution, setLiveAttribution, logout } = useOrion();
  const [customer, setCustomer] = useState<AuthUser | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string>("");

  useEffect(() => {
    const callbackReference = new URLSearchParams(location.search).get("fedapay_reference");
    if (!session?.token) {
      setProfileLoading(false);
      if (!callbackReference) navigate("/login", { replace: true, state: { from: "/checkout" } });
      return;
    }
    let isMounted = true;
    getCurrentUser(session.token)
      .then((profile) => { if (isMounted) setCustomer(profile); })
      .catch((error) => {
        if (!isMounted) return;
        const message = error instanceof Error ? error.message : "Impossible de charger ton profil.";
        if (/token invalide|token.*expir|jwt expired/i.test(message)) {
          logout();
          navigate("/login", { replace: true, state: { from: "/checkout" } });
          return;
        }
        setCheckoutError(message);
      })
      .finally(() => { if (isMounted) setProfileLoading(false); });
    return () => { isMounted = false; };
  }, [session?.token, location.search, navigate]);

  useEffect(() => {
    const reference = new URLSearchParams(location.search).get("fedapay_reference");
    if (!reference) return;
    const returnToMobile = () => {
      if (new URLSearchParams(location.search).get("orion_mobile") === "1") {
        const missionPayment = new URLSearchParams(location.search).get('purpose') === 'mission';
        window.location.assign(`orionmobile://checkout?fedapay_reference=${encodeURIComponent(reference)}${missionPayment ? '&purpose=mission' : ''}`);
        return true;
      }
      return false;
    };
    let isMounted = true;
    let attempts = 0;
    let timeout: number | undefined;
    const check = async () => {
      try {
        const transaction = await checkFedaPayPayment(reference);
        if (!isMounted) return;
        if (transaction.purpose === 'MISSION_PUBLICATION') {
          if (transaction.status === 'SUCCESS' && transaction.mission?.publicationPayee) {
            if (new URLSearchParams(location.search).get('orion_mobile') === '1') {
              window.location.assign(`orionmobile://checkout?fedapay_reference=${encodeURIComponent(reference)}&purpose=mission`);
              return;
            }
            navigate('/dashboard/opportunities', { replace: true });
            return;
          }
          if (transaction.status === 'FAILED' || transaction.status === 'REFUNDED') {
            if (new URLSearchParams(location.search).get('orion_mobile') === '1') {
              window.location.assign(`orionmobile://checkout?fedapay_reference=${encodeURIComponent(reference)}&purpose=mission`);
              return;
            }
            navigate('/dashboard/opportunities', { replace: true });
            return;
          }
        }
        if (transaction.status === "SUCCESS" || transaction.vente?.statut === "payee") {
          if (returnToMobile()) return;
          clearCart();
          setLiveAttribution(null);
          navigate("/purchases", { replace: true });
          return;
        }
        if (transaction.status === "FAILED" || transaction.status === "REFUNDED" || transaction.vente?.statut === "echouee" || transaction.vente?.statut === "remboursee") {
          setCheckoutError("Le paiement n’a pas été confirmé. Tu peux réessayer depuis ton panier.");
          if (returnToMobile()) return;
          navigate("/checkout", { replace: true });
          return;
        }
      } catch (error) {
        console.error("FedaPay payment status check failed.", error);
      }
      attempts += 1;
      if (attempts < 12) timeout = window.setTimeout(() => { void check(); }, 2500);
      else {
        setCheckoutError("Le paiement est encore en attente de confirmation FedaPay. Réactualise cette page dans quelques instants.");
        if (returnToMobile()) return;
        navigate("/checkout", { replace: true });
      }
    };
    void check();
    return () => {
      isMounted = false;
      if (timeout !== undefined) window.clearTimeout(timeout);
    };
  }, [location.search, clearCart, navigate, setLiveAttribution]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (cart.length === 0) {
      setCheckoutError("Ton panier est vide.");
      return;
    }
    if (!session?.token || !customer) {
      setCheckoutError("Connecte-toi et complète ton profil avant de payer.");
      return;
    }
    setIsSubmitting(true);
    setCheckoutError("");

    try {
      const payment = await createFedaPayPayment({
        produitIds: cart.map((line) => Number(line.product.id)),
        quantites: cart.map((line) => line.quantity),
        platform: "web",
        ...(liveAttribution ? { liveSessionId: liveAttribution } : {}),
      }, session.token);
      window.location.assign(payment.payment_url);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible d’initialiser le paiement FedaPay.";
      if (/token invalide|token.*expir|jwt expired/i.test(message)) {
        logout();
        navigate("/login", { replace: true, state: { from: "/checkout" } });
      } else {
        setCheckoutError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return <><main className="public-page checkout-page"><button type="button" className="back-link" onClick={() => navigate("/cart")}><ChevronLeft size={16} /> Retour au panier</button><div className="checkout-heading"><div><span className="public-kicker">PAIEMENT SÉCURISÉ PAR FEDAPAY</span><h1>Finaliser votre<br /><em>commande.</em></h1></div><div className="checkout-stepper"><span className="is-done">1 Panier</span><i /><span className="is-active">2 Paiement</span><i /><span>3 Confirmation</span></div></div><div className="checkout-layout"><form className="checkout-form" onSubmit={handleSubmit}><section className="checkout-section"><div className="checkout-section-title"><span>01</span><div><h2>Compte et livraison</h2><p>Ces informations viennent de ton profil Orion.</p></div></div>{profileLoading ? <p role="status">Chargement de ton profil…</p> : customer ? <div className="form-grid"><label>Prénom<input readOnly value={customer.prenom ?? ""} /></label><label>Nom<input readOnly value={customer.nom ?? ""} /></label><label className="form-full">E-mail<input readOnly value={customer.email} /></label><label className="form-full">Téléphone<input readOnly value={customer.contact ?? "Non renseigné"} /></label><label className="form-full">Adresse de livraison<input readOnly value={customer.adresse ?? ""} /></label></div> : <p className="auth-error">{checkoutError || "Connecte-toi pour utiliser les informations de ton compte."}</p>}</section><section className="checkout-section"><div className="checkout-section-title"><span>02</span><div><h2>Paiement</h2><p>Tu seras redirigé vers la page sécurisée FedaPay pour valider la transaction.</p></div></div><div className="secure-note"><LockKeyhole size={14} /> Orion ne collecte aucune donnée bancaire.</div></section>{checkoutError && customer ? <p className="auth-error" role="alert">{checkoutError}</p> : null}<button type="submit" disabled={isSubmitting || profileLoading || !customer || cart.length === 0} className="public-primary-button checkout-submit">{isSubmitting ? "Redirection vers FedaPay…" : <>Payer {formatCfa(cartTotal)} <LockKeyhole size={16} /></>}</button></form><aside className="checkout-order-summary"><span className="public-kicker">VOTRE COMMANDE</span>{cart.length === 0 ? <p className="empty-checkout">Votre panier est vide. <Link to="/marketplace">Retourner à la marketplace.</Link></p> : cart.map((line) => <div className="checkout-order-line" key={line.product.id}><img src={line.product.image} alt="" /><div><strong>{line.product.name}</strong><span>{line.quantity} × {formatCfa(getSellingPrice(line.product))}</span></div></div>)}<div className="checkout-summary-total"><span>Total</span><strong>{formatCfa(cartTotal)}</strong></div><div className="secure-note"><LockKeyhole size={14} /> Paiement sécurisé par FedaPay</div></aside></div></main><PublicFooter /></>;
}

export function PurchasesPage() {
  const navigate = useNavigate();
  const { session } = useOrion();
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.token) {
      navigate("/login", { replace: true, state: { from: "/purchases" } });
      setLoading(false);
      return;
    }
    let isMounted = true;
    getMyPurchases(session.token)
      .then((records) => { if (isMounted) setPurchases(records); })
      .catch((loadError) => { if (isMounted) setError(loadError instanceof Error ? loadError.message : "Impossible de charger tes achats."); })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [session?.token, navigate]);

  return <><main className="public-page"><div className="public-page-heading compact"><div><span className="public-kicker">TON ESPACE CLIENT</span><h1>Mes achats</h1><p>Retrouve ici les commandes associées à ton compte Orion.</p></div></div>{loading ? <p role="status">Chargement de tes achats…</p> : error ? <p className="auth-error" role="alert">{error}</p> : purchases.length === 0 ? <EmptyState title="Aucun achat pour le moment" copy="Tes commandes payées apparaîtront ici." action="Découvrir la marketplace" onAction={() => navigate("/marketplace")} icon={<ShoppingBag size={30} />} /> : <div className="purchase-list">{purchases.map((purchase) => <article className="purchase-card" key={purchase.id}><div><span className="public-kicker">{purchase.reference || `COMMANDE #${purchase.id}`}</span><h2>{purchase.produits?.map((product) => product.nom).join(", ") || "Commande Orion"}</h2><p>{new Date(purchase.date_achat).toLocaleDateString("fr-FR")}</p></div><div><strong>{formatCfa(purchase.prix_total)}</strong><span className="purchase-status">{purchase.statut}</span></div></article>)}</div>}</main><PublicFooter /></>;
}

export function AuthPage({ register = false }: { register?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register: registerUser } = useOrion();
  const authState = location.state as { from?: string; role?: UserRole } | null;
  const [role, setRole] = useState<UserRole>(authState?.role ?? "UTILISATEUR");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const destination: string = authState?.from ?? "/dashboard";
  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!email || password.length < 4) {
      setError("Renseignez un email et un mot de passe de 4 caractères minimum.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      if (register) {
        await registerUser({
          email,
          password,
          role,
          nom: email.split("@")[0] ?? "Membre",
          prenom: "Orion",
          date_naissance: "2000-01-01",
          adresse: "Abidjan",
          contact: "",
          specialite: role === "COMMERCANT" ? "Commerce" : "Entrepreneuriat",
          localisation: "Abidjan",
        });
      } else {
        await login(email, password, role);
      }

      navigate(role === "COMMERCANT" ? "/store-selection" : destination);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Impossible de poursuivre la demande.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return <main className="auth-shell"><div className="auth-visual"><OrionLogo light /><span className="auth-visual-kicker">ORION AFRICA</span><h1>Construire<br /><em>ensemble.</em></h1><p>Une marketplace pour les produits qui comptent et les opportunités qui ouvrent des portes.</p><div className="auth-visual-orbit"><Globe2 size={34} strokeWidth={1} /><span>18 pays · une même énergie</span></div></div><div className="auth-form-side"><Link to="/" className="auth-close"><X size={19} /></Link><div className="auth-form-wrap"><span className="public-kicker">{register ? "BIENVENUE DANS LE RÉSEAU" : "BON RETOUR"}</span><h1>{register ? "Créer votre espace." : "Ravi de vous revoir."}</h1><p>{register ? "Choisissez le profil qui correspond le mieux à votre projet." : "Connectez-vous pour retrouver vos boutiques, vos messages et vos opportunités."}</p><form onSubmit={submit}><label>Email professionnel<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vous@exemple.com" /></label><label>Mot de passe<input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" /></label>{register ? <div className="auth-role-picker"><span>Je suis...</span><div><button type="button" className={role === "COMMERCANT" ? "is-active" : ""} onClick={() => setRole("COMMERCANT")}><Store size={17} /><strong>Commerçant</strong><small>Je vends et je développe mon commerce</small></button><button type="button" className={role === "UTILISATEUR" ? "is-active" : ""} onClick={() => setRole("UTILISATEUR")}><BriefcaseBusiness size={17} /><strong>Jeune entrepreneur</strong><small>Je cherche des missions et des connexions</small></button></div></div> : <button type="button" className="auth-forgot">Mot de passe oublié ?</button>}{error ? <p className="auth-error">{error}</p> : null}<button type="submit" className="public-primary-button auth-submit" disabled={isSubmitting}>{isSubmitting ? "Chargement..." : register ? "Créer mon espace" : "Se connecter"} <ArrowRight size={17} /></button></form><div className="auth-switch">{register ? <>Vous avez déjà un compte ? <Link to="/login">Se connecter</Link></> : <>Pas encore de compte ? <Link to="/register">Rejoindre Orion</Link></>}</div><div className="auth-legal">En continuant, vous acceptez les <a href="#terms">conditions d'utilisation</a> et la <a href="#privacy">politique de confidentialité</a>.</div></div></div></main>;
}

export function ProfileSelectionPage() {
  const navigate = useNavigate();
  const { session } = useOrion();
  if (session) return <Navigate to="/dashboard" replace />;
  const choose = (role: UserRole): void => navigate("/register", { state: { role } });
  return <main className="onboarding-shell"><OrionLogo /><div className="onboarding-center"><span className="public-kicker">AVANT DE CRÉER VOTRE COMPTE</span><h1>Quel est votre<br /><em>prochain chapitre ?</em></h1><p>Choisissez votre profil. Ce rôle sera associé à votre compte dès sa création et ne pourra plus être modifié.</p><div className="profile-choice-grid"><button type="button" onClick={() => choose("COMMERCANT")}><span className="profile-choice-icon icon-store"><Store size={28} /></span><span><strong>Je développe mon commerce</strong><small>Je vends des produits, je gère une boutique et je crée des opportunités.</small></span><ArrowUpRight size={18} /></button><button type="button" onClick={() => choose("UTILISATEUR")}><span className="profile-choice-icon icon-entrepreneur"><BriefcaseBusiness size={28} /></span><span><strong>Je fais grandir mon activité</strong><small>Je trouve des missions, je rencontre des entreprises et je construis mon réseau.</small></span><ArrowUpRight size={18} /></button></div></div><p className="onboarding-footnote">Vous êtes un administrateur ? <a href="mailto:admin@orion.africa">Contactez notre équipe</a></p></main>;
}

export function StoreSelectionPage() {
  const navigate = useNavigate();
  const { activeStoreId, setActiveStoreId, session } = useOrion();
  const [stores, setStores] = useState<Array<{ id: string; name: string; category: string; location: string; color: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!session?.token) return;
    let isMounted = true;
    setLoading(true);
    setLoadError("");
    getMyStores(session.token)
      .then((response: StoreRecord[]) => {
        if (!isMounted) return;
        setStores(response.map((store) => ({
          id: String(store.id),
          name: store.nom,
          category: store.category ?? "Boutique",
          location: store.address ?? store.location ?? "Afrique",
          color: store.id % 2 === 0 ? "store-card-gold" : "store-card-coral",
        })));
      })
      .catch((reason: unknown) => {
        if (!isMounted) return;
        setStores([]);
        setLoadError(reason instanceof Error ? reason.message : "Impossible de charger vos boutiques.");
      })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [session?.token, reloadKey]);

  const storeLimitReached = stores.length >= 1;
  return <main className="onboarding-shell store-selection-shell"><OrionLogo /><div className="onboarding-center"><span className="public-kicker">ESPACE COMMERÇANT</span><h1>Choisissez votre<br /><em>boutique active.</em></h1><p>Vous pourrez changer de boutique à tout moment depuis la barre latérale.</p>{loading ? <p role="status">Chargement de vos boutiques…</p> : loadError ? <div className="store-selection-error" role="alert"><p>Impossible de vérifier vos boutiques : {loadError}</p><button type="button" className="button button-dark" onClick={() => setReloadKey((current) => current + 1)}>Réessayer</button></div> : <><div className="store-selection-grid">{stores.map((store) => <button type="button" key={store.id} className={`store-selection-card ${activeStoreId === store.id ? "is-active" : ""}`} onClick={() => { setActiveStoreId(store.id); navigate("/dashboard"); }}><span className={`store-card-art ${store.color}`}><Store size={28} /></span><span><strong>{store.name}</strong><small>{store.category}</small><small><MapPin size={12} /> {store.location}</small></span>{activeStoreId === store.id ? <span className="store-selected-check"><Check size={15} /></span> : <ArrowUpRight size={17} />}</button>)}{stores.length > 0 ? <button type="button" disabled={storeLimitReached} className={`store-selection-card add-store-card ${storeLimitReached ? "is-disabled" : ""}`} onClick={() => navigate("/dashboard/stores/add")} title={storeLimitReached ? "Vous ne pouvez gérer qu’une boutique par compte." : "Créer une boutique"}><span className="store-card-art store-card-empty"><Plus size={26} /></span><span><strong>Créer une boutique</strong><small>{storeLimitReached ? "Vous ne pouvez gérer qu’une boutique par compte." : "Ajouter un nouvel espace de vente"}</small></span>{storeLimitReached ? <span aria-hidden="true">—</span> : <ArrowUpRight size={17} />}</button> : null}</div>{stores.length === 0 ? <div className="store-selection-empty"><p>Aucune boutique n’est associée à ce compte commerçant.</p><button type="button" className="button button-dark" onClick={() => navigate("/dashboard/stores/add")}>Créer une boutique</button></div> : null}</>}</div></main>;
}
function EmptyState({ title, copy, action, onAction, icon = <Search size={30} /> }: { title: string; copy: string; action: string; onAction: () => void; icon?: ReactNode }) {
  return <div className="public-empty-state"><span>{icon}</span><h2>{title}</h2><p>{copy}</p><button type="button" className="public-secondary-button" onClick={onAction}>{action} <ArrowRight size={16} /></button></div>;
}

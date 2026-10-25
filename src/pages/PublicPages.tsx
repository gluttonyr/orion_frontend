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
  ChevronUp,
  CircleHelp,
  CreditCard,
  Filter,
  Globe2,
  Heart,
  Grid2X2,
  List,
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
import { getProductById, searchProductSuggestions, setProductLike, type ProductRecord } from "../lib/catalog-service";
import { mapBackendProduct } from "../OrionContext";
import { getUploadUrl } from "../lib/api";
import { applyToMission, formatMissionRemuneration, getMissionById, getMissions, getMyMissionApplication, type MissionRecord } from "../lib/mission-service";
import { checkFedaPayPayment, createFedaPayPayment, recordLiveProductVisit } from "../lib/live-service";
import { getMyStores, getStoreById, getStores, type StoreRecord } from "../lib/store-service";
import { getCurrentUser, type AuthUser } from "../lib/auth-service";
import { getAboutTeam, getSiteSettings, type AboutTeamMember } from "../lib/admin-service";
import { getMyPurchases, type PurchaseRecord } from "../lib/order-service";
import { ThemeModeButton } from "../ThemeMode";
import { toast } from "../components/ui/sonner";
import "../marketplace.css";

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

const favoriteProductsKey = "orion-favorite-products";
const visitorIdKey = "orion-visitor-id";

function getVisitorId(): string {
  let id = window.localStorage.getItem(visitorIdKey);
  if (!id) {
    id = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(visitorIdKey, id);
  }
  return id;
}

function readFavoriteProductIds(): string[] {
  try {
    const saved: unknown = JSON.parse(window.localStorage.getItem(favoriteProductsKey) ?? "[]");
    return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === "string") : [];
  } catch { return []; }
}

function useFavoriteProduct(productId?: string) {
  const [isFavorite, setIsFavorite] = useState(false);
  useEffect(() => {
    const syncFavorites = () => setIsFavorite(Boolean(productId) && readFavoriteProductIds().includes(productId!));
    syncFavorites();
    window.addEventListener("storage", syncFavorites);
    window.addEventListener("orion-favorites-change", syncFavorites);
    return () => {
      window.removeEventListener("storage", syncFavorites);
      window.removeEventListener("orion-favorites-change", syncFavorites);
    };
  }, [productId]);
  const toggleFavorite = async () => {
    if (!productId) return;
    const favorites = readFavoriteProductIds();
    const next = favorites.includes(productId) ? favorites.filter((id) => id !== productId) : [...favorites, productId];
    const liked = next.includes(productId);
    try {
      await setProductLike(Number(productId), getVisitorId(), liked);
      window.localStorage.setItem(favoriteProductsKey, JSON.stringify(next));
      setIsFavorite(liked);
      window.dispatchEvent(new Event("orion-favorites-change"));
      toast.success(liked ? "Produit ajouté à vos favoris." : "Produit retiré de vos favoris.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible d’enregistrer votre like.");
    }
  };
  return { isFavorite, toggleFavorite };
}

function ProductCard({ product, onAdd, marketplace = false, list = false }: { product: Product; onAdd?: (product: Product) => void; marketplace?: boolean; list?: boolean }) {
  const { addToCart } = useOrion();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavoriteProduct(product.id);
  const handleAdd = (event: import("react").MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
    if (onAdd) onAdd(product);
    else { addToCart(product); toast.success(`${product.name} ajouté au panier.`); }
  };
  const handleFavorite = (event: import("react").MouseEvent<HTMLButtonElement>) => { event.preventDefault(); event.stopPropagation(); toggleFavorite(); };
  return <article className={`public-product-card ${marketplace ? `marketplace-product-card ${list ? "is-list" : ""}` : ""}`} role="link" tabIndex={0} onClick={() => navigate(`/product/${product.id}`)} onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); navigate(`/product/${product.id}`); } }}>
    <div className="public-product-image"><Link to={`/product/${product.id}`} className="public-product-image-link"><img src={product.image} alt={product.name} />{getSellingPrice(product) < product.price ? <span className="product-discount-badge">PROMO</span> : null}{product.featured ? <span className="product-featured">SÉLECTION</span> : null}</Link><button type="button" className={`product-save ${isFavorite ? "is-favorite" : ""}`} aria-label={isFavorite ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`} aria-pressed={isFavorite} onClick={handleFavorite}><Heart size={16} fill={isFavorite ? "currentColor" : "none"} /></button></div>
    <div className="public-product-info"><div><p className="public-product-category">{product.category}</p><Link to={`/product/${product.id}`}><h3>{product.name}</h3></Link>{marketplace && product.country ? <p className="public-product-store marketplace-product-country"><MapPin size={11} /> {product.country}</p> : <p className="public-product-store">{product.store}</p>}</div><ProductPrice product={product} className="public-product-price" /></div>
    <button type="button" className={`product-add-button ${marketplace ? "marketplace-add-button" : ""}`} onClick={handleAdd} aria-label={`Ajouter ${product.name} au panier`}><ShoppingCart size={15} />{marketplace ? null : " Ajouter au panier"}</button>
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
  const [searchSuggestions, setSearchSuggestions] = useState<ProductRecord[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchSuggestions([]);
      setSearchLoading(false);
      return;
    }
    let active = true;
    const timer = window.setTimeout(() => {
      setSearchLoading(true);
      searchProductSuggestions(query, 5)
        .then((results) => { if (active) setSearchSuggestions(results.slice(0, 5)); })
        .catch(() => { if (active) setSearchSuggestions([]); })
        .finally(() => { if (active) setSearchLoading(false); });
    }, 250);
    return () => { active = false; window.clearTimeout(timer); };
  }, [searchQuery]);
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    setSearchFocused(false);
    navigate(query ? `/marketplace?search=${encodeURIComponent(query)}` : "/marketplace");
  };
  const openSuggestedProduct = (product: ProductRecord) => {
    setSearchFocused(false);
    setSearchQuery("");
    navigate(`/product/${product.id}`);
  };
  return <div className="public-site-shell">
    <header className="public-header"><div className="public-header-inner"><OrionLogo /><nav className={`public-nav ${menuOpen ? "is-open" : ""}`}><Link to="/" onClick={() => setMenuOpen(false)}>Accueil</Link><Link to="/marketplace" onClick={() => setMenuOpen(false)}>Marketplace</Link><Link to="/opportunities" onClick={() => setMenuOpen(false)}>Opportunités</Link><Link to="/a-propos" onClick={() => setMenuOpen(false)}>À propos</Link></nav><form className="public-header-search" role="search" onSubmit={submitSearch} onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}><Search size={19} /><input aria-label="Rechercher dans Orion" placeholder="Rechercher un produit, une marque, une catégorie..." value={searchQuery} onFocus={() => setSearchFocused(true)} onKeyDown={(event) => { if (event.key === "Escape") setSearchFocused(false); }} onChange={(event) => setSearchQuery(event.target.value)} />{searchFocused && searchQuery.trim().length >= 2 ? <div className="public-search-suggestions" role="listbox" aria-label="Suggestions de produits" onMouseDown={(event) => event.preventDefault()}>{searchLoading ? <p className="public-search-suggestions-message">Recherche des produits…</p> : searchSuggestions.length ? searchSuggestions.map((product) => { const mapped = mapBackendProduct(product); return <button type="button" role="option" aria-label={`Voir ${product.nom}`} className="public-search-suggestion" key={product.id} onClick={() => openSuggestedProduct(product)}><img src={getUploadUrl(product.image)} alt="" /><span><strong>{product.nom}</strong><small>{typeof product.categorie === "string" ? product.categorie : product.categorie?.libellé ?? "Produit Orion"}</small></span><ProductPrice product={mapped} className="public-search-suggestion-price" /></button>; }) : <p className="public-search-suggestions-message">Aucun produit similaire trouvé.</p>}</div> : null}</form><div className="public-header-actions"><ThemeModeButton className="theme-mode-button" /><Link to="/cart" className="public-cart-button" aria-label="Ouvrir le panier"><ShoppingCart size={19} /><span>Panier</span>{cartCount > 0 ? <b>{cartCount}</b> : null}</Link>{session ? <div className="public-account-menu"><button type="button" className="public-account-button" aria-expanded={accountMenuOpen} aria-haspopup="menu" onClick={() => setAccountMenuOpen((current) => !current)}><span className="public-account-avatar">{session.name.slice(0, 2).toUpperCase()}</span><span>{session.name}</span><ChevronDown size={14} /></button>{accountMenuOpen ? <div className="public-account-dropdown" role="menu"><span className="public-account-dropdown-name">Connecté en tant que<br /><strong>{session.name}</strong></span><Link to="/dashboard" role="menuitem" onClick={() => setAccountMenuOpen(false)}>Aller au dashboard <ArrowUpRight size={15} /></Link></div> : null}</div> : <Link to="/login" className="public-account-button"><UserRound size={22} /><span>Mon compte</span><ChevronDown size={14} /></Link>}<button type="button" className="public-menu-button" aria-label="Ouvrir le menu" onClick={() => setMenuOpen((current) => !current)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button></div></div></header>
    <Outlet />
  </div>;
}

function PublicFooter() {
  return <footer className="public-footer"><div className="public-footer-main"><div className="public-footer-brand"><OrionLogo light /><p>Une marketplace africaine pour découvrir, acheter et faire grandir les idées locales.</p><div className="public-socials" aria-label="Réseaux sociaux">
    <a href="https://www.tiktok.com/@reginova_studio" target="_blank" rel="noopener noreferrer" aria-label="TikTok Orion"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.6 7.1a5.2 5.2 0 0 1-3.3-3.8V3h-3.9v12.1a2.8 2.8 0 1 1-2-2.7V8.5a6.7 6.7 0 1 0 5.9 6.6V9.6a9 9 0 0 0 5 1.5V7.2c-.5 0-1.1 0-1.7-.1Z" fill="currentColor" /></svg></a>
    <a href="https://www.instagram.com/reginaldkadanga?utm_source=qr&obrf=aDBmamV2MnpjZGww" target="_blank" rel="noopener noreferrer" aria-label="Instagram Orion"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="17.6" cy="6.7" r="1.2" fill="currentColor" /></svg></a>
    <a href="https://www.linkedin.com/in/reno-graphiste-kadanga-35b21143a?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Orion"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.2 8.5H2.1V22h3.1V8.5ZM3.7 2A1.8 1.8 0 1 0 3.7 5.6 1.8 1.8 0 0 0 3.7 2ZM22 14.3c0-4.1-2.2-6-5.1-6-2.4 0-3.5 1.3-4.1 2.2V8.5H9.7V22h3.1v-6.7c0-1.8.3-3.5 2.6-3.5s2.4 2 2.4 3.6V22H22v-7.7Z" fill="currentColor" /></svg></a>
    <a href="https://x.com/RginaldKad8l" target="_blank" rel="noopener noreferrer" aria-label="X Orion"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.7 5.6 22H2.4l7.3-8.4L1.9 2h6.5l4.4 6.7L18.9 2Zm-1.1 17.8h1.7L7.3 4.1H5.5l12.3 15.7Z" fill="currentColor" /></svg></a>
  </div></div><div className="public-footer-column"><p>EXPLORER</p><Link to="/marketplace">Marketplace</Link><Link to="/opportunities">Opportunités</Link><Link to="/register">Rejoindre Orion</Link></div><div className="public-footer-column"><p>ORION</p><Link to="/login">Connexion</Link><Link to="/profile-selection">Choisir son profil</Link><Link to="/a-propos">À propos</Link></div><div className="public-footer-column"><p>SUPPORT</p><a href="mailto:bonjour@orion.africa">Nous contacter</a><a href="mailto:support@orion.africa">Centre d'aide</a><a href="#terms">Conditions</a></div></div><div className="public-footer-bottom"><span>© 2026 Orion Africa</span><span>Fait avec soin pour les personnes qui font avancer les choses.</span></div></footer>;
}

export function HomePage() {
  const { products } = useOrion();
  const catalog = products;
  const [siteSettings, setSiteSettings] = useState<{ heroImages: string[]; carouselProductIds: number[] }>({ heroImages: [], carouselProductIds: [] });
  const [activeSlide, setActiveSlide] = useState(0);
  const [opportunities, setOpportunities] = useState<OpportunityRecord[]>([]);
  const heroImages = Array.isArray(siteSettings.heroImages) ? siteSettings.heroImages : [];
  const carouselProductIds = Array.isArray(siteSettings.carouselProductIds) ? siteSettings.carouselProductIds : [];
  const selectedCarouselProducts = carouselProductIds
    .map((id) => catalog.find((product) => Number(product.id) === id))
    .filter((product): product is Product => Boolean(product));
  const slides = selectedCarouselProducts.length ? selectedCarouselProducts : catalog.slice(0, 4);

  useEffect(() => {
    getMissions().then((response) => setOpportunities(response.map(mapMissionToOpportunity))).catch(() => setOpportunities([]));
  }, []);

  useEffect(() => {
    getSiteSettings().then((settings) => setSiteSettings({
      heroImages: Array.isArray(settings?.heroImages) ? settings.heroImages : [],
      carouselProductIds: Array.isArray(settings?.carouselProductIds) ? settings.carouselProductIds : [],
    })).catch(() => undefined);
  }, []);

  useEffect(() => {
    const count = slides.length;
    if (count < 2) return;
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % count), 6000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  useEffect(() => { setActiveSlide((current) => slides.length ? current % slides.length : 0); }, [slides.length]);

  const featured = slides.length ? slides[activeSlide % slides.length] : undefined;
  const moveSlide = (direction: number) => setActiveSlide((current) => (current + direction + slides.length) % slides.length);

  return <>
    <main className="public-home">
      <section className="public-home-hero">
        <div className="public-hero-copy">
          <span className="public-kicker">PRODUITS AFRICAINS. TALENTS LOCAUX. UN AVENIR MEILLEUR.</span>
          <h1>Achetez, vendez et saisissez<br />de nouvelles opportunités.</h1>
          <p>Découvrez des produits de toutes catégories et développez votre activité.<br className="desktop-break" /> Créez ou saisissez des opportunités pour faire avancer vos projets.</p>
          <div className="public-hero-actions"><Link to="/marketplace" className="public-primary-button">Explorer le marketplace <ArrowRight size={19} /></Link><Link to="/opportunities" className="public-secondary-button">Voir les opportunités</Link></div>
          <div className="public-trust-line">
            <span><ShieldCheck size={25} /><span><strong>Paiement sécurisé</strong><small>Vos transactions sont protégées</small></span></span>
            <span><Truck size={27} /><span><strong>Livraison rapide</strong><small>Partout en Afrique</small></span></span>
            <span><Headphones size={25} /><span><strong>Service client</strong><small>À votre écoute 7j/7</small></span></span>
          </div>
        </div>
        <div className="public-hero-art" aria-label="Une sélection de produits africains">
          <div className="hero-collage-background" aria-hidden="true"><span className="hero-art-halo" /><span className="hero-art-plinth" /></div>
          {(heroImages.length ? heroImages.slice(0, 3).map((image) => getUploadUrl(image)) : slides.slice(0, 3).map((product) => product.image)).map((image, index) => <Link to="/marketplace" aria-label={`Découvrir le visuel ${index + 1}`} className={`hero-collage-item hero-collage-item-${index + 1} ${heroImages.length ? "is-admin-image" : ""}`} key={`${image}-${index}`}><img src={image} alt={`Sélection Orion ${index + 1}`} /></Link>)}
        </div>
      </section>
      {featured ? <section className="home-featured-carousel" aria-label="Produits à la une">
        <button type="button" className="home-carousel-arrow home-carousel-prev" aria-label="Produit précédent" onClick={() => moveSlide(-1)}><ArrowLeft size={22} /></button>
        <div className="home-carousel-copy"><span className="home-carousel-badge">{getSellingPrice(featured) < featured.price ? "Promotion" : "À découvrir"}</span><span className="home-carousel-category">{featured.category}</span><h2>{featured.name}</h2><ProductPrice product={featured} className="home-carousel-price" /><Link to={`/product/${featured.id}`} className="home-carousel-cta">Voir le produit <ArrowRight size={18} /></Link></div>
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
export function AboutPage() {
  const [team, setTeam] = useState<AboutTeamMember[]>([]);
  useEffect(() => { getAboutTeam().then(setTeam).catch(() => setTeam([])); }, []);
  return <><main className="about-page">
    <section className="about-hero"><div className="about-hero-inner"><span className="about-eyebrow">À PROPOS D’ORION</span><h1>Faire grandir les idées,<br /><em>ensemble.</em></h1><p>ORION réunit le commerce, les talents et les opportunités au sein d’un même espace numérique, pensé pour accompagner celles et ceux qui entreprennent.</p><Link className="about-hero-button" to="/marketplace">Découvrir ORION <ArrowRight size={17} /></Link><span className="about-hero-index">01 — NOTRE HISTOIRE</span></div><div className="about-hero-orbit" aria-hidden="true"><span>O</span><i /></div></section>
    <div className="about-breadcrumb"><Link to="/">ORION</Link><span>/</span><span>À propos</span></div>
    <section className="about-intro"><div><span className="about-eyebrow">QUI SOMMES-NOUS ?</span><h2>Une plateforme au service de celles et ceux qui <em>font avancer les choses.</em></h2><p>ORION est une plateforme numérique conçue pour réunir le commerce, les savoir-faire et les initiatives locales. Elle donne aux commerçants un espace pour présenter leurs produits et permet à chacun de découvrir des offres et des opportunités.</p></div><aside className="about-facts"><span>NOTRE AMBITION</span><strong>Rendre les initiatives locales plus visibles et accessibles.</strong><i>Commerce · Talents · Opportunités</i></aside></section>
    <section className="about-purpose"><div className="about-section-heading"><span className="about-eyebrow">POURQUOI ORION EXISTE</span><h2>Créer des liens qui<br /><em>font avancer.</em></h2></div><div className="about-purpose-copy"><p>Les bonnes idées ont besoin d’un espace pour rencontrer leur public. Les commerces ont besoin de visibilité. Les porteurs de projets ont besoin de partenaires et d’occasions concrètes.</p><p>ORION rassemble ces besoins pour faciliter les rencontres entre vendeurs, clients et personnes qui souhaitent faire avancer un projet.</p><Link to="/opportunities" className="about-text-link">Explorer les opportunités <ArrowRight size={16} /></Link></div></section>
    <section className="about-pillars"><article><span>01</span><Store size={22} /><h3>Découvrir et acheter</h3><p>Parcourir des produits proposés par des boutiques et soutenir les commerces qui font vivre leurs communautés.</p></article><article><span>02</span><Globe2 size={22} /><h3>Développer son activité</h3><p>Créer une présence en ligne, présenter ses produits et gérer son activité depuis un espace dédié.</p></article><article><span>03</span><BriefcaseBusiness size={22} /><h3>Saisir des opportunités</h3><p>Publier ou rejoindre des missions, entrer en contact et transformer une intention en collaboration.</p></article></section>
    <section className="about-mission-vision"><article className="about-mission"><span className="about-eyebrow">NOTRE MISSION</span><h2>Donner aux idées<br />les moyens d’exister.</h2><p>Nous construisons des outils simples pour aider les commerçants et les entrepreneurs à présenter leur travail, rencontrer leur public et développer leurs projets.</p></article><article className="about-vision"><span className="about-eyebrow">NOTRE VISION</span><h2>Un écosystème où<br />chacun trouve sa place.</h2><p>Nous voulons contribuer à un espace numérique ouvert, où les talents et les commerces locaux peuvent être découverts et où les collaborations peuvent naître.</p></article></section>
    <section className="about-commitments"><div><span className="about-eyebrow">NOS ENGAGEMENTS</span><h2>Une plateforme qui avance<br /><em>avec sa communauté.</em></h2></div><ul><li><span>01</span><div><strong>Accessibilité</strong><p>Faciliter l’accès aux outils numériques pour les activités locales.</p></div></li><li><span>02</span><div><strong>Confiance</strong><p>Favoriser des échanges clairs entre les membres de la communauté.</p></div></li><li><span>03</span><div><strong>Évolution</strong><p>Faire évoluer ORION à partir des besoins et des retours de ses utilisateurs.</p></div></li></ul></section>
    <section className="about-team"><div className="about-section-heading"><span className="about-eyebrow">LES PERSONNES DERRIÈRE ORION</span><h2>Une aventure portée<br /><em>par des personnes.</em></h2><p>Découvrez les membres de l’administration qui contribuent au développement d’ORION.</p></div>{team.length ? <div className="about-team-grid">{team.map((member) => <article className="about-team-card" key={member.id}>{member.photo ? <img src={getUploadUrl(member.photo)} alt={member.name} /> : <div className="about-team-avatar">{member.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</div>}<div><span>{member.role}</span><h3>{member.name}</h3>{member.bio ? <p>{member.bio}</p> : null}</div></article>)}</div> : <p className="about-team-empty">ORION se construit progressivement avec sa communauté. Les profils de l’équipe seront présentés ici au fur et à mesure.</p>}</section>
    <section className="about-join"><span className="about-eyebrow">FAISONS GRANDIR LES IDÉES</span><h2>La suite s’écrit<br /><em>avec vous.</em></h2><p>Rejoignez ORION et prenez part à une communauté qui entreprend, partage et crée des opportunités.</p><Link to="/register" className="about-hero-button">Rejoindre ORION <ArrowRight size={17} /></Link></section>
  </main><PublicFooter /></>;
}

const marketplacePriceRanges = [
  { id: 'under-10000', label: 'Moins de 10 000 FCFA', test: (price: number) => price < 10000 },
  { id: '10000-25000', label: '10 000 – 25 000 FCFA', test: (price: number) => price >= 10000 && price < 25000 },
  { id: '25000-50000', label: '25 000 – 50 000 FCFA', test: (price: number) => price >= 25000 && price < 50000 },
  { id: 'over-50000', label: 'Plus de 50 000 FCFA', test: (price: number) => price >= 50000 },
];

function normalizeMarketplaceText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr-FR').trim();
}

export function MarketplacePage() {
  const { products } = useOrion();
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState<string>(() => new URLSearchParams(location.search).get('search') ?? '');
  const [fuzzyProductIds, setFuzzyProductIds] = useState<Set<string> | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [sort, setSort] = useState('Plus récents');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showAllCountries, setShowAllCountries] = useState(false);
  const [openFacets, setOpenFacets] = useState({ categories: true, prices: true, countries: true });

  useEffect(() => {
    setQuery(new URLSearchParams(location.search).get('search') ?? '');
  }, [location.search]);
  useEffect(() => {
    const search = query.trim();
    if (search.length < 2) { setFuzzyProductIds(null); return; }
    let active = true;
    const timer = window.setTimeout(() => {
      searchProductSuggestions(search, 50)
        .then((results) => { if (active) setFuzzyProductIds(new Set(results.map((product) => String(product.id)))); })
        .catch(() => { if (active) setFuzzyProductIds(null); });
    }, 180);
    return () => { active = false; window.clearTimeout(timer); };
  }, [query]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((product) => {
      const name = product.category?.trim();
      if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b, 'fr')).map(([name, count]) => ({ name, count }));
  }, [products]);

  const countries = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((product) => {
      const name = product.country?.trim();
      if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'fr')).map(([name, count]) => ({ name, count }));
  }, [products]);

  const priceCounts = useMemo(() => new Map(marketplacePriceRanges.map((range) => [range.id, products.filter((product) => range.test(getSellingPrice(product))).length])), [products]);
  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalizeMarketplaceText(query);
    const result = products.filter((product) => {
      const literalMatch = normalizeMarketplaceText(`${product.name} ${product.store} ${product.category} ${product.country ?? ''}`).includes(normalizedQuery);
      const matchesText = !normalizedQuery || literalMatch || (fuzzyProductIds?.has(product.id) ?? false);
      const matchesCategory = !selectedCategories.length || selectedCategories.includes(product.category);
      const matchesPrice = !selectedPriceRanges.length || selectedPriceRanges.some((id) => marketplacePriceRanges.find((range) => range.id === id)?.test(getSellingPrice(product)));
      const matchesCountry = !selectedCountries.length || (product.country ? selectedCountries.includes(product.country) : false);
      return matchesText && matchesCategory && matchesPrice && matchesCountry;
    });
    if (sort === 'Prix croissant') return result.sort((a, b) => getSellingPrice(a) - getSellingPrice(b));
    if (sort === 'Prix décroissant') return result.sort((a, b) => getSellingPrice(b) - getSellingPrice(a));
    if (sort === 'Nom A–Z') return result.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    return result.sort((a, b) => Number(b.id) - Number(a.id));
  }, [products, query, fuzzyProductIds, selectedCategories, selectedCountries, selectedPriceRanges, sort]);

  const clearFilters = () => {
    setQuery('');
    setSelectedCategories([]);
    setSelectedPriceRanges([]);
    setSelectedCountries([]);
    if (location.search) navigate('/marketplace', { replace: true });
  };
  const hasActiveFilters = Boolean(query.trim() || selectedCategories.length || selectedPriceRanges.length || selectedCountries.length);
  const toggleFacet = (facet: keyof typeof openFacets) => setOpenFacets((current) => ({ ...current, [facet]: !current[facet] }));
  const toggleCategory = (name: string) => setSelectedCategories((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);
  const togglePriceRange = (id: string) => setSelectedPriceRanges((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const toggleCountry = (name: string) => setSelectedCountries((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);

  return <><main className="public-page marketplace-page">
    <section className="marketplace-hero"><div className="marketplace-hero-pattern" aria-hidden="true"><span>✳</span><span>◈</span><span>◎</span></div><div><span className="marketplace-hero-kicker">ORION MARKETPLACE</span><h1>Place de marché</h1><p>Mode, artisanat, beauté, épicerie — découvrez les créations et produits de nos commerçants.</p></div><span className="marketplace-hero-mark" aria-hidden="true">O</span></section>

    <div className="marketplace-layout">
      <aside className={`marketplace-sidebar ${mobileFiltersOpen ? 'is-open' : ''}`} aria-label="Filtres de la marketplace">
        <div className="marketplace-sidebar-heading"><strong>Filtres</strong><button type="button" onClick={clearFilters} disabled={!hasActiveFilters}>Effacer</button></div>
        <section className="marketplace-facet"><button type="button" className="marketplace-facet-heading" aria-expanded={openFacets.categories} onClick={() => toggleFacet('categories')}>Catégories {openFacets.categories ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</button>{openFacets.categories ? <div className="marketplace-facet-options">{categories.map(({ name, count }) => <label key={name}><input type="checkbox" checked={selectedCategories.includes(name)} onChange={() => toggleCategory(name)} /><span>{name}</span><small>{count}</small></label>)}</div> : null}</section>
        <section className="marketplace-facet"><button type="button" className="marketplace-facet-heading" aria-expanded={openFacets.prices} onClick={() => toggleFacet('prices')}>Prix {openFacets.prices ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</button>{openFacets.prices ? <div className="marketplace-facet-options">{marketplacePriceRanges.map((range) => <label key={range.id}><input type="checkbox" checked={selectedPriceRanges.includes(range.id)} onChange={() => togglePriceRange(range.id)} /><span>{range.label}</span><small>{priceCounts.get(range.id) ?? 0}</small></label>)}</div> : null}</section>
        <section className="marketplace-facet"><button type="button" className="marketplace-facet-heading" aria-expanded={openFacets.countries} onClick={() => toggleFacet('countries')}>Pays {openFacets.countries ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</button>{openFacets.countries ? countries.length ? <div className="marketplace-facet-options">{(showAllCountries ? countries : countries.slice(0, 6)).map(({ name, count }) => <label key={name}><input type="checkbox" checked={selectedCountries.includes(name)} onChange={() => toggleCountry(name)} /><span>{name}</span><small>{count}</small></label>)}{countries.length > 6 ? <button type="button" className="marketplace-show-more" onClick={() => setShowAllCountries((current) => !current)}>{showAllCountries ? 'Voir moins' : 'Voir plus'}</button> : null}</div> : <p className="marketplace-facet-empty">Les pays seront affichés selon les informations renseignées par les commerçants.</p> : null}</section>
      </aside>

      <div className="marketplace-results">
        <div className="marketplace-toolbar"><div className="marketplace-result-count"><strong>{filteredProducts.length}</strong> produit{filteredProducts.length === 1 ? '' : 's'}<span>sur {products.length} au catalogue</span></div><div className="marketplace-toolbar-actions"><button type="button" className={`marketplace-mobile-filter ${mobileFiltersOpen ? 'is-active' : ''}`} onClick={() => setMobileFiltersOpen((current) => !current)}><Filter size={15} /> Filtres{hasActiveFilters ? <i /> : null}</button><label className="marketplace-sort"><span>Trier par</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option>Plus récents</option><option>Prix croissant</option><option>Prix décroissant</option><option>Nom A–Z</option></select><ChevronDown size={14} /></label><div className="marketplace-view-toggle" aria-label="Disposition des produits"><button type="button" className={viewMode === 'grid' ? 'is-active' : ''} aria-label="Affichage en grille" aria-pressed={viewMode === 'grid'} onClick={() => setViewMode('grid')}><Grid2X2 size={17} /></button><button type="button" className={viewMode === 'list' ? 'is-active' : ''} aria-label="Affichage en liste" aria-pressed={viewMode === 'list'} onClick={() => setViewMode('list')}><List size={18} /></button></div></div></div>
        {hasActiveFilters ? <div className="marketplace-active-filters">{selectedCategories.map((item) => <button type="button" key={`category-${item}`} onClick={() => toggleCategory(item)}>{item} <X size={12} /></button>)}{selectedCountries.map((item) => <button type="button" key={`country-${item}`} onClick={() => toggleCountry(item)}>{item} <X size={12} /></button>)}{selectedPriceRanges.map((id) => { const range = marketplacePriceRanges.find((item) => item.id === id); return range ? <button type="button" key={id} onClick={() => togglePriceRange(id)}>{range.label} <X size={12} /></button> : null; })}{query.trim() ? <button type="button" onClick={() => { setQuery(''); navigate('/marketplace'); }}>« {query} » <X size={12} /></button> : null}<button type="button" className="marketplace-clear-filters" onClick={clearFilters}>Tout effacer</button></div> : null}
        {filteredProducts.length ? <div className={`public-products-grid public-marketplace-grid ${viewMode === 'list' ? 'is-list' : ''}`}>{filteredProducts.map((product) => <ProductCard product={product} marketplace list={viewMode === 'list'} key={product.id} />)}</div> : <div className="marketplace-empty"><Search size={23} /><h2>Aucun produit trouvé</h2><p>Essaie de modifier ta recherche ou les filtres sélectionnés.</p><button type="button" className="button button-dark" onClick={clearFilters}>Réinitialiser les filtres</button></div>}
      </div>
    </div>
  </main><PublicFooter /></>;
}

export function StorefrontPage() {
  const { id = "" } = useParams();
  const { products } = useOrion();
  const [store, setStore] = useState<StoreRecord | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    getStoreById(id).then((record) => { if (active) setStore(record); }).catch(() => { if (active) setStore(null); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);
  const storeProducts = useMemo(() => store?.proprietaireId == null ? [] : products.filter((product) => product.ownerId === store.proprietaireId), [products, store?.proprietaireId]);
  if (loading) return <main className="public-page storefront-page"><p role="status">Chargement de la boutique…</p></main>;
  if (!store) return <main className="public-page"><EmptyState title="Boutique introuvable" copy="Cette boutique n’est pas disponible actuellement." action="Retour au marketplace" onAction={() => window.location.assign("/marketplace")} /></main>;
  return <main className="public-page storefront-page">
    <nav className="storefront-breadcrumb" aria-label="Fil d’Ariane"><Link to="/marketplace">Marketplace</Link><span>/</span><span>{store.nom}</span></nav>
    <section className="storefront-hero"><div className="storefront-hero-art" aria-hidden="true"><span>ORION</span><i>✳</i><b>O</b></div><div className="storefront-hero-content"><div className="storefront-brand">{store.logo ? <img src={getUploadUrl(store.logo)} alt={`Logo ${store.nom}`} /> : <span><Store size={27} /></span>}<div><span className="storefront-eyebrow">BOUTIQUE ORION <i /> {store.category || "CRÉATEUR INDÉPENDANT"}</span><h1>{store.nom}</h1><p>{store.address ? <><MapPin size={14} /> {store.address}</> : store.location && /^https?:\/\//i.test(store.location) ? <a className="storefront-map-link" href={store.location} target="_blank" rel="noreferrer"><MapPin size={14} /> Voir la localisation</a> : store.location ? <><MapPin size={14} /> {store.location}</> : "Une boutique locale sur Orion"}</p></div></div><div className="storefront-hero-count"><strong>{storeProducts.length}</strong><span>produit{storeProducts.length === 1 ? "" : "s"}<br />disponible{storeProducts.length === 1 ? "" : "s"}</span></div></div>{store.description ? <p className="storefront-description">{store.description}</p> : null}</section>
    <div className="storefront-products-heading"><div><span className="public-kicker">LA SÉLECTION DE LA BOUTIQUE</span><h2>Nos produits</h2></div><span>{storeProducts.length} produit{storeProducts.length === 1 ? "" : "s"}</span></div>
    {storeProducts.length ? <div className="public-products-grid">{storeProducts.map((product) => <ProductCard key={product.id} product={{ ...product, store: store.nom }} marketplace />)}</div> : <EmptyState title="Aucun produit publié" copy="Cette boutique n’a pas encore de produit disponible." action="Explorer le marketplace" onAction={() => window.location.assign("/marketplace")} />}
  </main>;
}

export function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, products, setLiveAttribution } = useOrion();
  const [product, setProduct] = useState<Product | null>(() => products.find((item) => item.id === id) ?? null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [sellerStoreId, setSellerStoreId] = useState<number | null>(null);
  const [sellerStoreName, setSellerStoreName] = useState<string | null>(null);
  useEffect(() => {
    if (!id) return;
    getProductById(Number(id))
      .then((record) => setProduct(mapBackendProduct(record)))
      .catch(() => setProduct(products.find((item) => item.id === id) ?? null));
  }, [id, products]);
  useEffect(() => {
    let active = true;
    setSellerStoreName(null);
    if (!product) { setSellerStoreId(null); return () => { active = false; }; }
    getStores().then((stores) => {
      if (!active) return;
      const storeById = product.storeId ? stores.find((item) => item.id === product.storeId) : undefined;
      const ownedStore = product.ownerId ? stores.find((item) => item.proprietaireId === product.ownerId) : undefined;
      const resolvedStore = storeById ?? ownedStore ?? (stores.length === 1 ? stores[0] : undefined);
      setSellerStoreId(resolvedStore?.id ?? null);
      setSellerStoreName(resolvedStore?.nom ?? null);
    }).catch(() => { if (active) setSellerStoreId(null); });
    return () => { active = false; };
  }, [product?.ownerId, product?.storeId]);
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
  const { isFavorite, toggleFavorite } = useFavoriteProduct(product?.id);
  if (!product) return <main className="public-page"><EmptyState title="Produit introuvable" copy="Ce produit n'est pas disponible actuellement." action="Retour à la marketplace" onAction={() => navigate("/marketplace")} /></main>;
  const productImages = Array.from(new Set([product.image, ...(product.secondaryImages ?? [])].filter(Boolean)));
  const addProduct = (): void => { addToCart(product, quantity); setAdded(true); toast.success(`${quantity} × ${product.name} ajouté${quantity > 1 ? 's' : ''} au panier.`); };
  return <><main className="public-page product-detail-page"><button type="button" className="back-link" onClick={() => navigate(-1)}><ChevronLeft size={16} /> Retour à la marketplace</button><div className="product-detail-grid"><div className="product-detail-gallery"><div className="product-detail-main-image"><img src={selectedImage || product.image} alt={product.name} /><button type="button" className={`product-save product-detail-save ${isFavorite ? "is-favorite" : ""}`} aria-label={isFavorite ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`} aria-pressed={isFavorite} onClick={toggleFavorite}><Heart size={17} fill={isFavorite ? "currentColor" : "none"} /></button><span className="product-gallery-label">{product.category}</span></div><div className="product-detail-thumb-row">{productImages.map((image, index) => <button type="button" key={`${image}-${index}`} className={`product-thumb ${(selectedImage || product.image) === image ? "is-active" : ""}`} onClick={() => setSelectedImage(image)} aria-label={`Afficher l’image ${index + 1} de ${product.name}`}><img src={image} alt="" /></button>)}</div></div><div className="product-detail-copy"><div className="product-detail-brand"><span className="company-avatar">{(sellerStoreName || product.store).slice(0, 1)}</span>{sellerStoreId ? <Link to={`/store/${sellerStoreId}`} className="storefront-product-link">{sellerStoreName || product.store}</Link> : <span>{sellerStoreName || product.store}</span>}<BadgeCheck size={15} />{sellerStoreId ? <Link to={`/store/${sellerStoreId}`} className="product-store-visit"><Store size={13} /> Voir la boutique</Link> : null}</div><span className="public-kicker">{product.category.toUpperCase()}</span><h1>{product.name}</h1><div className="product-rating"><span>?????</span><strong>4,9</strong><a href="#reviews">24 avis</a></div><p className="product-detail-description">{product.description}</p><ProductPrice product={product} className="product-detail-price" /><div className="product-stock"><span className="stock-dot" /> En stock · expédié sous 48h</div><div className="product-purchase-row"><div className="quantity-control"><button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} aria-label="Diminuer la quantité"><Minus size={15} /></button><span>{quantity}</span><button type="button" onClick={() => setQuantity((current) => Math.min(product.stock, current + 1))} aria-label="Augmenter la quantité"><Plus size={15} /></button></div><button type="button" className="public-primary-button product-buy-button" onClick={addProduct}><ShoppingCart size={17} /> {added ? "Ajouté au panier" : "Ajouter au panier"}</button></div><div className="product-reassurance"><div><Package size={18} /><span>Livraison<br /><b>Partout en Afrique</b></span></div><div><LockKeyhole size={18} /><span>Paiement<br /><b>100% sécurisé</b></span></div><div><CircleHelp size={18} /><span>Besoin d'aide ?<br /><b>Écrivez-nous</b></span></div></div></div></div><section className="product-detail-bottom"><span className="public-kicker">L'HISTOIRE DERRIÈRE L'OBJET</span><h2>Un objet fait pour<br /><em>vivre avec vous.</em></h2><p>Chez Orion, nous croyons que les meilleurs objets ne sont pas seulement beaux. Ils racontent un lieu, un geste, une personne — et trouvent une nouvelle histoire entre vos mains.</p></section></main><PublicFooter /></>;
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

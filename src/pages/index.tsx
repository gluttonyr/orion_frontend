import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Bookmark,
  BriefcaseBusiness,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  CircleHelp,
  Clock3,
  Command,
  CreditCard,
  Download,
  FileText,
  Filter,
  HelpCircle,
  Info,
  LayoutDashboard,
  MapPin,
  MessagesSquare,
  MoreHorizontal,
  PackageOpen,
  Paperclip,
  Phone,
  Plus,
  Search,
  Send,
  Settings2,
  ShoppingBag,
  ShoppingCart,
  Smile,
  Store,
  UserRound,
  Sparkles,
  Star,
  TrendingUp,
  UsersRound,
  Video,
  WalletCards,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getManagementPageCopy, DashboardRouteView } from "./DashboardManagementView";
import { roleLabel, useOrion, type OrionSession, type UserRole } from "../OrionContext";
import { getUploadUrl } from "../lib/api";
import { createMessage, getMessages, type MessageRecord } from "../lib/message-service";
import { getDiscussions, type DiscussionRecord } from "../lib/discussion-service";
import { getMyStores } from "../lib/store-service";

type Section = "home" | "marketplace" | "opportunities" | "messages" | "wallet" | "analytics";
type MessageSender = "me" | "them";

type ChatMessage = {
  id: string;
  text: string;
  time: string;
  sender: MessageSender;
};

type Conversation = {
  id: string;
  name: string;
  role: string;
  initials: string;
  avatarClass: string;
  preview: string;
  time: string;
  unread: number;
  online: boolean;
  messages: ChatMessage[];
};

type NavItem = {
  id: Section;
  label: string;
  icon: LucideIcon;
  badge?: string;
};

type DashboardNavItem = {
  id: string;
  label: string;
  path: string;
  section: Section;
  icon: LucideIcon;
  badge?: string;
};

type Opportunity = {
  id: string;
  label: string;
  title: string;
  description: string;
  meta: string;
  image: string;
  accent: string;
};

const merchantNavItems: DashboardNavItem[] = [
  { id: "home", label: "Tableau de bord", path: "/dashboard", section: "home", icon: LayoutDashboard },
  { id: "stores", label: "Mes boutiques", path: "/dashboard/stores", section: "home", icon: Store },
  { id: "products", label: "Mes produits", path: "/dashboard/products", section: "marketplace", icon: PackageOpen },
  { id: "marketplace", label: "Marketplace", path: "/dashboard/marketplace", section: "marketplace", icon: ShoppingBag },
  { id: "wallet", label: "Portefeuille", path: "/dashboard/wallet", section: "wallet", icon: WalletCards },
  { id: "analytics", label: "Analyses", path: "/dashboard/analytics", section: "analytics", icon: BarChart3 },
  { id: "opportunities", label: "Opportunités", path: "/dashboard/opportunities", section: "opportunities", icon: BriefcaseBusiness, badge: "4" },
  { id: "subscriptions", label: "Abonnements", path: "/dashboard/subscriptions", section: "wallet", icon: CreditCard },
  { id: "messages", label: "Messages", path: "/dashboard/messages", section: "messages", icon: MessagesSquare, badge: "3" },
  { id: "profile", label: "Profil", path: "/dashboard/profile", section: "home", icon: UserRound },
];

const entrepreneurNavItems: DashboardNavItem[] = [
  { id: "home", label: "Tableau de bord", path: "/dashboard", section: "home", icon: LayoutDashboard },
  { id: "opportunities", label: "Opportunités", path: "/dashboard/opportunities", section: "opportunities", icon: BriefcaseBusiness, badge: "4" },
  { id: "analytics", label: "Analyses", path: "/dashboard/analytics", section: "analytics", icon: BarChart3 },
  { id: "messages", label: "Messages", path: "/dashboard/messages", section: "messages", icon: MessagesSquare, badge: "3" },
  { id: "profile", label: "Profil", path: "/dashboard/profile", section: "home", icon: UserRound },
];

const opportunities: Opportunity[] = [
  {
    id: "studio",
    label: "COLLABORATION",
    title: "Studio Serein cherche un directeur artistique",
    description: "Construisez une nouvelle identité pour une maison d'objets du quotidien.",
    meta: "Paris · 3 jours",
    image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=88",
    accent: "gold",
  },
  {
    id: "atelier",
    label: "PROJET RÉMUNÉRÉ",
    title: "L'Atelier N°7 prépare sa collection d'automne",
    description: "Une mission éditoriale autour de la matière, du geste et du temps long.",
    meta: "Lyon · 1 semaine",
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=88",
    accent: "coral",
  },
  {
    id: "common",
    label: "RÉSEAU ORION",
    title: "Rencontrez des profils qui vous ressemblent",
    description: "Des expertises complémentaires, réunies autour d'idées qui comptent.",
    meta: "Communauté · 12 nouveaux",
    image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=88",
    accent: "mint",
  },
];

const marketplaceItems = [
  { id: "chair", name: "Chaise Sillon", creator: "Atelier N°7", price: "480 €", image: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=88", tag: "Objet" },
  { id: "lamp", name: "Lampe Lune 02", creator: "Maison Calme", price: "165 €", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=88", tag: "Maison" },
  { id: "print", name: "Les jours tranquilles", creator: "Louise Ferret", price: "72 €", image: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=800&q=88", tag: "Édition" },
];

const sectionTitles: Record<Section, { eyebrow: string; title: string; description: string }> = {
  home: { eyebrow: "MARDI 19 AOÛT 2026", title: "Bonjour, Jean", description: "Voici ce qui mérite votre attention aujourd'hui." },
  marketplace: { eyebrow: "DÉCOUVRIR", title: "Marketplace", description: "Des objets, des idées et des savoir-faire sélectionnés pour vous." },
  opportunities: { eyebrow: "FAIRE GRANDIR LES IDÉES", title: "Opportunités", description: "Des projets qui cherchent les bonnes personnes, au bon moment." },
  messages: { eyebrow: "VOTRE RÉSEAU", title: "Messages", description: "Poursuivez les conversations qui font avancer vos projets." },
  wallet: { eyebrow: "VOTRE ACTIVITÉ", title: "Portefeuille", description: "Un aperçu simple de vos revenus, dépenses et mouvements." },
  analytics: { eyebrow: "VUE D'ENSEMBLE", title: "Analytiques", description: "Comprenez ce qui crée le plus de valeur dans votre espace Orion." },
};

function sectionFromPath(pathname: string): Section {
  if (pathname.includes("messages")) return "messages";
  if (pathname.includes("opportunities")) return "opportunities";
  if (pathname.includes("wallet") || pathname.includes("subscriptions") || pathname.includes("withdrawal")) return "wallet";
  if (pathname.includes("analytics")) return "analytics";
  if (pathname.includes("marketplace") || pathname.includes("products") || pathname.includes("product/")) return "marketplace";
  return "home";
}

function dashboardPathForSection(section: Section): string {
  if (section === "marketplace") return "/dashboard/marketplace";
  if (section === "opportunities") return "/dashboard/opportunities";
  if (section === "messages") return "/dashboard/messages";
  if (section === "wallet") return "/dashboard/wallet";
  if (section === "analytics") return "/dashboard/analytics";
  return "/dashboard";
}

function Avatar({ initials, avatarClass, online = false, size = "default" }: { initials: string; avatarClass: string; online?: boolean; size?: "small" | "default" | "large" }) {
  return (
    <span className={`avatar ${avatarClass} avatar-${size}`}>
      {initials}
      {online ? <span className="avatar-status" /> : null}
    </span>
  );
}

function BrandMark() {
  return <img className="brand-logo-image" src="/orion.jpeg" alt="Logo Orion" />;
}

function Sidebar({ activeSection, pathname, role, onRoute }: { activeSection: Section; pathname: string; role: UserRole; onRoute: (path: string) => void }) {
  const { session, activeStoreId } = useOrion();
  const [activeStoreName, setActiveStoreName] = useState<string>("");
  const navItems: DashboardNavItem[] = role === "COMMERCANT" ? merchantNavItems : entrepreneurNavItems;
  const displayName: string = session?.name ?? "Membre Orion";
  const initials: string = displayName.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();

  useEffect(() => {
    if (role !== "COMMERCANT" || !session?.token || !activeStoreId) { setActiveStoreName(""); return; }
    let isMounted = true;
    getMyStores(session.token)
      .then((stores) => {
        if (!isMounted) return;
        setActiveStoreName(stores.find((store) => String(store.id) === activeStoreId)?.nom ?? "");
      })
      .catch(() => { if (isMounted) setActiveStoreName(""); });
    return () => { isMounted = false; };
  }, [activeStoreId, role, session?.token]);
  return (
    <aside className="sidebar-shell">
      <div className="sidebar-top">
        <div className="brand-lockup"><BrandMark /></div>
        <span className="workspace-pill">{role === "COMMERCANT" ? "COMMERCE" : "ENTREPRENEUR"}</span>
      </div>
      <div className="sidebar-profile"><Avatar initials={initials} avatarClass="avatar-burgundy" size="default" /><div className="min-w-0"><p className="sidebar-profile-name">{displayName}</p><p className="sidebar-profile-role">{roleLabel(role)} · Orion</p></div><ChevronDown size={15} strokeWidth={1.8} className="sidebar-chevron" /></div>
      {role === "COMMERCANT" ? <button type="button" className="sidebar-store-switcher" onClick={() => onRoute("/store-selection")}><span className="sidebar-store-icon"><Store size={14} /></span><span><small>BOUTIQUE ACTIVE</small><strong>{activeStoreName || (activeStoreId ? "Chargement…" : "Sélectionner une boutique")}</strong></span><ChevronDown size={14} /></button> : null}
      <nav className="sidebar-nav" aria-label="Navigation principale"><p className="sidebar-label">{role === "COMMERCANT" ? "ESPACE COMMERCE" : "ESPACE ENTREPRENEUR"}</p>{navItems.map((item) => { const Icon = item.icon; const isActive: boolean = pathname === item.path || (item.path !== "/dashboard" && pathname.startsWith(item.path)); return <button type="button" key={item.id} className={`sidebar-nav-item ${isActive ? "is-active" : ""}`} onClick={() => onRoute(item.path)}><Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} /><span>{item.label}</span>{item.badge ? <span className={`sidebar-badge ${isActive ? "is-active" : ""}`}>{item.badge}</span> : null}</button>; })}</nav>
      <div className="sidebar-bottom"><div className="sidebar-notice"><div className="notice-icon"><Sparkles size={15} /></div><div><p className="notice-title">Nouveau sur Orion</p><p className="notice-copy">Découvrez les cercles privés.</p></div><ArrowUpRight size={14} className="notice-arrow" /></div><button type="button" className="sidebar-bottom-item" onClick={() => onRoute("/dashboard/profile")}><Settings2 size={17} /> Réglages</button><button type="button" className="sidebar-bottom-item"><CircleHelp size={17} /> Centre d'aide</button><div className="sidebar-version"><span className="version-dot" /> Orion 2.4.0 <span className="version-status">à jour</span></div></div>
    </aside>
  );
}

function TopBar({ title, onNotificationToggle, notificationsOpen, session, onNavigate }: { title: string; onNotificationToggle: () => void; notificationsOpen: boolean; session: OrionSession | null; onNavigate: (path: string) => void }) {
  const [accountMenuOpen, setAccountMenuOpen] = useState<boolean>(false);
  const initials = session?.name?.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "OR";
  return (
    <header className="topbar">
      <div className="topbar-mobile-title">{title}</div>
      <div className="search-field">
        <Search size={18} strokeWidth={1.8} />
        <input aria-label="Rechercher" placeholder="Rechercher dans Orion..." />
        <span className="search-shortcut"><Command size={12} /> K</span>
      </div>
      <div className="topbar-actions">
        <button type="button" className="topbar-icon-button" aria-label="Aide"><HelpCircle size={19} strokeWidth={1.75} /></button>
        <div className="notification-wrap">
          <button type="button" className={`topbar-icon-button ${notificationsOpen ? "is-active" : ""}`} aria-label="Notifications" onClick={onNotificationToggle}><Bell size={19} strokeWidth={1.75} /><span className="notification-dot" /></button>
          {notificationsOpen ? (
            <div className="notification-popover">
              <div className="popover-heading"><span>Notifications</span><button type="button"><Check size={15} /> Tout lire</button></div>
              <div className="notification-item"><span className="notification-symbol symbol-coral"><MessagesSquare size={15} /></span><div><p>Marie Laurent vous a écrit</p><span>Il y a 2 min</span></div></div>
              <div className="notification-item"><span className="notification-symbol symbol-gold"><BriefcaseBusiness size={15} /></span><div><p>4 opportunités correspondent à votre profil</p><span>Il y a 1 h</span></div></div>
            </div>
          ) : null}
        </div>
        <div className="topbar-divider" />
        <div className="topbar-account-wrap"><button type="button" className="topbar-user" aria-expanded={accountMenuOpen} aria-haspopup="menu" onClick={() => setAccountMenuOpen((current) => !current)}>{session?.image ? <img className="topbar-user-photo" src={getUploadUrl(session.image)} alt="" /> : <Avatar initials={initials} avatarClass="avatar-burgundy" size="small" />}<span>{session?.name ?? "Mon compte"}</span><ChevronDown size={15} /></button>{accountMenuOpen ? <div className="topbar-account-menu" role="menu"><div className="topbar-account-summary"><strong>{session?.name ?? "Mon compte"}</strong><span>{session?.email}</span></div><button type="button" role="menuitem" onClick={() => { setAccountMenuOpen(false); onNavigate("/dashboard"); }}><LayoutDashboard size={15} /> Aller au dashboard</button><button type="button" role="menuitem" onClick={() => { setAccountMenuOpen(false); onNavigate("/dashboard/profile"); }}><UserRound size={15} /> Mon profil</button></div> : null}</div>
      </div>
    </header>
  );
}

function PageHeader({ section, onSectionChange, pageCopy }: { section: Section; onSectionChange: (section: Section) => void; pageCopy?: { eyebrow: string; title: string; description: string } | null }) {
  const copy = pageCopy ?? sectionTitles[section];
  return <div className="page-header"><div><p className="eyebrow">{copy.eyebrow}</p><h1>{copy.title}</h1><p className="page-description">{copy.description}</p></div>{pageCopy ? null : <div className="page-header-actions">{section === "home" ? <button type="button" className="button button-quiet" onClick={() => onSectionChange("analytics")}><BarChart3 size={16} /> Voir les statistiques</button> : null}{section === "marketplace" ? <button type="button" className="button button-dark"><Plus size={16} /> Publier une offre</button> : null}{section === "opportunities" ? <button type="button" className="button button-dark"><Plus size={16} /> Proposer un projet</button> : null}{section === "messages" ? <button type="button" className="button button-dark"><Plus size={16} /> Nouveau message</button> : null}{section === "wallet" ? <button type="button" className="button button-dark"><Download size={16} /> Exporter</button> : null}</div>}</div>;
}

function WalletCard({ onNavigate }: { onNavigate: (section: Section) => void }) {
  return (
    <section className="wallet-card">
      <div className="wallet-card-glow" />
      <div className="wallet-card-top">
        <div>
          <p className="card-overline light">SOLDE DISPONIBLE</p>
          <div className="wallet-amount">2 840,50 <span>€</span></div>
        </div>
        <span className="wallet-chip"><CircleDollarSign size={14} /> ORION WALLET</span>
      </div>
      <div className="wallet-card-bottom">
        <div className="wallet-change"><TrendingUp size={15} /> <strong>+12,8 %</strong><span>depuis le mois dernier</span></div>
        <button type="button" className="wallet-link" onClick={() => onNavigate("wallet")}>Voir le portefeuille <ArrowUpRight size={15} /></button>
      </div>
      <svg className="wallet-sparkline" viewBox="0 0 440 92" role="img" aria-label="Évolution positive du portefeuille">
        <path d="M0 74 C35 73 35 58 66 63 C92 67 91 40 123 46 C156 51 155 32 190 39 C224 46 224 17 256 24 C287 32 291 46 321 30 C352 14 366 35 388 18 C405 4 426 14 440 3" fill="none" stroke="rgba(255,247,234,0.85)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M0 91 L0 74 C35 73 35 58 66 63 C92 67 91 40 123 46 C156 51 155 32 190 39 C224 46 224 17 256 24 C287 32 291 46 321 30 C352 14 366 35 388 18 C405 4 426 14 440 3 L440 91 Z" fill="url(#walletFade)" />
        <defs><linearGradient id="walletFade" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="rgba(255,247,234,0.18)" /><stop offset="1" stopColor="rgba(255,247,234,0)" /></linearGradient></defs>
      </svg>
    </section>
  );
}

function StatCard({ icon: Icon, label, value, detail, trend, tone }: { icon: LucideIcon; label: string; value: string; detail: string; trend?: string; tone: string }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={17} strokeWidth={1.85} /></div>
      <div className="stat-card-content"><p>{label}</p><strong>{value}</strong><span>{detail}</span></div>
      {trend ? <span className="stat-trend">{trend}</span> : null}
    </div>
  );
}

function QuickActions({ onNavigate }: { onNavigate: (section: Section) => void }) {
  const actions: { label: string; copy: string; icon: LucideIcon; action: () => void; tone: string }[] = [
    { label: "Explorer", copy: "La marketplace", icon: ShoppingBag, action: () => onNavigate("marketplace"), tone: "action-pink" },
    { label: "Postuler", copy: "Aux opportunités", icon: BriefcaseBusiness, action: () => onNavigate("opportunities"), tone: "action-gold" },
    { label: "Écrire", copy: "À votre réseau", icon: MessagesSquare, action: () => onNavigate("messages"), tone: "action-blue" },
    { label: "Analyser", copy: "Votre activité", icon: BarChart3, action: () => onNavigate("analytics"), tone: "action-green" },
  ];
  return (
    <section className="section-block">
      <div className="section-heading"><div><p className="eyebrow">ACCÈS RAPIDE</p><h2>Que souhaitez-vous faire ?</h2></div></div>
      <div className="quick-actions-grid">
        {actions.map(({ label, copy, icon: Icon, action, tone }) => <button type="button" key={label} className="quick-action-card" onClick={action}><span className={`quick-action-icon ${tone}`}><Icon size={19} strokeWidth={1.85} /></span><span><strong>{label}</strong><small>{copy}</small></span><ArrowUpRight size={17} className="quick-action-arrow" /></button>)}
      </div>
    </section>
  );
}

function OpportunityCard({ opportunity, onSelect }: { opportunity: Opportunity; onSelect: () => void }) {
  return (
    <button type="button" className="opportunity-card" onClick={onSelect}>
      <div className="opportunity-image-wrap"><img src={opportunity.image} alt="" className="opportunity-image" /><span className={`opportunity-badge badge-${opportunity.accent}`}>{opportunity.label}</span><span className="opportunity-bookmark"><Bookmark size={15} /></span></div>
      <div className="opportunity-card-body"><h3>{opportunity.title}</h3><p>{opportunity.description}</p><div className="opportunity-meta"><span><MapPin size={13} /> {opportunity.meta}</span><ArrowRight size={15} /></div></div>
    </button>
  );
}

function RecentActivity({ onNavigate }: { onNavigate: (section: Section) => void }) {
  const activity = [
    { icon: ArrowDownLeft, tone: "activity-green", title: "Paiement reçu", copy: "Studio Serein · Projet identité", amount: "+ 1 200,00 €", time: "Aujourd'hui, 09:12" },
    { icon: ShoppingCart, tone: "activity-coral", title: "Achat confirmé", copy: "Chaise Sillon · Atelier N°7", amount: "− 480,00 €", time: "Hier, 17:46" },
    { icon: UsersRound, tone: "activity-gold", title: "Nouveau contact", copy: "Clara Morel vous a ajouté", amount: "", time: "Hier, 11:24" },
  ];
  return (
    <section className="panel activity-panel">
      <div className="panel-heading"><div><p className="eyebrow">DERNIERS MOUVEMENTS</p><h2>Votre activité</h2></div><button type="button" className="text-link" onClick={() => onNavigate("wallet")}>Tout voir <ChevronRight size={15} /></button></div>
      <div className="activity-list">{activity.map(({ icon: Icon, tone, title, copy, amount, time }) => <div className="activity-row" key={title}><span className={`activity-icon ${tone}`}><Icon size={16} /></span><div className="activity-details"><strong>{title}</strong><span>{copy}</span></div><div className="activity-values">{amount ? <strong className={amount.startsWith("+") ? "positive" : "negative"}>{amount}</strong> : null}<span>{time}</span></div></div>)}</div>
    </section>
  );
}

function ConversationPreview({ conversation, onOpen }: { conversation: Conversation; onOpen: () => void }) {
  return (
    <button type="button" className="conversation-preview" onClick={onOpen}>
      <Avatar initials={conversation.initials} avatarClass={conversation.avatarClass} online={conversation.online} size="default" />
      <span className="conversation-preview-content"><span className="conversation-preview-top"><strong>{conversation.name}</strong><small>{conversation.time}</small></span><span className="conversation-preview-bottom"><span>{conversation.preview}</span>{conversation.unread > 0 ? <b>{conversation.unread}</b> : null}</span></span>
    </button>
  );
}

function ConversationsPanel({ conversations, onOpen, onViewAll }: { conversations: Conversation[]; onOpen: (id: string) => void; onViewAll: () => void }) {
  return (
    <section className="panel conversations-panel">
      <div className="panel-heading"><div><p className="eyebrow">VOTRE RÉSEAU</p><h2>Conversations récentes</h2></div><button type="button" className="text-link" onClick={onViewAll}>Voir tout <ChevronRight size={15} /></button></div>
      <div className="conversation-list">{conversations.slice(0, 3).map((conversation) => <ConversationPreview key={conversation.id} conversation={conversation} onOpen={() => onOpen(conversation.id)} />)}</div>
    </section>
  );
}

function HomeView({ conversations, onNavigate, onOpenConversation, role }: { conversations: Conversation[]; onNavigate: (section: Section) => void; onOpenConversation: (id: string) => void; role: UserRole }) {
  return (
    <>
      <div className="dashboard-top-grid">{role === "COMMERCANT" ? <WalletCard onNavigate={onNavigate} /> : <section className="wallet-card entrepreneur-dashboard-card"><div className="wallet-card-top"><div><p className="card-overline light">VOTRE RYTHME</p><div className="wallet-amount">7 <span>missions actives</span></div></div><span className="wallet-chip"><BriefcaseBusiness size={14} /> ENTREPRENEUR</span></div><div className="wallet-card-bottom"><div className="wallet-change"><TrendingUp size={15} /> <strong>+24 %</strong><span>de connexions utiles</span></div><button type="button" className="wallet-link" onClick={() => onNavigate("opportunities")}>Voir les opportunités <ArrowUpRight size={15} /></button></div></section>}<div className="stats-stack">{role === "COMMERCANT" ? <><StatCard icon={TrendingUp} label="Revenus ce mois" value="4 286 €" detail="+ 18,4 % vs. juillet" trend="↑" tone="stat-green" /><StatCard icon={BriefcaseBusiness} label="Opportunités actives" value="12" detail="4 nouvelles cette semaine" tone="stat-gold" /></> : <><StatCard icon={BriefcaseBusiness} label="Candidatures suivies" value="8" detail="2 réponses cette semaine" trend="↑" tone="stat-gold" /><StatCard icon={UsersRound} label="Connexions utiles" value="34" detail="+ 6 ce mois" trend="↑" tone="stat-green" /></>}</div></div>
      <QuickActions onNavigate={onNavigate} />
      <section className="section-block opportunities-section"><div className="section-heading"><div><p className="eyebrow">SÉLECTION ORION</p><h2>Des opportunités pour vous</h2></div><button type="button" className="text-link" onClick={() => onNavigate("opportunities")}>Explorer les opportunités <ChevronRight size={15} /></button></div><div className="opportunities-grid">{opportunities.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} onSelect={() => onNavigate("opportunities")} />)}</div></section>
      <div className="lower-panels"><RecentActivity onNavigate={onNavigate} /><ConversationsPanel conversations={conversations} onOpen={onOpenConversation} onViewAll={() => onNavigate("messages")} /></div>
    </>
  );
}

function MarketplaceView({ onNavigate }: { onNavigate: (section: Section) => void }) {
  return (
    <div className="view-stack"><div className="marketplace-toolbar"><div className="marketplace-tabs"><button type="button" className="marketplace-tab is-active">Tout découvrir</button><button type="button" className="marketplace-tab">Objets</button><button type="button" className="marketplace-tab">Services</button><button type="button" className="marketplace-tab">Éditions</button></div><button type="button" className="button button-quiet"><Filter size={15} /> Filtrer</button></div><div className="marketplace-hero"><div><span className="hero-stamp">SÉLECTION DU MOMENT</span><h2>Des choses bien faites,<br /><em>pour durer longtemps.</em></h2><p>Une sélection d'objets et de savoir-faire choisis pour leur histoire, leur usage et leur justesse.</p><button type="button" className="button button-cream" onClick={() => onNavigate("opportunities")}>Voir la sélection <ArrowUpRight size={16} /></button></div><div className="marketplace-hero-shape"><div className="hero-ring" /><div className="hero-orb" /></div></div><div className="marketplace-grid">{marketplaceItems.map((item) => <article className="market-item" key={item.id}><div className="market-item-image"><img src={item.image} alt="" /><span>{item.tag}</span><button type="button" aria-label={`Enregistrer ${item.name}`}><Bookmark size={16} /></button></div><div className="market-item-info"><div><h3>{item.name}</h3><p>{item.creator}</p></div><strong>{item.price}</strong></div></article>)}</div></div>
  );
}

function OpportunitiesView({ onNavigate }: { onNavigate: (section: Section) => void }) {
  return (
    <div className="view-stack"><div className="opportunities-featured"><div><span className="hero-stamp">ORION OPEN CALL</span><h2>Le prochain projet<br /><em>commence ici.</em></h2><p>Chaque semaine, nous réunissons des personnes curieuses autour de missions qui ont du sens.</p><button type="button" className="button button-cream" onClick={() => onNavigate("messages")}>Parler à l'équipe <ArrowUpRight size={16} /></button></div><div className="featured-people"><span className="float-note note-one">design</span><span className="float-note note-two">stratégie</span><div className="people-collage"><div className="person-card person-card-one" /><div className="person-card person-card-two" /><div className="person-card person-card-three" /></div></div></div><div className="filter-row"><span className="filter-caption">12 résultats</span><div className="filter-pills"><button type="button" className="filter-pill is-active">Pour vous</button><button type="button" className="filter-pill">Récent</button><button type="button" className="filter-pill">À distance</button><button type="button" className="filter-pill">Rémunéré</button></div><button type="button" className="sort-button">Trier par <strong>Pertinence</strong><ChevronDown size={14} /></button></div><div className="opportunities-list">{opportunities.concat([{ id: "network", label: "MISSION COURTE", title: "Un regard extérieur pour un lieu vivant", description: "Aidez la librairie La Traverse à repenser son accueil et sa programmation.", meta: "Bordeaux · 2 jours", image: "https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=900&q=88", accent: "blue" }]).map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} onSelect={() => onNavigate("messages")} />)}</div></div>
  );
}

function MessagesView({ conversations, selectedConversationId, onSelectConversation, onSendMessage, draft, onDraftChange }: { conversations: Conversation[]; selectedConversationId: string; onSelectConversation: (id: string) => void; onSendMessage: (event: FormEvent<HTMLFormElement>) => void; draft: string; onDraftChange: (value: string) => void }) {
  const selectedConversation = conversations.find((conversation) => conversation.id === selectedConversationId) ?? conversations[0];
  if (!selectedConversation) return <div className="messages-shell"><aside className="messages-sidebar"><div className="messages-sidebar-heading"><div><p className="eyebrow">MESSAGERIE</p><h2>Discussions</h2></div><button type="button" className="round-button" aria-label="Nouvelle discussion"><Plus size={17} /></button></div><div className="message-search"><Search size={15} /><input placeholder="Rechercher" aria-label="Rechercher une discussion" /></div><div className="message-filters"><button type="button" className="message-filter is-active">Toutes <span>0</span></button><button type="button" className="message-filter">Non lues <span>0</span></button></div><div className="messages-list"><div className="messages-empty"><MessagesSquare size={19} /><span>Aucune discussion pour le moment.</span></div></div></aside><section className="chat-panel"><div className="chat-empty-state"><MessagesSquare size={28} /><p>Sélectionnez une discussion pour afficher les messages.</p></div></section></div>;
  return (
    <div className="messages-shell"><aside className="messages-sidebar"><div className="messages-sidebar-heading"><div><p className="eyebrow">MESSAGERIE</p><h2>Discussions</h2></div><button type="button" className="round-button" aria-label="Nouvelle discussion"><Plus size={17} /></button></div><div className="message-search"><Search size={15} /><input placeholder="Rechercher" aria-label="Rechercher une discussion" /></div><div className="message-filters"><button type="button" className="message-filter is-active">Toutes <span>4</span></button><button type="button" className="message-filter">Non lues <span>3</span></button></div><div className="messages-list">{conversations.map((conversation) => <button type="button" key={conversation.id} className={`message-list-item ${conversation.id === selectedConversation.id ? "is-selected" : ""}`} onClick={() => onSelectConversation(conversation.id)}><Avatar initials={conversation.initials} avatarClass={conversation.avatarClass} online={conversation.online} size="default" /><span className="message-list-copy"><span className="message-list-top"><strong>{conversation.name}</strong><small>{conversation.time}</small></span><span className="message-list-bottom"><span>{conversation.preview}</span>{conversation.unread > 0 ? <b>{conversation.unread}</b> : null}</span></span></button>)}</div></aside><section className="chat-panel"><div className="chat-header"><div className="chat-contact"><Avatar initials={selectedConversation.initials} avatarClass={selectedConversation.avatarClass} online={selectedConversation.online} size="default" /><div><h2>{selectedConversation.name}</h2><p>{selectedConversation.online ? "En ligne" : selectedConversation.role}</p></div></div><div className="chat-actions"><button type="button" className="topbar-icon-button" aria-label="Appel audio"><Phone size={17} /></button><button type="button" className="topbar-icon-button" aria-label="Appel vidéo"><Video size={17} /></button><button type="button" className="topbar-icon-button" aria-label="Informations"><Info size={17} /></button></div></div><div className="chat-context"><div className="context-icon"><BriefcaseBusiness size={15} /></div><div><span>CONVERSATION LIÉE À</span><strong>Projet identité · Studio Serein</strong></div><ChevronRight size={16} /></div><div className="chat-messages"><div className="chat-day"><span>Aujourd'hui</span></div>{selectedConversation.messages.map((message) => <div className={`chat-message-row ${message.sender === "me" ? "is-me" : ""}`} key={message.id}>{message.sender === "them" ? <Avatar initials={selectedConversation.initials} avatarClass={selectedConversation.avatarClass} size="small" /> : null}<div className={`chat-bubble ${message.sender === "me" ? "bubble-me" : "bubble-them"}`}><p>{message.text}</p><span>{message.time} {message.sender === "me" ? <CheckCheck size={13} /> : null}</span></div></div>)}</div><form className="chat-composer" onSubmit={onSendMessage}><button type="button" className="composer-tool" aria-label="Joindre un fichier"><Paperclip size={18} /></button><input value={draft} onChange={(event) => onDraftChange(event.target.value)} placeholder="Écrire un message..." aria-label="Écrire un message" /><button type="button" className="composer-tool" aria-label="Ajouter un emoji"><Smile size={18} /></button><button type="submit" className="send-button" aria-label="Envoyer" disabled={!draft.trim()}><Send size={17} /></button></form></section></div>
  );
}

/*
function WalletView() {
  return (
    <div className="view-stack"><div className="wallet-overview"><div><p className="card-overline light">SOLDE TOTAL</p><div className="wallet-overview-amount">2 840,50 <span>€</span></div><div className="wallet-change"><TrendingUp size={15} /> <strong>+12,8 %</strong><span>sur les 30 derniers jours</span></div></div><div className="wallet-overview-actions"><button type="button" className="button button-cream"><Plus size={16} /> Ajouter des fonds</button><button type="button" className="wallet-outline-button"><ArrowUpRight size={16} /> Transférer</button></div></div><div className="wallet-metrics"><StatCard icon={ArrowDownLeft} label="Entrées ce mois" value="4 286 €" detail="3 transactions" tone="stat-green" /><StatCard icon={ArrowUpRight} label="Sorties ce mois" value="1 446 €" detail="7 transactions" tone="stat-coral" /><StatCard icon={CreditCard} label="Carte Orion" value="•• 4829" detail="Active" tone="stat-blue" /></div><section className="panel transactions-panel"><div className="panel-heading"><div><p className="eyebrow">HISTORIQUE</p><h2>Dernières transactions</h2></div><button type="button" className="button button-quiet"><Filter size={15} /> Filtrer</button></div><div className="transaction-table"><div className="transaction-head"><span>TRANSACTION</span><span>DATE</span><span>STATUT</span><span>MONTANT</span></div>{[{ name: "Studio Serein", copy: "Paiement reçu · Projet identité", icon: ArrowDownLeft, tone: "activity-green", date: "Aujourd'hui, 09:12", amount: "+ 1 200,00 €", positive: true }, { name: "Atelier N°7", copy: "Achat · Chaise Sillon", icon: ShoppingCart, tone: "activity-coral", date: "18 août 2026", amount: "− 480,00 €", positive: false }, { name: "Maison Calme", copy: "Mission conseil", icon: ArrowDownLeft, tone: "activity-green", date: "16 août 2026", amount: "+ 850,00 €", positive: true }].map((transaction) => <div className="transaction-row" key={transaction.name}><div className="transaction-name"><span className={`activity-icon ${transaction.tone}`}><transaction.icon size={16} /></span><div><strong>{transaction.name}</strong><small>{transaction.copy}</small></div></div><span>{transaction.date}</span><span className="status-complete"><Check size={13} /> Terminée</span><strong className={transaction.positive ? "positive" : "negative"}>{transaction.amount}</strong></div>)}</div></section></div>
}

*/

function WalletView() {
  const transactions: { name: string; copy: string; icon: LucideIcon; tone: string; date: string; amount: string; positive: boolean }[] = [
    { name: "Studio Serein", copy: "Paiement reçu · Projet identité", icon: ArrowDownLeft, tone: "activity-green", date: "Aujourd'hui, 09:12", amount: "+ 1 200,00 €", positive: true },
    { name: "Atelier N°7", copy: "Achat · Chaise Sillon", icon: ShoppingCart, tone: "activity-coral", date: "18 août 2026", amount: "− 480,00 €", positive: false },
    { name: "Maison Calme", copy: "Mission conseil", icon: ArrowDownLeft, tone: "activity-green", date: "16 août 2026", amount: "+ 850,00 €", positive: true },
  ];

  return (
    <div className="view-stack">
      <div className="wallet-overview">
        <div>
          <p className="card-overline light">SOLDE TOTAL</p>
          <div className="wallet-overview-amount">2 840,50 <span>€</span></div>
          <div className="wallet-change"><TrendingUp size={15} /> <strong>+12,8 %</strong><span>sur les 30 derniers jours</span></div>
        </div>
        <div className="wallet-overview-actions"><button type="button" className="button button-cream"><Plus size={16} /> Ajouter des fonds</button><button type="button" className="wallet-outline-button"><ArrowUpRight size={16} /> Transférer</button></div>
      </div>
      <div className="wallet-metrics">
        <StatCard icon={ArrowDownLeft} label="Entrées ce mois" value="4 286 €" detail="3 transactions" tone="stat-green" />
        <StatCard icon={ArrowUpRight} label="Sorties ce mois" value="1 446 €" detail="7 transactions" tone="stat-coral" />
        <StatCard icon={CreditCard} label="Carte Orion" value="•• 4829" detail="Active" tone="stat-blue" />
      </div>
      <section className="panel transactions-panel">
        <div className="panel-heading"><div><p className="eyebrow">HISTORIQUE</p><h2>Dernières transactions</h2></div><button type="button" className="button button-quiet"><Filter size={15} /> Filtrer</button></div>
        <div className="transaction-table">
          <div className="transaction-head"><span>TRANSACTION</span><span>DATE</span><span>STATUT</span><span>MONTANT</span></div>
          {transactions.map((transaction) => {
            const TransactionIcon: LucideIcon = transaction.icon;
            return <div className="transaction-row" key={transaction.name}><div className="transaction-name"><span className={`activity-icon ${transaction.tone}`}><TransactionIcon size={16} /></span><div><strong>{transaction.name}</strong><small>{transaction.copy}</small></div></div><span>{transaction.date}</span><span className="status-complete"><Check size={13} /> Terminée</span><strong className={transaction.positive ? "positive" : "negative"}>{transaction.amount}</strong></div>;
          })}
        </div>
      </section>
    </div>
  );
}

function AnalyticsView() {
  const bars = [42, 56, 48, 74, 61, 78, 92, 68, 84, 72, 88, 100];
  return (
    <div className="view-stack"><div className="analytics-summary"><div><p className="eyebrow">PERFORMANCE GLOBALE</p><h2>Votre activité prend de l'ampleur.</h2><p>Vous avez créé 24 % plus de connexions utiles que le mois dernier.</p></div><div className="analytics-score"><span>INDICE ORION</span><strong>84</strong><small>Très bon rythme</small></div></div><div className="analytics-grid"><section className="panel chart-panel"><div className="panel-heading"><div><p className="eyebrow">VUE SUR 12 MOIS</p><h2>Valeur créée</h2></div><button type="button" className="sort-button">2026 <ChevronDown size={14} /></button></div><div className="chart-area"><div className="chart-y-labels"><span>8k</span><span>6k</span><span>4k</span><span>2k</span><span>0</span></div><div className="chart-plot"><div className="chart-grid-lines"><span /><span /><span /><span /><span /></div><svg viewBox="0 0 700 240" preserveAspectRatio="none" className="chart-svg"><defs><linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#8a1538" stopOpacity="0.24" /><stop offset="1" stopColor="#8a1538" stopOpacity="0" /></linearGradient></defs><path d="M0 210 C34 196 48 182 82 190 C120 199 127 166 164 172 C202 178 207 153 246 160 C282 166 294 127 326 137 C360 147 367 119 402 126 C437 132 449 104 482 112 C520 120 529 74 565 83 C596 91 613 55 642 63 C666 68 680 39 700 30 L700 240 L0 240 Z" fill="url(#chartGradient)" /><path d="M0 210 C34 196 48 182 82 190 C120 199 127 166 164 172 C202 178 207 153 246 160 C282 166 294 127 326 137 C360 147 367 119 402 126 C437 132 449 104 482 112 C520 120 529 74 565 83 C596 91 613 55 642 63 C666 68 680 39 700 30" fill="none" stroke="#8a1538" strokeWidth="3" strokeLinecap="round" /></svg><div className="chart-bars">{bars.map((bar, index) => <span key={index} style={{ height: `${bar}%` }} className={index === bars.length - 1 ? "is-current" : ""} />)}</div><div className="chart-months">{["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"].map((month) => <span key={month}>{month}</span>)}</div></div></div></section><section className="panel insight-panel"><div className="panel-heading"><div><p className="eyebrow">INSIGHTS</p><h2>À retenir</h2></div><Sparkles size={18} className="insight-spark" /></div><div className="insight-list"><div className="insight-item"><span className="insight-number">01</span><div><strong>Vos messages convertissent</strong><p>Les échanges avec votre réseau génèrent 38 % de vos projets.</p></div></div><div className="insight-item"><span className="insight-number">02</span><div><strong>Le jeudi est votre jour fort</strong><p>Votre activité est 2,4× plus élevée en fin de semaine.</p></div></div><div className="insight-item"><span className="insight-number">03</span><div><strong>Un profil à mettre à jour</strong><p>Ajoutez deux références pour augmenter votre visibilité.</p></div></div></div><button type="button" className="insight-cta">Optimiser mon profil <ArrowUpRight size={15} /></button></section></div></div>
  );
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useOrion();
  const [activeSection, setActiveSection] = useState<Section>(() => sectionFromPath(location.pathname));
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string>("marie");
  const [draft, setDraft] = useState<string>("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const role: UserRole = session?.role ?? "UTILISATEUR";
  const managementPage = getManagementPageCopy(location.pathname, role);
  const title: string = managementPage?.title ?? sectionTitles[activeSection].title;

  useEffect(() => {
    let isMounted = true;

    if (!session?.token) {
      setConversations([]);
      return () => { isMounted = false; };
    }

    Promise.all([getDiscussions(session.token), getMessages(session.token)])
      .then(([response, backendMessages]) => {
        if (!isMounted) return;
        const mapped: Conversation[] = response.map((discussion: DiscussionRecord, index: number) => ({
          id: String(discussion.id),
          name: discussion.titre ?? `Discussion ${discussion.id}`,
          role: discussion.statut ?? "Partenaire Orion",
          initials: (discussion.titre ?? `D${discussion.id}`).slice(0, 2).toUpperCase(),
          avatarClass: ["avatar-rose", "avatar-sand", "avatar-lilac", "avatar-blue"][index % 4],
          preview: discussion.lastMessage ?? "Nouvelle discussion",
          time: discussion.lastMessageDate ? new Date(discussion.lastMessageDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "À l'instant",
          unread: 0,
          online: index % 2 === 0,
          messages: backendMessages
            .filter((message: MessageRecord) => message.discussionId === discussion.id)
            .sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime())
            .map((message): ChatMessage => ({
              id: String(message.id),
              text: message.deleted ? "Message supprimé" : message.contenu,
              time: message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
              sender: message.senderId === session.userId ? "me" : "them",
            })),
        }));
        setConversations(mapped);
        setSelectedConversationId((current) => mapped.some((item) => item.id === current) ? current : mapped[0]?.id ?? "");
      })
      .catch(() => { if (isMounted) setConversations([]); });

    return () => { isMounted = false; };
  }, [session?.token, session?.userId]);

  useEffect(() => { setActiveSection(sectionFromPath(location.pathname)); }, [location.pathname]);

  const unreadCount: number = useMemo(() => conversations.reduce((total, conversation) => total + conversation.unread, 0), [conversations]);
  const handleNavigate = (section: Section): void => { setNotificationsOpen(false); navigate(dashboardPathForSection(section)); };
  const handleRoute = (path: string): void => { setNotificationsOpen(false); navigate(path); };
  const handleOpenConversation = (id: string): void => { setSelectedConversationId(id); setConversations((current) => current.map((conversation) => conversation.id === id ? { ...conversation, unread: 0 } : conversation)); navigate("/dashboard/messages"); };
  const handleSendMessage = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const messageText: string = draft.trim();
    if (!messageText) return;

    const conversationId = Number(selectedConversationId);
    if (!session?.token || !session.userId || Number.isNaN(conversationId)) return;

    try {
      const sent = await createMessage({
        discussionId: conversationId,
        senderId: session.userId,
        contenu: messageText,
        type: "text",
        statut: "sent",
      }, session.token);

      const sentMessage: ChatMessage = { id: String(sent.id), text: sent.contenu, time: sent.createdAt ? new Date(sent.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "À l'instant", sender: "me" };
      setConversations((current) => current.map((conversation) => conversation.id === selectedConversationId ? { ...conversation, preview: sentMessage.text, time: sentMessage.time, messages: [...conversation.messages, sentMessage] } : conversation));
      setDraft("");
    } catch {
      // Preserve the draft when the backend rejects the message.
    }
  };

  return <div className="app-frame"><Sidebar activeSection={activeSection} pathname={location.pathname} role={role} onRoute={handleRoute} /><main className="main-shell"><TopBar title={title} session={session} onNavigate={handleRoute} onNotificationToggle={() => setNotificationsOpen((open) => !open)} notificationsOpen={notificationsOpen} /><div className="main-content"><PageHeader section={activeSection} onSectionChange={handleNavigate} pageCopy={managementPage} />{managementPage ? <DashboardRouteView pathname={location.pathname} role={role} /> : null}{!managementPage && activeSection === "home" ? <HomeView conversations={conversations} onNavigate={handleNavigate} onOpenConversation={handleOpenConversation} role={role} /> : null}{!managementPage && activeSection === "marketplace" ? <MarketplaceView onNavigate={handleNavigate} /> : null}{!managementPage && activeSection === "opportunities" ? <OpportunitiesView onNavigate={handleNavigate} /> : null}{!managementPage && activeSection === "messages" ? <MessagesView conversations={conversations} selectedConversationId={selectedConversationId} onSelectConversation={(id) => { setSelectedConversationId(id); setConversations((current) => current.map((conversation) => conversation.id === id ? { ...conversation, unread: 0 } : conversation)); }} onSendMessage={handleSendMessage} draft={draft} onDraftChange={setDraft} /> : null}{!managementPage && activeSection === "wallet" ? <WalletView /> : null}{!managementPage && activeSection === "analytics" ? <AnalyticsView /> : null}</div><footer className="main-footer"><span>© 2026 Orion</span><span className="footer-center">Fait pour les personnes qui font avancer les choses.</span><span className="footer-links"><a href="#privacy">Confidentialité</a><a href="#terms">Conditions</a></span></footer></main>{unreadCount === 0 ? null : <span className="sr-only">{unreadCount} messages non lus</span>}</div>;
}

const Index = () => <AppContent />;

export default Index;

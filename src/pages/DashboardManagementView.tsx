import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  CreditCard,
  Edit3,
  Eye,
  ImagePlus,
  Landmark,
  MapPin,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Star,
  Store,
  Trash2,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { catalogProducts, formatCfa, opportunityCatalog, roleLabel, useOrion, type UserRole } from "../OrionContext";
import { createProduct, getProductsByOwner, type ProductRecord } from "../lib/catalog-service";
import { apiRequest } from "../lib/api";
import { createMission, getMissionById, getMissionCandidates, getMissions, getMyMissions, startMissionPublicationPayment, updateMission, updateMissionCandidateStatus, type MissionCandidate, type MissionRecord } from "../lib/mission-service";
import { createStore, getMyStores, type StoreRecord as BackendStoreRecord } from "../lib/store-service";
import { getUploadUrl } from "../lib/api";
import { getCurrentUser, updateUser, type AuthUser } from "../lib/auth-service";

type ManagementProps = { pathname: string; role: UserRole };

type StoreRecord = { id: string; name: string; category: string; description?: string; location: string; logo?: string; products: number; revenue: string; status: string; color: string };
type WithdrawalMethod = { id: string; type: string; label: string; detail: string; status: string };

const withdrawalMethods: WithdrawalMethod[] = [
  { id: "wave-ci", type: "Mobile Money", label: "Wave Côte d'Ivoire", detail: "+225 07 08 24 18 40", status: "Principal" },
  { id: "bank-ci", type: "Compte bancaire", label: "NSIA Banque · •••• 4812", detail: "Abidjan, Côte d'Ivoire", status: "Vérifié" },
];

function ManagementHeading({ eyebrow, title, description, action, onAction, actionDisabled = false }: { eyebrow: string; title: string; description: string; action?: string; onAction?: () => void; actionDisabled?: boolean }) {
  return <div className="management-heading"><div><span className="public-kicker">{eyebrow}</span><h2>{title}</h2><p>{description}</p></div>{action && onAction ? <button type="button" className="button button-dark" onClick={onAction} disabled={actionDisabled}><Plus size={15} /> {action}</button> : null}</div>;
}

function BackButton({ label = "Retour" }: { label?: string }) {
  const navigate = useNavigate();
  return <button type="button" className="back-link dashboard-back-link" onClick={() => navigate(-1)}><ChevronLeft size={15} /> {label}</button>;
}

function ManagementTable({ children }: { children: React.ReactNode }) {
  return <div className="management-table">{children}</div>;
}

function StoresView() {
  const navigate = useNavigate();
  const { session } = useOrion();
  const [stores, setStores] = useState<StoreRecord[]>([]);
  const [loadError, setLoadError] = useState<string>("");

  useEffect(() => {
    if (!session?.token) return;
    let isMounted = true;
    getMyStores(session.token)
      .then((response: BackendStoreRecord[]) => {
        if (!isMounted) return;
        setStores(response.map((store) => ({
          id: String(store.id),
          name: store.nom,
          category: store.category ?? "Boutique",
          description: store.description,
          location: store.location ?? "Afrique",
          logo: store.logo ? getUploadUrl(store.logo) : undefined,
          products: store.nombreProduits ?? 0,
          revenue: "—",
          status: store.active ? "Active" : "Inactive",
          color: Number(store.id) % 2 === 0 ? "store-card-gold" : "store-card-coral",
        })));
      })
      .catch((error: unknown) => { if (isMounted) setLoadError(error instanceof Error ? error.message : "Impossible de charger vos boutiques."); });
    return () => { isMounted = false; };
  }, [session?.token]);

  const limitReached = stores.length >= 1;
  return <div className="management-view"><ManagementHeading eyebrow="COMMERCE" title="Mes boutiques" description="Chaque compte commerçant peut gérer une seule boutique." action={limitReached ? "Limite d’une boutique atteinte" : "Ajouter une boutique"} actionDisabled={limitReached} onAction={() => navigate("/dashboard/stores/add")} />{loadError ? <p className="auth-error">{loadError}</p> : stores.length === 0 ? <div className="store-list-empty"><Store size={22} /><p>Vous n’avez pas encore créé de boutique.</p></div> : <div className="store-management-grid">{stores.map((store) => <article className="store-management-card" key={store.id}><div className={`store-management-art ${store.color}`}>{store.logo ? <img src={store.logo} alt={`Logo de ${store.name}`} /> : <Store size={29} />}<button type="button" aria-label={`Modifier ${store.name}`} onClick={() => navigate(`/dashboard/stores/edit/${store.id}`)}><Edit3 size={15} /></button></div><div className="store-management-copy"><div><span className={`status-pill ${store.status === "Active" ? "status-green" : "status-gold"}`}><Check size={12} /> {store.status}</span><h3>{store.name}</h3><p>{store.category}</p>{store.description ? <p className="store-management-description">{store.description}</p> : null}<span><MapPin size={13} /> {store.location}</span></div><div className="store-management-stats"><span><strong>{store.products}</strong> produits</span><span><strong>{store.revenue}</strong></span></div></div><button type="button" className="store-manage-link" onClick={() => navigate("/dashboard/products")}>Gérer la boutique <ArrowRight size={15} /></button></article>)}</div>}</div>;
}
function StoreFormView({ edit = false }: { edit?: boolean }) {
  const navigate = useNavigate();
  const { session } = useOrion();
  const [saved, setSaved] = useState<boolean>(false);
  const [form, setForm] = useState({ nom: "", category: "Mode & accessoires", description: "", location: "" });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const updateField = (key: keyof typeof form, value: string): void => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    if (!logoFile) { setLogoPreview(""); return; }
    const previewUrl = URL.createObjectURL(logoFile);
    setLogoPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [logoFile]);

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    try {
      if (!session?.token) throw new Error("Vous devez vous reconnecter avant de créer une boutique.");
      await createStore({ nom: form.nom, category: form.category, description: form.description, location: form.location, logo: logoFile ?? undefined, active: true }, session.token);
      setSaved(true);
      setTimeout(() => navigate("/dashboard/stores"), 500);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de créer cette boutique.";
      window.alert(message);
    }
  };

  return <div className="management-view narrow-management-view"><BackButton label="Mes boutiques" /><ManagementHeading eyebrow={edit ? "MODIFIER UNE BOUTIQUE" : "NOUVEL ESPACE DE VENTE"} title={edit ? "Modifier la boutique" : "Créer une boutique"} description="Présentez votre activité avec une identité claire et accueillante." /><form className="management-form" onSubmit={submit}><div className="form-card"><div className="form-card-heading"><span className="form-card-icon"><Store size={18} /></span><div><h3>Informations principales</h3><p>Ces informations seront visibles par vos clients.</p></div></div><div className="form-grid"><label>Nom de la boutique<input required value={form.nom} onChange={(event) => updateField("nom", event.target.value)} placeholder="Ex. Atelier Naya" /></label><label>Catégorie<select value={form.category} onChange={(event) => updateField("category", event.target.value)}><option>Mode & accessoires</option><option>Maison</option><option>Beauté naturelle</option><option>Épicerie</option><option>Services</option></select></label><label className="form-full">Description<textarea required value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Racontez ce que vous proposez..." /></label><label>Localisation<input required value={form.location} onChange={(event) => updateField("location", event.target.value)} placeholder="Ville, pays" /></label><label className="store-logo-upload form-full">Logo ou image de la boutique<span className="store-logo-upload-control">{logoPreview ? <img src={logoPreview} alt="Aperçu du logo de la boutique" /> : <span className="store-logo-upload-placeholder"><ImagePlus size={22} /><span>Choisir une image</span></span>}<input type="file" accept="image/*" onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)} /><span className="store-logo-upload-hint">JPG, PNG ou WebP</span></span></label></div></div><div className="management-form-actions"><button type="button" className="button button-quiet" onClick={() => navigate(-1)}>Annuler</button><button type="submit" className="button button-dark">{saved ? <><Check size={15} /> Enregistrée</> : <>{edit ? "Enregistrer les modifications" : "Créer la boutique"} <ArrowRight size={15} /></>}</button></div></form></div>;
}
function ProductsView() {
  const navigate = useNavigate();
  const { session } = useOrion();
  const [query, setQuery] = useState<string>("");
  const [products, setProducts] = useState<ProductRecord[]>([]);

  useEffect(() => {
    let isMounted = true;

    if (!session?.token || !session.userId) { setProducts([]); return () => { isMounted = false; }; }
    getProductsByOwner(Number(session.userId), session.token)
      .then((response) => {
        if (!isMounted) return;
        setProducts(response);
      })
      .catch(() => { if (isMounted) setProducts([]); });

    return () => {
      isMounted = false;
    };
  }, [session?.token, session?.userId]);

  const filtered = products.filter((product) => `${product.nom} ${product.categorie ?? ""}`.toLowerCase().includes(query.toLowerCase()));

  return <div className="management-view"><ManagementHeading eyebrow="CATALOGUE" title="Mes produits" description={`Forfait Standard : ${products.length}/40 produits dans votre boutique.`} action={products.length >= 40 ? "Limite de 40 produits atteinte" : "Ajouter un produit"} actionDisabled={products.length >= 40} onAction={() => navigate("/dashboard/products/add")} /><div className="management-toolbar"><div className="public-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher dans mes produits" /></div><button type="button" className="button button-quiet"><Settings2 size={15} /> Filtres</button></div><ManagementTable><div className="management-table-head"><span>PRODUIT</span><span>CATÉGORIE</span><span>STOCK</span><span>PRIX</span><span>STATUT</span><span /></div>{filtered.map((product) => <div className="management-table-row" key={product.id}><div className="management-product-cell"><img src={getUploadUrl(product.image) || "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=88"} alt="" /><div><strong>{product.nom}</strong><small>{product.statut ?? "Boutique Orion"}</small></div></div><span>{product.categorie ?? "Divers"}</span><span className={Number(product.stock) < 10 ? "table-warning" : ""}>{Number(product.stock)} unités</span><strong>{formatCfa(Number(product.prix ?? 0))}</strong><span className="status-pill status-green"><Check size={12} /> En ligne</span><div className="table-actions"><button type="button" onClick={() => navigate(`/dashboard/products/${product.id}`)} aria-label="Voir"><Eye size={15} /></button><button type="button" onClick={() => navigate(`/dashboard/products/edit/${product.id}`)} aria-label="Modifier"><Pencil size={15} /></button></div></div>)}</ManagementTable></div>;
}

function ProductFormView({ edit = false }: { edit?: boolean }) {
  const navigate = useNavigate();
  const { session } = useOrion();
  const [saved, setSaved] = useState<boolean>(false);
  const [form, setForm] = useState({
    nom: "",
    categorie: "Mode",
    description: "",
    prix: "",
    stock: "",
    image: "",
  });

  const product = catalogProducts[0];

  const updateField = (key: keyof typeof form, value: string): void => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    try {
      if (!session?.token) throw new Error("Connectez-vous avec votre compte commerçant pour créer un produit.");
      await createProduct({
        nom: form.nom || product.name,
        categorie: form.categorie,
        description: form.description || product.description,
        prix: Number(form.prix || product.price),
        stock: Number(form.stock || product.stock),
        statut: "Disponible",
        image: form.image || product.image,
      }, session.token);
      setSaved(true);
      setTimeout(() => navigate("/dashboard/products"), 500);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de publier ce produit.";
      window.alert(message);
    }
  };

  return <div className="management-view narrow-management-view"><BackButton label="Mes produits" /><ManagementHeading eyebrow={edit ? "MODIFIER LE PRODUIT" : "NOUVEAU PRODUIT"} title={edit ? "Modifier le produit" : "Ajouter un produit"} description="Donnez aux clients les bonnes informations pour choisir avec confiance." /><form className="management-form" onSubmit={submit}><div className="form-card"><div className="form-card-heading"><span className="form-card-icon"><Package size={18} /></span><div><h3>Détails du produit</h3><p>Une fiche claire améliore la découverte et la conversion.</p></div></div><div className="form-grid"><label>Nom du produit<input required value={form.nom || (edit ? product.name : "")} onChange={(event) => updateField("nom", event.target.value)} placeholder="Ex. Tote Kente Héritage" /></label><label>Catégorie<select value={form.categorie || (edit ? product.category : "Mode")} onChange={(event) => updateField("categorie", event.target.value)}><option>Mode</option><option>Maison</option><option>Beauté</option><option>Édition</option><option>Épicerie</option></select></label><label className="form-full">Description<textarea required value={form.description || (edit ? product.description : "")} onChange={(event) => updateField("description", event.target.value)} placeholder="Décrivez la matière, l'usage et l'histoire du produit..." /></label><label>Prix (FCFA)<input required type="number" value={form.prix || (edit ? String(product.price) : "")} onChange={(event) => updateField("prix", event.target.value)} placeholder="18500" /></label><label>Stock disponible<input required type="number" value={form.stock || (edit ? String(product.stock) : "")} onChange={(event) => updateField("stock", event.target.value)} placeholder="20" /></label><label className="form-full">Image principale<div className="upload-zone"><ImagePlus size={22} /><span>Glissez une image ou ajoutez une URL</span><input type="url" value={form.image || (edit ? product.image : "")} onChange={(event) => updateField("image", event.target.value)} placeholder="https://..." /></div></label></div></div><div className="management-form-actions"><button type="button" className="button button-quiet" onClick={() => navigate(-1)}>Annuler</button><button type="submit" className="button button-dark">{saved ? <><Check size={15} /> Enregistré</> : <>{edit ? "Enregistrer le produit" : "Publier le produit"} <ArrowRight size={15} /></>}</button></div></form></div>;
}

function ProductManagementDetail() {
  const navigate = useNavigate();
  const product = catalogProducts[0];
  return <div className="management-view"><BackButton label="Mes produits" /><div className="management-detail-hero"><img src={product.image} alt="" /><div><span className="status-pill status-green"><Check size={12} /> En ligne</span><span className="public-kicker">{product.category}</span><h2>{product.name}</h2><p>{product.description}</p><div className="management-detail-price">{formatCfa(product.price)} <small>· {product.stock} en stock</small></div><div className="management-detail-actions"><button type="button" className="button button-dark" onClick={() => navigate(`/dashboard/products/edit/${product.id}`)}><Pencil size={15} /> Modifier</button><button type="button" className="button button-quiet"><Trash2 size={15} /> Supprimer</button></div></div></div><div className="management-kpi-grid"><div className="management-kpi"><TrendingUp size={18} /><span>Vues produit</span><strong>2 840</strong><small>+18,4% ce mois</small></div><div className="management-kpi"><Package size={18} /><span>Commandes</span><strong>48</strong><small>+12 depuis le mois dernier</small></div><div className="management-kpi"><Star size={18} /><span>Note moyenne</span><strong>4,9 / 5</strong><small>24 avis vérifiés</small></div></div></div>;
}

function OpportunityManagementView() {
  const navigate = useNavigate();
  const { session } = useOrion();
  const [opportunities, setOpportunities] = useState<typeof opportunityCatalog>([]);
  const [loadError, setLoadError] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    if (!session?.token) { setOpportunities([]); return () => { isMounted = false; }; }
    getMyMissions(session.token)
      .then((response) => {
        if (!isMounted) return;
        const mapped = response.map((mission: MissionRecord) => ({
          id: String(mission.id),
          title: mission.titre,
          company: "Boutique Orion",
          type: mission.type ?? "Mission rémunérée",
          location: mission.localisation ?? "Afrique",
          amount: `${Number(mission.montant ?? 0).toLocaleString("fr-FR")} FCFA`,
          duration: mission.dureeMission ? `${mission.dureeMission} mois` : "Flexible",
          description: mission.description ?? mission.descriptionCourte ?? "Mission disponible",
          statut: mission.statut ?? "brouillon",
          accent: "gold",
        }));
        setOpportunities(mapped);
      })
      .catch((error: unknown) => { if (isMounted) setLoadError(error instanceof Error ? error.message : "Impossible de charger vos opportunités."); });
    return () => {
      isMounted = false;
    };
  }, [session?.token]);

  return <div className="management-view">
      <ManagementHeading eyebrow="OPPORTUNITÉS PUBLIÉES" title="Mes opportunités" description="Une mission est publiée après confirmation des frais FedaPay de 500 FCFA." action="Créer une opportunité" onAction={() => navigate("/dashboard/opportunities/create")} />{loadError ? <p className="auth-error">{loadError}</p> : opportunities.length === 0 ? <div className="store-list-empty"><BriefcaseBusiness size={22} /><p>Vous n’avez pas encore créé d’opportunité.</p></div> : <div className="management-opportunity-list">{opportunities.map((opportunity) => <article className="management-opportunity-row" key={opportunity.id}><div className="management-opportunity-placeholder"><BriefcaseBusiness size={25} strokeWidth={1.25} /></div><div><span className={`public-opportunity-tag tag-${opportunity.accent}`}>{opportunity.type}</span><h3>{opportunity.title}</h3><p><MapPin size={13} /> {opportunity.location} · <strong>{opportunity.amount}</strong></p></div><span className={`status-pill ${opportunity.statut === 'ouverte' ? 'status-green' : ''}`}>{opportunity.statut === 'ouverte' ? 'Publiée' : 'Brouillon · paiement requis'}</span>{opportunity.statut !== 'ouverte' ? <button type="button" className="button button-dark" onClick={async () => { if (!session?.token) return; try { const payment = await startMissionPublicationPayment(Number(opportunity.id), session.token); window.location.assign(payment.payment_url); } catch (error) { window.alert(error instanceof Error ? error.message : 'Impossible de démarrer le paiement.'); } }}>Payer 500 FCFA</button> : null}<div className="table-actions"><button type="button" aria-label={`Voir les candidatures pour ${opportunity.title}`} onClick={() => navigate(`/dashboard/opportunities/${opportunity.id}`)}><Eye size={15} /></button><button type="button" onClick={() => navigate(`/dashboard/opportunities/edit/${opportunity.id}`)}><Pencil size={15} /></button></div></article>)}</div>}</div>;
}

function EntrepreneurOpportunitiesView() {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<typeof opportunityCatalog>(opportunityCatalog);

  useEffect(() => {
    let isMounted = true;
    getMissions().then((response) => {
      if (!isMounted || response.length === 0) return;
      const mapped = response.map((mission: MissionRecord) => ({
        id: String(mission.id),
        title: mission.titre,
        company: "Boutique Orion",
        type: mission.type ?? "Mission rémunérée",
        location: mission.localisation ?? "Afrique",
        amount: `${Number(mission.montant ?? 0).toLocaleString("fr-FR")} FCFA`,
        duration: mission.dureeMission ? `${mission.dureeMission} mois` : "Flexible",
        description: mission.description ?? mission.descriptionCourte ?? "Mission disponible",
        accent: "gold",
      }));
      setOpportunities(mapped);
    }).catch(() => undefined);
    return () => { isMounted = false; };
  }, []);

  return <div className="management-view"><ManagementHeading eyebrow="FAIRE GRANDIR VOTRE ACTIVITÉ" title="Opportunités" description="Trouvez des missions et des entreprises qui correspondent à votre énergie." /><div className="opportunity-dashboard-intro"><div><span className="public-kicker">VOTRE PARCOURS</span><h3>Continuez à faire<br /><em>avancer les choses.</em></h3><p>Vous suivez 8 candidatures et 2 entreprises ont consulté votre profil cette semaine.</p></div><div className="opportunity-dashboard-score"><strong>84</strong><span>indice Orion</span></div></div><div className="public-opportunities-grid dashboard-opportunity-grid">{opportunities.map((opportunity) => <article className="public-opportunity-card" key={opportunity.id}><Link to={`/opportunities/${opportunity.id}`} className="public-opportunity-placeholder"><BriefcaseBusiness size={42} strokeWidth={1.25} /><span className={`public-opportunity-tag tag-${opportunity.accent}`}>{opportunity.type}</span></Link><div className="public-opportunity-body"><div className="opportunity-company"><span className="company-avatar">{opportunity.company.slice(0, 1)}</span><span>{opportunity.company}</span></div><h3>{opportunity.title}</h3><div className="public-opportunity-meta"><span><MapPin size={14} /> {opportunity.location}</span><button type="button" className="button button-dark" onClick={() => navigate(`/opportunities/${opportunity.id}`)}>Voir la mission</button></div></div></article>)}</div></div>;
}

function OpportunityFormView({ edit = false }: { edit?: boolean }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { session } = useOrion();
  const [saved, setSaved] = useState<boolean>(false);
  const [existingMission, setExistingMission] = useState<MissionRecord | null>(null);
  const [loadError, setLoadError] = useState("");
  const opportunity = opportunityCatalog[0];
  const [form, setForm] = useState({
    titre: "",
    type: "Mission rémunérée",
    localisation: "",
    description: "",
    montant: "",
    dureeMission: "",
    requis: "",
  });

  useEffect(() => {
    if (!edit || !id || !session?.token) return;
    getMissionById(Number(id), session.token)
      .then((mission) => {
        setExistingMission(mission);
        setForm({
          titre: mission.titre,
          type: mission.type ?? "Mission rémunérée",
          localisation: mission.localisation ?? "",
          description: mission.description ?? "",
          montant: String(mission.montant ?? ""),
          dureeMission: String(mission.dureeMission ?? 1),
          requis: mission.requis ?? "",
        });
      })
      .catch((error: unknown) => setLoadError(error instanceof Error ? error.message : "Impossible de charger cette mission."));
  }, [edit, id, session?.token]);

  const updateField = (key: keyof typeof form, value: string): void => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    try {
      if (!session?.token) throw new Error("Vous devez vous reconnecter pour publier une opportunité.");
      const payload = {
        titre: form.titre || opportunity.title,
        type: form.type,
        localisation: form.localisation || opportunity.location,
        description: form.description || opportunity.description,
        descriptionCourte: (form.description || opportunity.description).slice(0, 180),
        montant: Number(form.montant || opportunity.amount.replace(/\D/g, "") || 0),
        frequencePaiement: "fixe",
        dureeMission: Number(form.dureeMission || 1),
        datePublication: new Date().toISOString(),
        dateLimiteCandidature: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
        requis: form.requis || "Expérience confirmée",
      };
      let created: MissionRecord;
      if (edit && id) {
        created = await updateMission(Number(id), payload, session.token);
      } else {
        created = await createMission(payload, session.token);
      }
      setSaved(true);
      if (created.publicationPayee === false) {
        const payment = await startMissionPublicationPayment(created.id, session.token);
        window.location.assign(payment.payment_url);
        return;
      }
      navigate("/dashboard/opportunities");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de publier cette opportunité.";
      window.alert(message);
    }
  };

  return <div className="management-view narrow-management-view"><BackButton label="Mes opportunités" /><ManagementHeading eyebrow={edit ? "MODIFIER L'OPPORTUNITÉ" : "NOUVELLE OPPORTUNITÉ"} title={edit ? "Modifier l'opportunité" : "Créer une opportunité"} description={edit && existingMission?.publicationPayee ? "Modifiez les informations de votre mission publiée." : "La mission reste en brouillon jusqu’à la confirmation FedaPay de 500 FCFA."} />{loadError ? <p className="auth-error">{loadError}</p> : null}<form className="management-form" onSubmit={submit}><div className="form-card"><div className="form-card-heading"><span className="form-card-icon"><BriefcaseBusiness size={18} /></span><div><h3>Brief de la mission</h3><p>Décrivez le projet et les conditions de collaboration.</p></div></div><div className="form-grid"><label className="form-full">Titre de l'opportunité<input required value={form.titre} onChange={(event) => updateField("titre", event.target.value)} placeholder="Ex. Photographe produit pour..." /></label><label>Type<select value={form.type} onChange={(event) => updateField("type", event.target.value)}><option>Mission rémunérée</option><option>Collaboration</option><option>Service</option><option>Projet court</option><option>Formation</option></select></label><label>Localisation<input required value={form.localisation} onChange={(event) => updateField("localisation", event.target.value)} placeholder="Ville · À distance" /></label><label>Description<textarea required className="form-textarea-tall" value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Quel est le contexte, le besoin et le résultat attendu ?" /></label><label>Montant / rémunération<input required value={form.montant} onChange={(event) => updateField("montant", event.target.value)} placeholder="Ex. 250000" /></label><label>Durée (mois)<input required value={form.dureeMission} onChange={(event) => updateField("dureeMission", event.target.value)} placeholder="Ex. 2" /></label><label>Prérequis<input value={form.requis} onChange={(event) => updateField("requis", event.target.value)} placeholder="Ex. 2 ans d'expérience, portfolio..." /></label></div></div><div className="management-form-actions"><button type="button" className="button button-quiet" onClick={() => navigate(-1)}>Annuler</button><button type="submit" className="button button-dark">{saved ? "Ouverture de FedaPay…" : edit ? existingMission?.publicationPayee ? "Enregistrer les modifications" : "Enregistrer et payer 500 FCFA" : <>Créer et payer 500 FCFA <ArrowRight size={15} /></>}</button></div></form></div>;
}

function OpportunityManagementDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { session } = useOrion();
  const [mission, setMission] = useState<MissionRecord | null>(null);
  const [candidates, setCandidates] = useState<MissionCandidate[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!id || !session?.token) { setLoading(false); return () => { isMounted = false; }; }
    setLoading(true);
    Promise.all([getMissionById(Number(id), session.token), getMissionCandidates(Number(id), session.token)])
      .then(([missionRecord, applicantRecords]) => {
        if (!isMounted) return;
        setMission(missionRecord);
        setCandidates(applicantRecords);
        setError("");
      })
      .catch((loadError: unknown) => { if (isMounted) setError(loadError instanceof Error ? loadError.message : "Impossible de charger les candidatures."); })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [id, session?.token]);

  const changeCandidateStatus = async (candidate: MissionCandidate, statut: "acceptee" | "refusee"): Promise<void> => {
    if (!id || !session?.token) return;
    setUpdatingUserId(candidate.userId);
    setError("");
    try {
      await updateMissionCandidateStatus(Number(id), candidate.userId, statut, session.token);
      setCandidates((current) => current.map((item) => item.userId === candidate.userId ? { ...item, statut } : item));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Impossible de mettre à jour cette candidature.");
    } finally { setUpdatingUserId(null); }
  };

  if (loading) return <div className="management-view"><BackButton label="Mes opportunités" /><p>Chargement de l’opportunité et des candidatures…</p></div>;
  if (!mission) return <div className="management-view"><BackButton label="Mes opportunités" /><ManagementHeading eyebrow="CANDIDATURES" title="Opportunité introuvable" description={error || "Cette opportunité ne vous appartient pas ou n’existe plus."} /></div>;

  return <div className="management-view"><BackButton label="Mes opportunités" /><div className="management-opportunity-detail"><div className="management-opportunity-detail-placeholder"><BriefcaseBusiness size={54} strokeWidth={1.15} /></div><div><span className="public-opportunity-tag tag-gold">{mission.type ?? "Opportunité"}</span><h2>{mission.titre}</h2><p>{mission.description}</p><div className="opportunity-detail-facts"><span><MapPin size={15} /> {mission.localisation}</span><span><Banknote size={15} /> {Number(mission.montant ?? 0).toLocaleString("fr-FR")} FCFA</span><span><Package size={15} /> {mission.dureeMission ?? "Flexible"} mois</span></div><button type="button" className="button button-dark" onClick={() => navigate(`/dashboard/opportunities/edit/${mission.id}`)}><Pencil size={15} /> Modifier l'opportunité</button></div></div><section className="candidate-panel"><div className="panel-heading"><div><span className="public-kicker">CANDIDATURES</span><h2>Profils intéressés</h2></div><span className="candidate-count">{candidates.length} candidature{candidates.length === 1 ? "" : "s"}</span></div>{error ? <p className="auth-error">{error}</p> : null}{candidates.length === 0 ? <div className="store-list-empty"><BriefcaseBusiness size={22} /><p>Aucune candidature pour le moment.</p></div> : candidates.map((candidate) => {
    const firstName = candidate.candidat?.prenom ?? "";
    const lastName = candidate.candidat?.nom ?? "";
    const name = `${firstName} ${lastName}`.trim() || `Candidat #${candidate.userId}`;
    const initials = name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
    const statusLabel = candidate.statut === "acceptee" ? "Acceptée" : candidate.statut === "refusee" ? "Refusée" : "En attente";
    return <div className="candidate-row" key={candidate.userId}><span className="avatar avatar-default avatar-rose">{initials}</span><div><strong>{name}</strong><span>{candidate.candidat?.specialite || candidate.candidat?.email || "Profil Orion"}</span>{candidate.message ? <small>{candidate.message}</small> : null}</div><span className="candidate-time">{new Date(candidate.dateCandidature).toLocaleDateString("fr-FR")}</span><span className={`status-pill ${candidate.statut === "acceptee" ? "status-green" : candidate.statut === "refusee" ? "status-gold" : ""}`}>{statusLabel}</span>{candidate.statut === "en_attente" ? <><button type="button" className="button button-quiet" disabled={updatingUserId !== null} onClick={() => changeCandidateStatus(candidate, "refusee")}>{updatingUserId === candidate.userId ? "Mise à jour…" : "Refuser"}</button><button type="button" className="button button-dark" disabled={updatingUserId !== null} onClick={() => changeCandidateStatus(candidate, "acceptee")}>{updatingUserId === candidate.userId ? "Mise à jour…" : "Accepter"}</button></> : null}</div>;
  })}</section></div>;
}

function SubscriptionsView() {
  const { session } = useOrion();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  useEffect(() => { if (!session?.token) return; let active = true; apiRequest<any>("/plan/current", { headers: { Authorization: `Bearer ${session.token}` } }).then((value) => { if (active) setData(value); }).catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Impossible de charger l’abonnement."); }); return () => { active = false; }; }, [session?.token]);
  const plan = data?.subscription;
  const usage = data?.usage;
  return <div className="management-view"><ManagementHeading eyebrow="OFFRE DE LANCEMENT" title="Abonnement Standard" description="Un forfait gratuit pour commencer à vendre sur Orion." />{error ? <p className="auth-error">{error}</p> : !data ? <p>Chargement de votre abonnement…</p> : <><div className="subscription-current"><div className="subscription-current-icon"><ShieldCheck size={20} /></div><div><span>VOTRE FORFAIT ACTIF</span><strong>{plan?.titre ?? "Standard"} · Gratuit</strong><p>{usage?.boutiques ?? 0}/{plan?.nombreBoutiques ?? 1} boutique · {usage?.produits ?? 0}/{plan?.nombreProduits ?? 40} produits</p></div></div><div className="plan-grid"><article className="plan-card"><span className="plan-name">Standard</span><h3>0 FCFA<small> · gratuit au lancement</small></h3><p>Les fonctions essentielles pour lancer votre boutique.</p><ul><li><Check size={14} /> 1 boutique gérable</li><li><Check size={14} /> Jusqu’à 40 produits</li><li><Check size={14} /> Forfait actif automatiquement</li></ul><span className="status-pill status-green">Forfait actuel</span></article></div></>}</div>;
}

function SubscriptionCheckoutView() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/dashboard/subscriptions", { replace: true }); }, [navigate]);
  return <div className="management-view"><p>Le forfait Standard gratuit est le seul disponible au lancement.</p></div>;
}

function SubscriptionSuccessView() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/dashboard/subscriptions", { replace: true }); }, [navigate]);
  return <div className="management-view"><p>Aucun paiement d’abonnement n’est requis pour le forfait Standard.</p></div>;
}

function WithdrawalMethodsView() {
  const navigate = useNavigate();
  return <div className="management-view"><ManagementHeading eyebrow="VOTRE ARGENT" title="Moyens de retrait" description="Gérez les comptes sur lesquels Orion vous verse vos revenus." action="Ajouter un moyen" onAction={() => navigate("/dashboard/withdrawal-methods/add")} /><div className="withdrawal-method-list">{withdrawalMethods.map((method) => <article className="withdrawal-method-card" key={method.id}><span className="withdrawal-method-icon">{method.type === "Mobile Money" ? <Banknote size={21} /> : <Landmark size={21} />}</span><div><span>{method.type}</span><strong>{method.label}</strong><p>{method.detail}</p></div><span className={`status-pill ${method.status === "Principal" ? "status-gold" : "status-green"}`}>{method.status}</span><button type="button" onClick={() => navigate(`/dashboard/withdrawal-methods/edit/${method.id}`)} aria-label={`Modifier ${method.label}`}><Pencil size={15} /></button></article>)}</div><div className="withdrawal-note"><ShieldCheck size={18} /><p>Vos données financières sont chiffrées. Orion ne stocke jamais vos codes secrets Mobile Money.</p></div></div>;
}

function WithdrawalFormView({ edit = false }: { edit?: boolean }) {
  const navigate = useNavigate();
  const [method, setMethod] = useState<string>("mobile");
  const submit = (event: FormEvent<HTMLFormElement>): void => { event.preventDefault(); navigate("/dashboard/withdrawal-methods"); };
  return <div className="management-view narrow-management-view"><BackButton label="Moyens de retrait" /><ManagementHeading eyebrow={edit ? "MODIFIER UN MOYEN" : "NOUVEAU MOYEN DE RETRAIT"} title={edit ? "Modifier le compte" : "Ajouter un compte"} description="Les revenus validés seront versés sur ce compte." /><form className="management-form" onSubmit={submit}><div className="form-card"><div className="payment-options withdrawal-type-options"><label className={method === "mobile" ? "is-active" : ""}><input type="radio" name="withdrawal" checked={method === "mobile"} onChange={() => setMethod("mobile")} /><Banknote size={19} /><span><strong>Mobile Money</strong><small>Wave, Orange, MTN, Moov</small></span></label><label className={method === "bank" ? "is-active" : ""}><input type="radio" name="withdrawal" checked={method === "bank"} onChange={() => setMethod("bank")} /><Landmark size={19} /><span><strong>Compte bancaire</strong><small>Banques locales et régionales</small></span></label></div><div className="form-grid"><label>Nom du compte<input required defaultValue={edit ? "Wave Côte d'Ivoire" : ""} placeholder="Ex. Wave Côte d'Ivoire" /></label><label>{method === "mobile" ? "Numéro de téléphone" : "Numéro de compte"}<input required defaultValue={edit ? "+225 07 08 24 18 40" : ""} placeholder={method === "mobile" ? "+225 07 00 00 00 00" : "0000000000"} /></label><label className="form-full">Nom du titulaire<input required defaultValue={edit ? "Jean Dupont" : ""} placeholder="Tel qu'indiqué sur le compte" /></label></div></div><div className="management-form-actions"><button type="button" className="button button-quiet" onClick={() => navigate(-1)}>Annuler</button><button type="submit" className="button button-dark">Enregistrer <Check size={15} /></button></div></form></div>;
}

function ProfileView() {
  const { session, updateSession, logout } = useOrion();
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!session?.token) return;
    let isMounted = true;
    getCurrentUser(session.token)
      .then((user) => {
        if (!isMounted) return;
        setProfile(user);
        updateSession({ userId: user.id, email: user.email, name: [user.prenom, user.nom].filter(Boolean).join(" "), role: user.role as UserRole, image: user.image });
      })
      .catch((reason: unknown) => {
        if (!isMounted) return;
        const message = reason instanceof Error ? reason.message : "Impossible de charger le profil.";
        setError(message);
        if (/token invalide|token.*expiré/i.test(message)) {
          logout();
          navigate("/login", { replace: true, state: { from: "/dashboard/profile" } });
        }
      })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [session?.token]);

  useEffect(() => {
    if (!photo) { setPhotoPreview(""); return; }
    const url = URL.createObjectURL(photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const updateField = <K extends keyof AuthUser>(field: K, value: AuthUser[K]): void => {
    setProfile((current) => current ? { ...current, [field]: value } : current);
  };

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!session?.token || !profile) return;
    setIsSaving(true);
    setError("");
    const payload = new FormData();
    ["prenom", "nom", "email", "contact", "date_naissance", "adresse", "role", "specialite", "localisation"].forEach((field) => {
      payload.append(field, String(profile[field as keyof AuthUser] ?? ""));
    });
    if (password) payload.append("password", password);
    if (photo) payload.append("image", photo);
    try {
      const updated = await updateUser(profile.id, payload, session.token);
      setProfile(updated);
      setPassword("");
      setPhoto(null);
      updateSession({ userId: updated.id, email: updated.email, name: [updated.prenom, updated.nom].filter(Boolean).join(" "), role: updated.role as UserRole, image: updated.image });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Impossible d'enregistrer le profil.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="management-view narrow-management-view"><ManagementHeading eyebrow="VOTRE IDENTITÉ ORION" title="Profil" description="Chargement de vos informations…" /></div>;
  if (!profile) return <div className="management-view narrow-management-view"><ManagementHeading eyebrow="VOTRE IDENTITÉ ORION" title="Profil" description="Impossible de charger vos informations." />{error ? <p className="auth-error">{error}</p> : null}</div>;

  const displayName = [profile.prenom, profile.nom].filter(Boolean).join(" ");
  const profileImage = photoPreview || (profile.image ? getUploadUrl(profile.image) : "");
  return <div className="management-view narrow-management-view">
    <ManagementHeading eyebrow="VOTRE IDENTITÉ ORION" title="Profil" description="Mettez à jour les informations enregistrées sur votre compte." />
    <div className="profile-header-card">
      <button type="button" className="profile-large-avatar profile-avatar-button" onClick={() => fileInput.current?.click()} aria-label="Choisir une photo de profil">
        {profileImage ? <img src={profileImage} alt="Photo de profil" /> : displayName.slice(0, 2).toUpperCase()}
        <span className="profile-avatar-edit"><ImagePlus size={14} /></span>
      </button>
      <input ref={fileInput} className="sr-only" type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} />
      <div><span className="public-kicker">PROFIL PERSONNEL</span><h3>{displayName || profile.email}</h3><p>{roleLabel(profile.role)} · {profile.email}</p></div>
      <button type="button" className="button button-quiet" onClick={() => fileInput.current?.click()}><ImagePlus size={15} /> Changer la photo</button>
    </div>
    <form className="management-form" onSubmit={submit}>
      <div className="form-card">
        <div className="form-card-heading"><span className="form-card-icon"><Settings2 size={18} /></span><div><h3>Informations personnelles</h3><p>Modifiez les informations associées à votre compte Orion.</p></div></div>
        <div className="form-grid">
          <label>Prénom<input required value={profile.prenom ?? ""} onChange={(event) => updateField("prenom", event.target.value)} /></label>
          <label>Nom<input required value={profile.nom ?? ""} onChange={(event) => updateField("nom", event.target.value)} /></label>
          <label>Email<input required type="email" value={profile.email} onChange={(event) => updateField("email", event.target.value)} /></label>
          <label>Téléphone<input value={profile.contact ?? ""} onChange={(event) => updateField("contact", event.target.value)} /></label>
          <label>Date de naissance<input type="date" value={profile.date_naissance?.slice(0, 10) ?? ""} onChange={(event) => updateField("date_naissance", event.target.value)} /></label>
          <label>Rôle<select value={profile.role} onChange={(event) => updateField("role", event.target.value as AuthUser["role"])}><option value="UTILISATEUR">Jeune entrepreneur</option><option value="COMMERCANT">Commerçant</option></select></label>
          <label className="form-full">Adresse<input value={profile.adresse ?? ""} onChange={(event) => updateField("adresse", event.target.value)} /></label>
          <label>Spécialité<input value={profile.specialite ?? ""} onChange={(event) => updateField("specialite", event.target.value)} /></label>
          <label>Localisation<input value={profile.localisation ?? ""} onChange={(event) => updateField("localisation", event.target.value)} /></label>
          <label className="form-full">Nouveau mot de passe<input type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Laissez vide pour le conserver" /></label>
        </div>
      </div>
      {error ? <p className="auth-error">{error}</p> : null}
      <div className="management-form-actions"><button type="submit" className="button button-dark" disabled={isSaving}>{saved ? <><Check size={15} /> Profil enregistré</> : isSaving ? "Enregistrement…" : <>Enregistrer le profil <ArrowRight size={15} /></>}</button></div>
    </form>
  </div>;
}
function InternalCheckoutView() {
  const navigate = useNavigate();
  return <div className="management-view"><BackButton label="Marketplace interne" /><ManagementHeading eyebrow="ACHAT INTERNE" title="Finaliser l'achat" description="Achetez un produit sans quitter votre espace Orion." /><div className="internal-checkout-card"><div className="checkout-order-line"><img src={catalogProducts[0].image} alt="" /><div><strong>{catalogProducts[0].name}</strong><span>{catalogProducts[0].store} · {formatCfa(catalogProducts[0].price)}</span></div></div><div className="checkout-summary-total"><span>Total</span><strong>{formatCfa(catalogProducts[0].price)}</strong></div><button type="button" className="button button-dark" onClick={() => navigate("/dashboard")}>Confirmer le paiement <ArrowRight size={15} /></button></div></div>;
}

export function DashboardRouteView({ pathname, role }: ManagementProps) {
  const normalized: string = pathname.replace(/\/$/, "");
  if (role !== "COMMERCANT" && normalized.startsWith("/dashboard/opportunities")) {
    if (normalized === "/dashboard/opportunities") return <EntrepreneurOpportunitiesView />;
    return <div className="management-view"><BackButton label="Opportunités" /><ManagementHeading eyebrow="OPPORTUNITÉ" title="Découvrez cette mission" description="Consultez le détail et poursuivez votre candidature depuis le site public." /><button type="button" className="button button-dark" onClick={() => window.location.assign(`/opportunities/${normalized.split("/").pop()}`)}>Voir le détail <ArrowRight size={15} /></button></div>;
  }
  if (normalized === "/dashboard/stores") return <StoresView />;
  if (normalized === "/dashboard/stores/add") return <StoreFormView />;
  if (normalized.startsWith("/dashboard/stores/edit/")) return <StoreFormView edit />;
  if (normalized === "/dashboard/products") return <ProductsView />;
  if (normalized === "/dashboard/products/add") return <ProductFormView />;
  if (normalized.startsWith("/dashboard/products/edit/")) return <ProductFormView edit />;
  if (normalized.startsWith("/dashboard/products/")) return <ProductManagementDetail />;
  if (normalized === "/dashboard/opportunities") return <OpportunityManagementView />;
  if (normalized === "/dashboard/opportunities/create") return <OpportunityFormView />;
  if (normalized.startsWith("/dashboard/opportunities/edit/")) return <OpportunityFormView edit />;
  if (normalized.startsWith("/dashboard/opportunities/")) return <OpportunityManagementDetail />;
  if (normalized === "/dashboard/subscriptions") return <SubscriptionsView />;
  if (normalized.startsWith("/dashboard/subscriptions/checkout/")) return <SubscriptionCheckoutView />;
  if (normalized === "/dashboard/subscriptions/success") return <SubscriptionSuccessView />;
  if (normalized === "/dashboard/withdrawal-methods") return <WithdrawalMethodsView />;
  if (normalized === "/dashboard/withdrawal-methods/add") return <WithdrawalFormView />;
  if (normalized.startsWith("/dashboard/withdrawal-methods/edit/")) return <WithdrawalFormView edit />;
  if (normalized === "/dashboard/profile") return <ProfileView />;
  if (normalized === "/dashboard/checkout") return <InternalCheckoutView />;
  if (normalized.startsWith("/dashboard/product/")) return <ProductManagementDetail />;
  return null;
}

export function getManagementPageCopy(pathname: string, role: UserRole = "COMMERCANT"): { eyebrow: string; title: string; description: string } | null {
  const normalized: string = pathname.replace(/\/$/, "");
  if (normalized === "/dashboard/stores") return { eyebrow: "COMMERCE", title: "Mes boutiques", description: "Gérez vos espaces de vente et choisissez la boutique active." };
  if (normalized.includes("/stores/add")) return { eyebrow: "NOUVEL ESPACE DE VENTE", title: "Créer une boutique", description: "Présentez votre activité avec une identité claire et accueillante." };
  if (normalized.includes("/stores/edit")) return { eyebrow: "MODIFIER UNE BOUTIQUE", title: "Modifier la boutique", description: "Mettez à jour les informations de votre espace de vente." };
  if (normalized === "/dashboard/products") return { eyebrow: "CATALOGUE", title: "Mes produits", description: "Ajoutez, modifiez et suivez les produits de votre boutique active." };
  if (normalized.includes("/products/add")) return { eyebrow: "NOUVEAU PRODUIT", title: "Ajouter un produit", description: "Donnez aux clients les bonnes informations pour choisir avec confiance." };
  if (normalized.includes("/products/edit")) return { eyebrow: "MODIFIER LE PRODUIT", title: "Modifier le produit", description: "Mettez à jour une fiche produit claire et utile." };
  if (normalized.includes("/products/")) return { eyebrow: "DÉTAIL PRODUIT", title: "Détail du produit", description: "Suivez la performance de ce produit dans votre boutique." };
  if (normalized === "/dashboard/opportunities") return role === "COMMERCANT" ? { eyebrow: "OPPORTUNITÉS PUBLIÉES", title: "Mes opportunités", description: "Publiez des missions qui attirent les bons profils." } : { eyebrow: "FAIRE GRANDIR VOTRE ACTIVITÉ", title: "Opportunités", description: "Trouvez des missions et des entreprises qui correspondent à votre énergie." };
  if (normalized.includes("/opportunities/create")) return { eyebrow: "NOUVELLE OPPORTUNITÉ", title: "Créer une opportunité", description: "Un brief précis attire des candidatures plus pertinentes." };
  if (normalized.includes("/opportunities/edit")) return { eyebrow: "MODIFIER L'OPPORTUNITÉ", title: "Modifier l'opportunité", description: "Mettez à jour les conditions de votre mission." };
  if (normalized.includes("/opportunities/")) return { eyebrow: "CANDIDATURES", title: "Détail de l'opportunité", description: "Consultez les profils et traitez les candidatures." };
  if (normalized === "/dashboard/subscriptions") return { eyebrow: "OFFRE DE LANCEMENT", title: "Abonnement Standard", description: "Forfait gratuit avec une boutique et jusqu’à 40 produits." };
  if (normalized.includes("/subscriptions/checkout")) return { eyebrow: "OFFRE DE LANCEMENT", title: "Abonnement Standard", description: "Aucun paiement n’est requis pour le forfait Standard." };
  if (normalized === "/dashboard/subscriptions/success") return { eyebrow: "OFFRE DE LANCEMENT", title: "Abonnement Standard", description: "Le forfait Standard gratuit est actif automatiquement." };
  if (normalized === "/dashboard/withdrawal-methods") return { eyebrow: "VOTRE ARGENT", title: "Moyens de retrait", description: "Gérez les comptes sur lesquels Orion vous verse vos revenus." };
  if (normalized.includes("/withdrawal-methods/")) return { eyebrow: "MOYEN DE RETRAIT", title: "Configurer un compte", description: "Les revenus validés seront versés sur ce compte." };
  if (normalized === "/dashboard/profile") return { eyebrow: "VOTRE IDENTITÉ ORION", title: "Profil", description: "Gardez vos informations et votre contexte à jour." };
  if (normalized === "/dashboard/checkout") return { eyebrow: "ACHAT INTERNE", title: "Finaliser l'achat", description: "Achetez un produit sans quitter votre espace Orion." };
  if (normalized.startsWith("/dashboard/product/")) return { eyebrow: "DÉTAIL PRODUIT", title: "Détail du produit", description: "Consultez un produit depuis votre espace connecté." };
  return null;
}

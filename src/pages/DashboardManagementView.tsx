import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
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
  LoaderCircle,
  Mail,
  MapPin,
  MoreHorizontal,
  Package,
  Pencil,
  Phone,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Trash2,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { catalogProducts, formatCfa, mapBackendProduct, opportunityCatalog, roleLabel, useOrion, type Product, type UserRole } from "../OrionContext";
import { createProduct, getProductsByOwner, publishProduct, updateProduct, type ProductRecord } from "../lib/catalog-service";
import { apiRequest } from "../lib/api";
import { createMission, formatMissionRemuneration, getMissionById, getMissionCandidates, getMissions, getMyApplications, getMyMissions, startMissionPublicationPayment, updateMission, updateMissionCandidateStatus, type MissionApplicationRecord, type MissionCandidate, type MissionRecord } from "../lib/mission-service";
import { getMyPurchases, type PurchaseRecord } from "../lib/order-service";
import { createStore, getMyStores, resolveStoreLocation, updateStore, type StoreRecord as BackendStoreRecord } from "../lib/store-service";
import { getUploadUrl } from "../lib/api";
import { getCurrentUser, updateUser, type AuthUser } from "../lib/auth-service";
import { ClientHandoverScanner, SellerOrdersView } from "../components/HandoverTools";
import { deleteAboutTeamMember, getAboutTeam, getAdminOrders, getAdminUsers, getAdminWallet, getSiteSettings, saveAboutTeamMember, saveSiteSettings, type AboutTeamMember, type AdminOrder, type AdminPlatformWallet, type AdminUser, type SiteSettingsRecord } from "../lib/admin-service";
import { toast } from "../components/ui/sonner";
import { createStoreCategory, deleteStoreCategory, getStoreCategories, updateStoreCategory, type StoreCategory } from "../lib/store-category-service";
import { createProductCategory, deleteProductCategory, getProductCategories, updateProductCategory, type ProductCategory } from "../lib/product-category-service";
import { createMissionType, deleteMissionType, getMissionTypes, updateMissionType, type MissionTypeRecord } from "../lib/mission-type-service";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../components/ui/alert-dialog";

type ManagementProps = { pathname: string; role: UserRole };

type StoreRecord = { id: string; name: string; category: string; description?: string; address?: string; location: string; logo?: string; products: number; revenue: string; status: string; color: string };
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

function ManagementTable({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`management-table ${className}`.trim()}>{children}</div>;
}

function ProductAdminPrice({ price, promotionalPrice }: { price: number; promotionalPrice?: number | null }) {
  const hasPromotion = promotionalPrice != null && Number(promotionalPrice) > 0 && Number(promotionalPrice) < Number(price);
  return <span className={`dashboard-product-price ${hasPromotion ? "has-promotion" : ""}`}>
    <strong>{formatCfa(hasPromotion ? Number(promotionalPrice) : Number(price))}</strong>
    {hasPromotion ? <del>{formatCfa(Number(price))}</del> : null}
  </span>;
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
          address: store.address,
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
  return <div className="management-view"><ManagementHeading eyebrow="COMMERCE" title="Mes boutiques" description="Chaque compte commerçant peut gérer une seule boutique." action={limitReached ? "Limite d’une boutique atteinte" : "Ajouter une boutique"} actionDisabled={limitReached} onAction={() => navigate("/dashboard/stores/add")} />{loadError ? <p className="auth-error">{loadError}</p> : stores.length === 0 ? <div className="store-list-empty"><Store size={22} /><p>Vous n’avez pas encore créé de boutique.</p></div> : <div className="store-management-grid">{stores.map((store) => <article className="store-management-card" key={store.id}><div className={`store-management-art ${store.color}`}>{store.logo ? <img src={store.logo} alt={`Logo de ${store.name}`} /> : <Store size={29} />}<button type="button" aria-label={`Modifier ${store.name}`} onClick={() => navigate(`/dashboard/stores/edit/${store.id}`)}><Edit3 size={15} /></button></div><div className="store-management-copy"><div><span className={`status-pill ${store.status === "Active" ? "status-green" : "status-gold"}`}><Check size={12} /> {store.status}</span><h3>{store.name}</h3><p>{store.category}</p>{store.description ? <p className="store-management-description">{store.description}</p> : null}<span><MapPin size={13} /> {store.address || store.location || "Adresse non renseignée"}</span></div><div className="store-management-stats"><span><strong>{store.products}</strong> produits</span><span><strong>{store.revenue}</strong></span></div></div><button type="button" className="store-manage-link" onClick={() => navigate("/dashboard/products")}>Gérer la boutique <ArrowRight size={15} /></button></article>)}</div>}</div>;
}
function StoreFormView({ edit = false }: { edit?: boolean }) {
  const navigate = useNavigate();
  const { session } = useOrion();
  const [saved, setSaved] = useState<boolean>(false);
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState({ nom: "", category: "", description: "", address: "", location: "" });
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [categoryError, setCategoryError] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [locationFocused, setLocationFocused] = useState(false);
  const [resolvedLocationLabel, setResolvedLocationLabel] = useState("");
  const [resolvingLocation, setResolvingLocation] = useState(false);
  const locationRequestId = useRef(0);
  const [locatingPosition, setLocatingPosition] = useState(false);
  const updateField = (key: keyof typeof form, value: string): void => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    let isMounted = true;
    getStoreCategories()
      .then((rows) => {
        if (!isMounted) return;
        setCategories(rows);
        setForm((current) => ({ ...current, category: current.category || rows[0]?.nom || "" }));
      })
      .catch((error: unknown) => { if (isMounted) setCategoryError(error instanceof Error ? error.message : "Impossible de charger les catégories."); });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!edit || !id || !session?.token) return;
    let isMounted = true;
    getMyStores(session.token).then((rows) => {
      const store = rows.find((row) => row.id === Number(id));
      if (isMounted && store) setForm({ nom: store.nom, category: store.category ?? "", description: store.description ?? "", address: store.address ?? "", location: store.location ?? "" });
    }).catch((error: unknown) => { if (isMounted) window.alert(error instanceof Error ? error.message : "Impossible de charger la boutique."); });
    return () => { isMounted = false; };
  }, [edit, id, session?.token]);

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
      const payload = { nom: form.nom, category: form.category, description: form.description, address: form.address, location: form.location, logo: logoFile ?? undefined, active: true };
      if (edit && id) await updateStore(Number(id), payload, session.token);
      else await createStore(payload, session.token);
      setSaved(true);
      toast.success(edit ? "Votre boutique a bien été mise à jour." : "Votre boutique a bien été créée.");
      setTimeout(() => navigate("/dashboard/stores"), 500);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de créer cette boutique.";
      toast.error(message);
    }
  };

  const capturePosition = (): void => {
    if (!navigator.geolocation) { window.alert("La géolocalisation n’est pas disponible sur cet appareil."); return; }
    if (locatingPosition) return;
    setLocatingPosition(true);
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      locationRequestId.current += 1;
      setResolvedLocationLabel("");
      updateField("location", `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`);
      setLocatingPosition(false);
    }, () => {
      window.alert("Position inaccessible. Autorisez la géolocalisation ou collez un lien Google Maps.");
      setLocatingPosition(false);
    }, { enableHighAccuracy: true, timeout: 12000 });
  };

  const handleLocationBlur = async (): Promise<void> => {
    setLocationFocused(false);
    const rawLocation = form.location.trim();
    if (!rawLocation || !/^https:\/\//i.test(rawLocation) || !session?.token) return;
    const requestId = ++locationRequestId.current;
    setResolvingLocation(true);
    try {
      const result = await resolveStoreLocation(rawLocation, session.token);
      if (locationRequestId.current === requestId && result.label) setResolvedLocationLabel(result.label);
    } catch {
      // Le lien reste enregistré et le résumé local sert de solution de repli.
    } finally {
      if (locationRequestId.current === requestId) setResolvingLocation(false);
    }
  };

  const locationSummary = (value: string): string => {
    if (resolvedLocationLabel) return resolvedLocationLabel;
    if (!value.trim()) return "";
    try {
      const url = new URL(value);
      const placeSegment = url.pathname.match(/\/place\/([^/]+)/i)?.[1];
      const query = url.searchParams.get("query") || url.searchParams.get("q");
      const candidate = placeSegment ? decodeURIComponent(placeSegment.replaceAll("+", " ")) : query;
      if (candidate && !/^-?\d+(\.\d+)?[, ]+-?\d+(\.\d+)?$/.test(candidate.trim())) {
        return candidate.replaceAll("+", " ").replace(/\s+/g, " ").trim();
      }
      if (/google\.[^/]+\/maps/i.test(value)) return form.address.trim() || "Position enregistrée";
    } catch { /* Le texte saisi n’est pas une URL : il reste lisible tel quel. */ }
    return value;
  };

  return <div className="management-view narrow-management-view"><BackButton label="Mes boutiques" /><ManagementHeading eyebrow={edit ? "MODIFIER UNE BOUTIQUE" : "NOUVEL ESPACE DE VENTE"} title={edit ? "Modifier la boutique" : "Créer une boutique"} description="Présentez votre activité avec une identité claire et accueillante." /><form className="management-form" onSubmit={submit}><div className="form-card"><div className="form-card-heading"><span className="form-card-icon"><Store size={18} /></span><div><h3>Informations principales</h3><p>Ces informations seront visibles par vos clients.</p></div></div><div className="form-grid"><label>Nom de la boutique<input required value={form.nom} onChange={(event) => updateField("nom", event.target.value)} placeholder="Ex. Atelier Naya" /></label><label>Catégorie<select required value={form.category} onChange={(event) => updateField("category", event.target.value)} disabled={!categories.length}><option value="">{categoryError ? "Erreur de chargement" : "Choisir une catégorie"}</option>{categories.map((category) => <option key={category.id} value={category.nom}>{category.nom}</option>)}</select>{categoryError ? <small className="auth-error">{categoryError}</small> : null}</label><label className="form-full">Description<textarea required value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Racontez ce que vous proposez..." /></label><div className="store-address-location-grid"><label>Adresse<input required value={form.address} onChange={(event) => updateField("address", event.target.value)} placeholder="Rue, quartier, ville" /></label><label>Localisation<span className="store-location-input-wrap"><input value={locationFocused ? form.location : resolvingLocation ? "Recherche du lieu…" : locationSummary(form.location)} onFocus={() => setLocationFocused(true)} onBlur={() => void handleLocationBlur()} onChange={(event) => { locationRequestId.current += 1; updateField("location", event.target.value); setResolvedLocationLabel(""); }} placeholder="Collez un lien Google Maps" /><button type="button" className="store-location-button" onClick={capturePosition} disabled={locatingPosition} aria-label={locatingPosition ? "Recherche de votre position" : "Utiliser ma position actuelle"} title={locatingPosition ? "Recherche de votre position…" : "Utiliser ma position actuelle"}>{locatingPosition ? <LoaderCircle className="store-location-spinner" size={16} /> : <MapPin size={16} />}</button></span></label></div><label className="store-logo-upload form-full">Logo ou image de la boutique<span className="store-logo-upload-control">{logoPreview ? <img src={logoPreview} alt="Aperçu du logo de la boutique" /> : <span className="store-logo-upload-placeholder"><ImagePlus size={22} /><span>Choisir une image</span></span>}<input type="file" accept="image/*" onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)} /><span className="store-logo-upload-hint">JPG, PNG ou WebP</span></span></label></div></div><div className="management-form-actions"><button type="button" className="button button-quiet" onClick={() => navigate(-1)}>Annuler</button><button type="submit" className="button button-dark" disabled={!categories.length}>{saved ? <><Check size={15} /> Enregistrée</> : <>{edit ? "Enregistrer les modifications" : "Créer la boutique"} <ArrowRight size={15} /></>}</button></div></form></div>;
}
function ProductsView() {
  const navigate = useNavigate();
  const { session } = useOrion();
  const [query, setQuery] = useState<string>("");
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [publishingId, setPublishingId] = useState<number | null>(null);

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

  const publish = async (product: ProductRecord) => {
    if (!session?.token) return;
    setPublishingId(product.id);
    try {
      await publishProduct(product.id, session.token);
      setProducts((current) => current.map((item) => item.id === product.id ? { ...item, statut: Number(item.stock) > 0 ? "Disponible" : "Rupture de stock" } : item));
      toast.success("Votre produit est maintenant publié.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible de publier ce produit.");
    } finally { setPublishingId(null); }
  };

  return <div className="management-view"><ManagementHeading eyebrow="CATALOGUE" title="Mes produits" description={`Forfait Standard : ${products.length}/40 produits dans votre boutique.`} action={products.length >= 40 ? "Limite de 40 produits atteinte" : "Ajouter un produit"} actionDisabled={products.length >= 40} onAction={() => navigate("/dashboard/products/add")} /><div className="management-toolbar"><div className="public-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher dans mes produits" /></div><button type="button" className="button button-quiet"><Settings2 size={15} /> Filtres</button></div><ManagementTable className="product-management-table"><div className="management-table-head"><span>PRODUIT</span><span>CATÉGORIE</span><span>STOCK</span><span>PRIX</span><span>STATUT</span><span /></div>{filtered.map((product) => { const isDraft = product.statut === "Brouillon"; return <div className="management-table-row" key={product.id}><div className="management-product-cell"><img src={getUploadUrl(product.image) || "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=88"} alt="" /><div><strong>{product.nom}</strong><small>{product.statut ?? "Boutique Orion"}</small></div></div><span>{product.categorie ?? "Divers"}</span><span className={Number(product.stock) < 10 ? "table-warning" : ""}>{Number(product.stock)} unités</span><ProductAdminPrice price={Number(product.prix ?? 0)} promotionalPrice={product.prixPromotionnel} /><span className={`status-pill ${isDraft ? "status-gold" : "status-green"}`}>{isDraft ? "Brouillon" : <><Check size={12} /> {Number(product.stock) > 0 ? "En ligne" : "Rupture"}</>}</span><div className="table-actions">{isDraft ? <button type="button" className="product-publish-button" disabled={publishingId !== null} onClick={() => void publish(product)}>{publishingId === product.id ? "Publication…" : "Publier"}</button> : null}<button type="button" onClick={() => navigate(`/dashboard/products/${product.id}`)} aria-label="Voir"><Eye size={15} /></button><button type="button" onClick={() => navigate(`/dashboard/products/edit/${product.id}`)} aria-label="Modifier"><Pencil size={15} /></button></div></div>; })}</ManagementTable></div>;
}

function ProductFormView({ edit = false }: { edit?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useOrion();
  const productId = Number(location.pathname.split("/").pop());
  const [product, setProduct] = useState<ProductRecord | null>(null);
  const [loadingProduct, setLoadingProduct] = useState<boolean>(edit);
  const [saved, setSaved] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [secondaryImageFiles, setSecondaryImageFiles] = useState<File[]>([]);
  const [clearSecondaryImages, setClearSecondaryImages] = useState(false);
  const [mainImagePreview, setMainImagePreview] = useState("");
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [form, setForm] = useState({
    nom: "",
    categorie: "Mode",
    description: "",
    prix: "",
    prixPromotionnel: "",
    stock: "",
    image: "",
  });

  useEffect(() => {
    let isMounted = true;
    getProductCategories()
      .then((rows) => {
        if (!isMounted) return;
        setProductCategories(rows);
        if (!edit) setForm((current) => ({ ...current, categorie: rows.some((row) => row.libellé === current.categorie) ? current.categorie : rows[0]?.libellé ?? "" }));
      })
      .catch((error: unknown) => { if (isMounted) setFormError(error instanceof Error ? error.message : "Impossible de charger les catégories de produits."); })
      .finally(() => { if (isMounted) setCategoriesLoading(false); });
    return () => { isMounted = false; };
  }, [edit]);

  useEffect(() => {
    if (!edit || !session?.token || !session.userId || !Number.isSafeInteger(productId)) {
      setLoadingProduct(false);
      return;
    }
    let isMounted = true;
    getProductsByOwner(Number(session.userId), session.token)
      .then((products) => {
        if (!isMounted) return;
        const existing = products.find((item) => item.id === productId);
        if (!existing) { setFormError("Ce produit est introuvable dans votre catalogue."); return; }
        setProduct(existing);
        const category = typeof existing.categorie === "string" ? existing.categorie : existing.categorie?.libellé ?? "Mode";
        const promotionalPrice = existing.prixPromotionnel == null ? "" : String(existing.prixPromotionnel);
        setForm({ nom: existing.nom, categorie: category, description: existing.description ?? "", prix: String(existing.prix), prixPromotionnel: promotionalPrice, stock: String(existing.stock), image: existing.image ?? "" });
      })
      .catch((error: unknown) => { if (isMounted) setFormError(error instanceof Error ? error.message : "Impossible de charger ce produit."); })
      .finally(() => { if (isMounted) setLoadingProduct(false); });
    return () => { isMounted = false; };
  }, [edit, productId, session?.token, session?.userId]);

  const updateField = (key: "nom" | "categorie" | "description" | "prix" | "prixPromotionnel" | "stock" | "image", value: string): void => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    if (!mainImageFile) { setMainImagePreview(""); return; }
    const previewUrl = URL.createObjectURL(mainImageFile);
    setMainImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [mainImageFile]);

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setFormError("");
    const regularPrice = Number(form.prix);
    const promotionalPrice = form.prixPromotionnel.trim() ? Number(form.prixPromotionnel) : null;
    if (promotionalPrice !== null && (!Number.isSafeInteger(promotionalPrice) || promotionalPrice <= 0 || promotionalPrice >= regularPrice)) {
      setFormError("Le prix promotionnel doit être un montant entier positif inférieur au prix normal.");
      return;
    }
    try {
      setSubmitting(true);
      if (!session?.token) throw new Error("Connectez-vous avec votre compte commerçant pour gérer vos produits.");
      const selectedCategory = productCategories.find((category) => category.libellé === form.categorie);
      if (!selectedCategory) throw new Error("Choisissez une catégorie de produit valide.");
      if (!form.nom.trim() || !form.description.trim() || (!edit && !mainImageFile) || !Number.isFinite(regularPrice) || regularPrice <= 0 || !Number.isSafeInteger(Number(form.stock)) || Number(form.stock) < 0) {
        throw new Error("Vérifiez le nom, la description, l’image, le prix et le stock du produit.");
      }
      const payload = {
        nom: form.nom.trim(),
        categorieId: selectedCategory.id,
        description: form.description.trim(),
        prix: regularPrice,
        prixPromotionnel: promotionalPrice,
        stock: Number(form.stock),
        image: mainImageFile ?? undefined,
        images_secondaires: secondaryImageFiles.length ? secondaryImageFiles : undefined,
        clearImagesSecondaires: clearSecondaryImages ? true : undefined,
      };
      if (edit) {
        if (!product) throw new Error("Le produit à modifier n’est pas chargé.");
        await updateProduct(product.id, payload, session.token);
      } else {
        await createProduct(payload, session.token);
      }
      setSaved(true);
      toast.success(edit ? "Votre produit a bien été modifié." : "Votre produit a bien été créé.");
      setTimeout(() => navigate("/dashboard/products"), 500);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Impossible d’enregistrer ce produit.");
    } finally {
      setSubmitting(false);
    }
  };

  return <div className="management-view narrow-management-view">
    <BackButton label="Mes produits" />
    <ManagementHeading eyebrow={edit ? "MODIFIER LE PRODUIT" : "NOUVEAU PRODUIT"} title={edit ? "Modifier le produit" : "Ajouter un produit"} description="Renseignez les informations du produit et téléversez ses photos." />
    {loadingProduct ? <p role="status">Chargement du produit…</p> : null}
    {formError ? <p className="auth-error" role="alert">{formError}</p> : null}
    <form className="management-form" onSubmit={submit}>
      <div className="form-card">
        <div className="form-card-heading"><span className="form-card-icon"><Package size={18} /></span><div><h3>Détails du produit</h3><p>Une fiche claire améliore la découverte et la conversion.</p></div></div>
        <div className="form-grid">
          <label>Nom du produit<input required value={form.nom} onChange={(event) => updateField("nom", event.target.value)} /></label>
          <label>Catégorie<select required value={form.categorie} onChange={(event) => updateField("categorie", event.target.value)} disabled={categoriesLoading || !productCategories.length}><option value="">{categoriesLoading ? "Chargement…" : "Choisir une catégorie"}</option>{productCategories.map((category) => <option key={category.id} value={category.libellé}>{category.libellé}</option>)}</select></label>
          <label className="form-full">Description<textarea required value={form.description} onChange={(event) => updateField("description", event.target.value)} /></label>
          <label>Prix normal (FCFA)<input required min="1" step="1" type="number" value={form.prix} onChange={(event) => updateField("prix", event.target.value)} /></label>
          <label>Prix promotionnel (FCFA)<input min="1" step="1" max={form.prix ? Number(form.prix) - 1 : undefined} type="number" value={form.prixPromotionnel} onChange={(event) => updateField("prixPromotionnel", event.target.value)} placeholder="Facultatif" /></label>
          <label>Stock disponible<input required min="0" step="1" type="number" value={form.stock} onChange={(event) => updateField("stock", event.target.value)} /></label>
          <div className="form-full product-upload-field"><span className="product-upload-label">Image principale <small>1 image obligatoire</small></span><label className="product-image-drop" htmlFor="product-main-image">{mainImagePreview || form.image ? <img src={mainImagePreview || getUploadUrl(form.image)} alt="Aperçu de l’image principale" /> : <span className="product-upload-placeholder"><ImagePlus size={23} /><strong>Choisir l’image principale</strong><small>JPG, PNG ou WebP</small></span>}<span className="product-image-drop-action">{mainImageFile ? "Changer l’image" : edit && form.image ? "Remplacer l’image" : "Parcourir les fichiers"}</span><input id="product-main-image" required={!edit && !mainImageFile} type="file" accept="image/*" onChange={(event) => setMainImageFile(event.target.files?.[0] ?? null)} /></label>{mainImageFile ? <small className="product-upload-filename">{mainImageFile.name}</small> : null}</div>
          <div className="form-full product-upload-field"><span className="product-upload-label">Images secondaires <small>Jusqu’à 3 images</small></span><label className="product-secondary-drop" htmlFor="product-secondary-images"><ImagePlus size={19} /><span><strong>Ajouter des images secondaires</strong><small>Sélectionnez jusqu’à trois fichiers</small></span><input id="product-secondary-images" type="file" accept="image/*" multiple onChange={(event) => { const selected = Array.from(event.target.files ?? []); if (selected.length > 3) { setFormError("Sélectionnez au maximum trois images secondaires."); event.target.value = ""; return; } setFormError(""); setSecondaryImageFiles(selected); setClearSecondaryImages(false); }} /></label>{secondaryImageFiles.length ? <div className="product-secondary-list">{secondaryImageFiles.map((file) => <span key={`${file.name}-${file.lastModified}`}><ImagePlus size={14} />{file.name}</span>)}</div> : product?.images_secondaires?.length && !clearSecondaryImages ? <div className="product-secondary-thumbs">{product.images_secondaires.map((image) => <img key={image} src={getUploadUrl(image)} alt="Image secondaire actuelle" />)}</div> : clearSecondaryImages ? <small className="product-upload-filename">Les images secondaires seront supprimées.</small> : null}{product?.images_secondaires?.length ? <button type="button" className="product-clear-secondary" onClick={() => { setSecondaryImageFiles([]); setClearSecondaryImages(true); }}>Supprimer les images secondaires</button> : null}</div>
        </div>
      </div>
      <div className="management-form-actions"><button type="button" className="button button-quiet" onClick={() => navigate(-1)}>Annuler</button><button type="submit" className="button button-dark" disabled={submitting || loadingProduct || (edit && !product)}>{saved ? <><Check size={15} /> Enregistré</> : submitting ? "Enregistrement…" : <>{edit ? "Enregistrer les modifications" : "Publier le produit"} <ArrowRight size={15} /></>}</button></div>
    </form>
  </div>;
}

function ProductManagementDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { session } = useOrion();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!session?.token || !session.userId || !id) { setLoading(false); return; }
    let isMounted = true;
    getProductsByOwner(Number(session.userId), session.token)
      .then((products) => {
        if (!isMounted) return;
        const record = products.find((item) => String(item.id) === id);
        if (record) setProduct(mapBackendProduct(record));
        else setError("Ce produit est introuvable dans votre catalogue.");
      })
      .catch((reason: unknown) => { if (isMounted) setError(reason instanceof Error ? reason.message : "Impossible de charger ce produit."); })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [id, session?.token, session?.userId]);
  useEffect(() => { setSelectedImage(product?.image ?? null); }, [product?.id, product?.image]);
  if (loading) return <div className="management-view"><BackButton label="Mes produits" /><p role="status">Chargement du produit…</p></div>;
  if (error || !product) return <div className="management-view"><BackButton label="Mes produits" /><p className="auth-error" role="alert">{error || "Produit introuvable."}</p></div>;
  const galleryImages = Array.from(new Set([product.image, ...(product.secondaryImages ?? [])].filter(Boolean)));
  const isDraft = product.status === "Brouillon";
  return <div className="management-view"><BackButton label="Mes produits" /><div className="management-detail-hero"><div className="management-detail-gallery"><img className="management-detail-main-image" src={selectedImage || product.image} alt={product.name} />{galleryImages.length > 1 ? <div className="management-detail-thumbs">{galleryImages.map((image, index) => <button type="button" key={`${image}-${index}`} className={(selectedImage || product.image) === image ? "is-active" : ""} onClick={() => setSelectedImage(image)} aria-label={`Afficher l’image ${index + 1} de ${product.name}`}><img src={image} alt="" /></button>)}</div> : null}</div><div><span className={`status-pill ${isDraft ? "status-gold" : "status-green"}`}>{isDraft ? "Brouillon" : <><Check size={12} /> {product.status === "Rupture de stock" ? "Rupture de stock" : "En ligne"}</>}</span><span className="public-kicker">{product.category}</span><h2>{product.name}</h2><p>{product.description}</p><div className="management-detail-price">{formatCfa(product.price)} <small>· {product.stock} en stock</small></div><div className="management-detail-actions"><button type="button" className="button button-dark" onClick={() => navigate(`/dashboard/products/edit/${product.id}`)}><Pencil size={15} /> Modifier</button></div></div></div><div className="management-kpi-grid"><div className="management-kpi"><TrendingUp size={18} /><span>Vues produit</span><strong>2 840</strong><small>+18,4% ce mois</small></div><div className="management-kpi"><Package size={18} /><span>Commandes</span><strong>48</strong><small>+12 depuis le mois dernier</small></div><div className="management-kpi"><Star size={18} /><span>Note moyenne</span><strong>4,9 / 5</strong><small>24 avis vérifiés</small></div></div></div>;
}

function OpportunityManagementView() {
  const navigate = useNavigate();
  const { session } = useOrion();
  const [opportunities, setOpportunities] = useState<Array<(typeof opportunityCatalog)[number] & { candidatureCount: number }>>([]);
  const [loadError, setLoadError] = useState<string>("");
  const [paymentOpportunity, setPaymentOpportunity] = useState<{ id: string; title: string } | null>(null);
  const [startingPayment, setStartingPayment] = useState(false);

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
          amount: formatMissionRemuneration(mission.montant, mission.frequencePaiement),
          duration: mission.dureeMission ? `${mission.dureeMission} mois` : "Flexible",
          description: mission.description ?? mission.descriptionCourte ?? "Mission disponible",
          statut: mission.statut ?? "brouillon",
          candidatureCount: mission.candidatures?.length ?? 0,
          accent: "gold",
        }));
        setOpportunities(mapped);
      })
      .catch((error: unknown) => { if (isMounted) setLoadError(error instanceof Error ? error.message : "Impossible de charger vos opportunités."); });
    return () => {
      isMounted = false;
    };
  }, [session?.token]);

  const confirmPublicationPayment = async () => {
    if (!session?.token || !paymentOpportunity || startingPayment) return;
    setStartingPayment(true);
    try {
      const payment = await startMissionPublicationPayment(Number(paymentOpportunity.id), session.token);
      window.location.assign(payment.payment_url);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de démarrer le paiement.";
      toast.error(message);
      setPaymentOpportunity(null);
    } finally {
      setStartingPayment(false);
    }
  };

  return <>
    <div className="management-view">
      <ManagementHeading eyebrow="OPPORTUNITÉS PUBLIÉES" title="Mes opportunités" description="Une mission devient accessible aux entrepreneurs après confirmation des frais de publication de 500 FCFA." action="Créer une opportunité" onAction={() => navigate("/dashboard/opportunities/create")} />
      {loadError ? <p className="auth-error">{loadError}</p> : opportunities.length === 0 ? <div className="store-list-empty"><BriefcaseBusiness size={22} /><p>Vous n’avez pas encore créé d’opportunité.</p></div> : <div className="management-opportunity-list">{opportunities.map((opportunity) => <article className="management-opportunity-row" key={opportunity.id}><div className="management-opportunity-placeholder"><BriefcaseBusiness size={25} strokeWidth={1.25} /></div><div><span className={`public-opportunity-tag tag-${opportunity.accent}`}>{opportunity.type}</span><h3>{opportunity.title}</h3><p><MapPin size={13} /> {opportunity.location} · <strong>{opportunity.amount}</strong></p></div><span className={`status-pill ${opportunity.statut === "ouverte" ? "status-green" : ""}`}>{opportunity.statut === "ouverte" ? "Publiée" : "Brouillon · paiement requis"}</span>{opportunity.statut !== "ouverte" ? <button type="button" className="button button-dark" onClick={() => setPaymentOpportunity({ id: opportunity.id, title: opportunity.title })}>Payer 500 FCFA</button> : null}<div className="table-actions"><button type="button" aria-label={`Voir les candidatures pour ${opportunity.title}`} className="opportunity-candidates-link" onClick={() => navigate(`/dashboard/opportunities/${opportunity.id}`)}><Eye size={15} />{opportunity.candidatureCount > 0 ? <span className="opportunity-candidates-dot" aria-label={`${opportunity.candidatureCount} candidature(s)`} /> : null}</button><button type="button" onClick={() => navigate(`/dashboard/opportunities/edit/${opportunity.id}`)}><Pencil size={15} /></button></div></article>)}</div>}
    </div>
    <AlertDialog open={paymentOpportunity !== null} onOpenChange={(open) => { if (!open && !startingPayment) setPaymentOpportunity(null); }}>
      <AlertDialogContent className="publication-payment-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la publication ?</AlertDialogTitle>
          <AlertDialogDescription>Vous êtes sur le point de payer 500 FCFA pour publier « {paymentOpportunity?.title} ». Ce paiement rendra votre opportunité accessible aux candidats sur Orion.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="button button-quiet" disabled={startingPayment}>Annuler</AlertDialogCancel>
          <AlertDialogAction className="button button-dark" disabled={startingPayment} onClick={(event) => { event.preventDefault(); void confirmPublicationPayment(); }}>{startingPayment ? "Ouverture du paiement…" : "Confirmer et payer 500 FCFA"}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>;
}

function EntrepreneurOpportunitiesView() {
  const navigate = useNavigate();
  const { session } = useOrion();
  const [applications, setApplications] = useState<MissionApplicationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    if (!session?.token) { setLoading(false); setApplications([]); return () => { isMounted = false; }; }
    setLoading(true);
    getMyApplications(session.token)
      .then((response) => { if (isMounted) setApplications(response); })
      .catch((reason: unknown) => { if (isMounted) setError(reason instanceof Error ? reason.message : "Impossible de charger vos candidatures."); })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [session?.token]);

  return <div className="management-view"><ManagementHeading eyebrow="VOTRE PARCOURS" title="Mes candidatures" description="Suivez les réponses et l’avancement des missions auxquelles vous avez postulé." action="Découvrir des opportunités" onAction={() => navigate("/opportunities")} />{error ? <p className="auth-error" role="alert">{error}</p> : null}{loading ? <p role="status">Chargement de vos candidatures…</p> : applications.length === 0 ? <div className="store-list-empty"><BriefcaseBusiness size={22} /><p>Vous n’avez pas encore postulé à une opportunité.</p><button type="button" className="button button-dark" onClick={() => navigate("/opportunities")}>Parcourir les missions <ArrowRight size={15} /></button></div> : <div className="management-opportunity-list">{applications.map((application) => { const status = String(application.candidature.statut ?? "en_attente").toLowerCase(); const statusLabel = status.includes("accept") ? "Acceptée" : status.includes("refus") ? "Refusée" : "En attente"; const statusClass = status.includes("accept") ? "status-green" : status.includes("refus") ? "status-coral" : "status-gold"; const company = [application.commercant?.prenom, application.commercant?.nom].filter(Boolean).join(" ") || "Équipe Orion"; return <article className="management-opportunity-row" key={application.id}><div className="management-opportunity-placeholder"><BriefcaseBusiness size={25} strokeWidth={1.25} /></div><div><span className="public-opportunity-tag tag-gold">{application.type ?? "Mission"}</span><h3>{application.titre}</h3><p><MapPin size={13} /> {application.localisation || "Afrique"} · <strong>{formatMissionRemuneration(application.montant, application.frequencePaiement)}</strong></p><small>Organisation : {company} · Candidature envoyée le {new Date(application.candidature.dateCandidature).toLocaleDateString("fr-FR")}</small></div><span className={`status-pill ${statusClass}`}>{statusLabel}</span><button type="button" className="button button-quiet" onClick={() => navigate(`/opportunities/${application.id}`)}>Voir la mission <ArrowRight size={14} /></button></article>; })}</div>}</div>;
}

function ClientOrdersView() {
  const navigate = useNavigate();
  const { session } = useOrion();
  const [orders, setOrders] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  useEffect(() => {
    let isMounted = true;
    if (!session?.token) { setOrders([]); setLoading(false); return () => { isMounted = false; }; }
    getMyPurchases(session.token)
      .then((response) => { if (isMounted) setOrders(response); })
      .catch((reason: unknown) => { if (isMounted) setError(reason instanceof Error ? reason.message : "Impossible de charger vos commandes."); })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [session?.token]);
  return <div className="management-view"><ManagementHeading eyebrow="VOTRE PARCOURS D'ACHAT" title="Mes commandes" description="Consultez vos achats et confirmez la remise au vendeur avec son QR." action="Explorer le marketplace" onAction={() => navigate("/marketplace")} />{error ? <p className="auth-error" role="alert">{error}</p> : null}{loading ? <p role="status">Chargement de vos commandes…</p> : orders.length === 0 ? <div className="store-list-empty"><ShoppingBag size={22} /><p>Vous n’avez pas encore de commande.</p><button type="button" className="button button-dark" onClick={() => navigate("/marketplace")}>Découvrir les produits <ArrowRight size={15} /></button></div> : <div className="purchase-list">{orders.map((order) => <article className="purchase-card" key={order.id}><div><span className="public-kicker">{order.reference || `COMMANDE #${order.id}`}</span><h2>{order.produits?.map((product) => product.nom).join(", ") || "Commande Orion"}</h2><p>{order.date_achat ? new Date(order.date_achat).toLocaleDateString("fr-FR") : "Date indisponible"}</p></div><div><strong>{formatCfa(Number(order.prix_total ?? 0))}</strong><span className="purchase-status">{order.statut || "En traitement"}</span></div>{order.remises?.map((remise) => <div className="purchase-remise" key={remise.id}><strong>{remise.articles.map((item) => `${item.nom} × ${item.quantite}`).join(", ")} · {formatCfa(remise.montant)}</strong>{remise.statut === "bloquee" && session?.token ? <ClientHandoverScanner token={session.token} orderId={order.id} onConfirmed={() => setOrders((current) => current.map((item) => item.id !== order.id ? item : { ...item, remises: item.remises?.map((r) => r.id === remise.id ? { ...r, statut: "liberee" } : r) }))} /> : <span className="purchase-status">{remise.statut === "liberee" ? "Remise confirmée" : remise.statut === "remboursee" ? "Remboursée" : "En attente de paiement"}</span>}</div>)}</article>)}</div>}</div>;
}

function formatRequirementLines(value: string): string {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^[•·*-]\s*/, ""))
    .filter(Boolean)
    .map((line) => `• ${line}`)
    .join("\n");
}

function OpportunityFormView({ edit = false }: { edit?: boolean }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { session } = useOrion();
  const [saved, setSaved] = useState<boolean>(false);
  const [existingMission, setExistingMission] = useState<MissionRecord | null>(null);
  const [loadError, setLoadError] = useState("");
  const [missionTypes, setMissionTypes] = useState<MissionTypeRecord[]>([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const opportunity = opportunityCatalog[0];
  const [form, setForm] = useState({
    titre: "",
    type: "Mission rémunérée",
    localisation: "",
    description: "",
    montant: "",
    frequencePaiement: "fixe",
    dureeMission: "",
    requis: "",
  });

  useEffect(() => {
    let isMounted = true;
    getMissionTypes()
      .then((rows) => { if (isMounted) setMissionTypes(rows); })
      .catch((error: unknown) => { if (isMounted) setLoadError(error instanceof Error ? error.message : "Impossible de charger les types de mission."); })
      .finally(() => { if (isMounted) setTypesLoading(false); });
    return () => { isMounted = false; };
  }, []);

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
          frequencePaiement: mission.frequencePaiement ?? "fixe",
          dureeMission: String(mission.dureeMission ?? 1),
          requis: formatRequirementLines(mission.requis ?? ""),
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
        frequencePaiement: form.frequencePaiement,
        dureeMission: Number(form.dureeMission || 1),
        datePublication: new Date().toISOString(),
        dateLimiteCandidature: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
        requis: formatRequirementLines(form.requis) || "• Expérience confirmée",
      };
      let created: MissionRecord;
      if (edit && id) {
        created = await updateMission(Number(id), payload, session.token);
      } else {
        created = await createMission(payload, session.token);
      }
      setSaved(true);
      if (created.publicationPayee === false) {
        toast.success(edit ? "Modifications enregistrées. Vous pourrez confirmer le paiement depuis vos opportunités." : "Brouillon enregistré. Vous pourrez confirmer le paiement depuis vos opportunités.");
        navigate("/dashboard/opportunities");
        return;
      }
      toast.success(edit ? "Votre opportunité a bien été modifiée." : "Votre opportunité est publiée.");
      navigate("/dashboard/opportunities");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de publier cette opportunité.";
      window.alert(message);
    }
  };

  return <div className="management-view narrow-management-view"><BackButton label="Mes opportunités" /><ManagementHeading eyebrow={edit ? "MODIFIER L'OPPORTUNITÉ" : "NOUVELLE OPPORTUNITÉ"} title={edit ? "Modifier l'opportunité" : "Créer une opportunité"} description={edit && existingMission?.publicationPayee ? "Modifiez les informations de votre mission publiée." : "Enregistrez votre brouillon, puis confirmez les frais de 500 FCFA pour rendre l’opportunité accessible."} />{loadError ? <p className="auth-error">{loadError}</p> : null}<form className="management-form" onSubmit={submit}><div className="form-card"><div className="form-card-heading"><span className="form-card-icon"><BriefcaseBusiness size={18} /></span><div><h3>Brief de la mission</h3><p>Décrivez le projet et les conditions de collaboration.</p></div></div><div className="form-grid"><label className="form-full">Titre de l'opportunité<input required value={form.titre} onChange={(event) => updateField("titre", event.target.value)} placeholder="Ex. Photographe produit pour..." /></label><label>Type de mission<select required value={form.type} onChange={(event) => updateField("type", event.target.value)} disabled={typesLoading || missionTypes.length === 0}><option value="">{typesLoading ? "Chargement des types…" : "Choisir un type"}</option>{existingMission?.type && !missionTypes.some((missionType) => missionType.nom === existingMission.type) ? <option value={existingMission.type}>{existingMission.type} (type archivé)</option> : null}{missionTypes.map((missionType) => <option key={missionType.id} value={missionType.nom}>{missionType.nom}</option>)}</select></label><label>Localisation<input required value={form.localisation} onChange={(event) => updateField("localisation", event.target.value)} placeholder="Ville · À distance" /></label><label>Montant / rémunération<input required type="number" min="0" step="1" value={form.montant} onChange={(event) => updateField("montant", event.target.value)} placeholder="Ex. 250000" /></label><label>Fréquence de rémunération<select required value={form.frequencePaiement} onChange={(event) => updateField("frequencePaiement", event.target.value)}><option value="fixe">Une seule fois</option><option value="journalier">Par jour</option><option value="hebdomadaire">Par semaine</option><option value="mensuel">Par mois</option><option value="annuel">Par an</option></select></label><label>Durée de la mission (mois)<input required type="number" min="1" step="1" value={form.dureeMission} onChange={(event) => updateField("dureeMission", event.target.value)} placeholder="Ex. 2" /></label><label className="form-full">Description<textarea required className="form-textarea-tall" value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Quel est le contexte, le besoin et le résultat attendu ?" /></label><label className="form-full">Prérequis<textarea className="form-textarea-tall" value={form.requis} onChange={(event) => updateField("requis", event.target.value)} onKeyDown={(event) => { if (event.key !== "Enter") return; const input = event.currentTarget; const start = input.selectionStart; const end = input.selectionEnd; const next = `${input.value.slice(0, start)}\n• ${input.value.slice(end)}`; event.preventDefault(); updateField("requis", next); requestAnimationFrame(() => input.setSelectionRange(start + 3, start + 3)); }} placeholder="Saisissez un prérequis par ligne" /></label></div></div><div className="management-form-actions"><button type="button" className="button button-quiet" onClick={() => navigate(-1)}>Annuler</button><button type="submit" className="button button-dark" disabled={typesLoading || missionTypes.length === 0 || saved}>{saved ? "Enregistrement…" : edit ? "Enregistrer les modifications" : <>Créer le brouillon <ArrowRight size={15} /></>}</button></div></form></div>;
}

function OpportunityManagementDetail({ id }: { id: string }) {
  const navigate = useNavigate();
  const { session } = useOrion();
  const [mission, setMission] = useState<MissionRecord | null>(null);
  const [candidates, setCandidates] = useState<MissionCandidate[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!id) {
      setLoading(false);
      setError("Identifiant d’opportunité invalide.");
      return () => { isMounted = false; };
    }
    setLoading(true);
    setMission(null);
    setCandidates([]);
    setError("");
    const loadMission = async (): Promise<MissionRecord | null> => {
      if (!session?.token) throw new Error("Connectez-vous avec le compte commerçant pour consulter cette opportunité.");
      const ownedMissions = await getMyMissions(session.token);
      return ownedMissions.find((item) => Number(item.id) === Number(id)) ?? null;
    };

    const candidateRequest = session?.token
      ? getMissionCandidates(Number(id), session.token)
      : Promise.reject(new Error("Connectez-vous avec le compte commerçant pour consulter les candidatures."));
    Promise.allSettled([loadMission(), candidateRequest])
      .then(([missionResult, candidatesResult]) => {
        if (!isMounted) return;
        if (missionResult.status === "fulfilled" && missionResult.value) setMission(missionResult.value);
        else setError(missionResult.status === "rejected" && missionResult.reason instanceof Error
          ? missionResult.reason.message
          : "Cette opportunité n’existe plus ou n’est pas accessible.");
        if (candidatesResult.status === "fulfilled") setCandidates(candidatesResult.value);
        else if (missionResult.status === "fulfilled" && missionResult.value) {
          setError(candidatesResult.reason instanceof Error ? candidatesResult.reason.message : "Impossible de charger les candidatures.");
        }
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
      const updated = await updateMissionCandidateStatus(Number(id), candidate.userId, statut, session.token);
      setCandidates((current) => current.map((item) => item.userId === candidate.userId ? { ...item, statut } : item));
      if (statut === "acceptee" && updated.discussionId) navigate(`/dashboard/messages?discussionId=${updated.discussionId}`);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Impossible de mettre à jour cette candidature.");
    } finally { setUpdatingUserId(null); }
  };

  if (loading) return <div className="management-view"><BackButton label="Mes opportunités" /><p>Chargement de l’opportunité et des candidatures…</p></div>;
  if (!mission) return <div className="management-view"><BackButton label="Mes opportunités" /><ManagementHeading eyebrow="CANDIDATURES" title="Opportunité introuvable" description={error || `La requête n’a pas fourni l’opportunité #${id}.`} /></div>;

  return <div className="management-view"><BackButton label="Mes opportunités" /><div className="management-opportunity-detail"><div className="management-opportunity-detail-placeholder"><BriefcaseBusiness size={54} strokeWidth={1.15} /></div><div><span className="public-opportunity-tag tag-gold">{mission.type ?? "Opportunité"}</span><h2>{mission.titre}</h2><p>{mission.description}</p><div className="opportunity-detail-facts"><span><MapPin size={15} /> {mission.localisation}</span><span><Banknote size={15} /> {formatMissionRemuneration(mission.montant, mission.frequencePaiement)}</span><span><Package size={15} /> {mission.dureeMission ?? "Flexible"} mois</span></div>{mission.requis ? <p className="mission-requirements-detail"><strong>Prérequis</strong><br />{mission.requis}</p> : null}<button type="button" className="button button-dark" onClick={() => navigate(`/dashboard/opportunities/edit/${mission.id}`)}><Pencil size={15} /> Modifier l'opportunité</button></div></div><section className="candidate-panel"><div className="panel-heading"><div><span className="public-kicker">CANDIDATURES</span><h2>Profils intéressés</h2></div><span className="candidate-count">{candidates.length} candidature{candidates.length === 1 ? "" : "s"}</span></div>{error ? <p className="auth-error">{error}</p> : null}{candidates.length === 0 ? <div className="store-list-empty"><BriefcaseBusiness size={22} /><p>Aucune candidature pour le moment.</p></div> : candidates.map((candidate) => {
    const firstName = candidate.candidat?.prenom ?? "";
    const lastName = candidate.candidat?.nom ?? "";
    const name = `${firstName} ${lastName}`.trim() || `Candidat #${candidate.userId}`;
    const initials = name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
    const statusLabel = candidate.statut === "acceptee" ? "Acceptée" : candidate.statut === "refusee" ? "Refusée" : "En attente";
    const acceptedExists = candidates.some((item) => item.userId !== candidate.userId && item.statut === "acceptee");
    return <div className="candidate-row" key={candidate.userId}>{candidate.candidat?.image ? <img className="candidate-profile-photo" src={getUploadUrl(candidate.candidat.image)} alt={`Photo de ${name}`} /> : <span className="avatar avatar-default avatar-rose">{initials}</span>}<div className="candidate-profile-copy"><strong>{name}</strong>{candidate.candidat?.specialite ? <span>{candidate.candidat.specialite}</span> : null}{candidate.candidat?.email ? <span className="candidate-contact-line"><Mail size={12} /> <a href={`mailto:${candidate.candidat.email}`}>{candidate.candidat.email}</a></span> : null}{candidate.candidat?.telephone ? <span className="candidate-contact-line"><Phone size={12} /> <a href={`tel:${candidate.candidat.telephone}`}>{candidate.candidat.telephone}</a></span> : null}{candidate.candidat?.adresse ? <span className="candidate-contact-line"><MapPin size={12} /> {candidate.candidat.adresse}</span> : null}{candidate.message ? <small>{candidate.message}</small> : null}</div><span className="candidate-time">{new Date(candidate.dateCandidature).toLocaleDateString("fr-FR")}</span><span className={`status-pill ${candidate.statut === "acceptee" ? "status-green" : candidate.statut === "refusee" ? "status-gold" : ""}`}>{statusLabel}</span>{candidate.statut !== "refusee" ? <><button type="button" className="button button-quiet" disabled={updatingUserId !== null} onClick={() => changeCandidateStatus(candidate, "refusee")}>{updatingUserId === candidate.userId ? "Mise à jour…" : "Refuser"}</button>{candidate.statut === "en_attente" ? <button type="button" className="button button-dark" disabled={updatingUserId !== null || acceptedExists} title={acceptedExists ? "Refusez d’abord la candidature acceptée." : undefined} onClick={() => changeCandidateStatus(candidate, "acceptee")}>{updatingUserId === candidate.userId ? "Mise à jour…" : "Accepter"}</button> : null}</> : null}</div>;
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
        updateSession({ userId: user.id, email: user.email, name: [user.prenom, user.nom].filter(Boolean).join(" "), image: user.image });
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
    ["prenom", "nom", "email", "contact", "date_naissance", "adresse", "specialite", "localisation"].forEach((field) => {
      payload.append(field, String(profile[field as keyof AuthUser] ?? ""));
    });
    if (password) payload.append("password", password);
    if (photo) payload.append("image", photo);
    try {
      const updated = await updateUser(profile.id, payload, session.token);
      setProfile(updated);
      setPassword("");
      setPhoto(null);
      updateSession({ userId: updated.id, email: updated.email, name: [updated.prenom, updated.nom].filter(Boolean).join(" "), image: updated.image });
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
          <div className="profile-role-locked form-full"><span>Rôle du compte</span><strong>{roleLabel(profile.role)}</strong><small>Le rôle choisi à la création du compte ne peut pas être modifié.</small></div>
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

function AdminUsersView() {
  const { session } = useOrion();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!session?.token) return;
    getAdminUsers(session.token).then(setUsers).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Impossible de charger les utilisateurs."));
  }, [session?.token]);
  const filtered = users.filter((user) => `${user.prenom} ${user.nom} ${user.email} ${user.role}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <div className="management-view"><ManagementHeading eyebrow="ADMINISTRATION" title="Tous les utilisateurs" description={`${users.length} compte${users.length === 1 ? "" : "s"} enregistré${users.length === 1 ? "" : "s"} sur Orion.`} /><div className="management-toolbar"><div className="public-search"><Search size={16} /><input aria-label="Rechercher un utilisateur" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nom, e-mail ou rôle" /></div></div>{error ? <p className="auth-error">{error}</p> : <ManagementTable><div className="management-table-head admin-users-head"><span>UTILISATEUR</span><span>E-MAIL</span><span>RÔLE</span><span>LOCALISATION</span></div>{filtered.map((user) => <div className="management-table-row admin-users-row" key={user.id}><div className="management-product-cell"><span className="admin-user-avatar"><UserRound size={16} /></span><div><strong>{[user.prenom, user.nom].filter(Boolean).join(" ") || "Sans nom"}</strong><small>Compte #{user.id}</small></div></div><span>{user.email}</span><span className="status-pill">{user.role === "ADMIN" ? "Administrateur" : user.role === "COMMERCANT" ? "Commerçant" : "Utilisateur"}</span><span>{user.localisation || "—"}</span></div>)}</ManagementTable>}</div>;
}

function AdminStoreCategoriesView() {
  const { session } = useOrion();
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const reload = async () => {
    setError("");
    try { setCategories(await getStoreCategories()); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Impossible de charger les catégories."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void reload(); }, []);

  const addCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session?.token || !newName.trim()) return;
    setSaving(true);
    try { await createStoreCategory(newName.trim(), session.token); setNewName(""); await reload(); toast.success("Catégorie ajoutée."); }
    catch (reason) { const message = reason instanceof Error ? reason.message : "Impossible d’ajouter la catégorie."; setError(message); toast.error(message); }
    finally { setSaving(false); }
  };
  const saveCategory = async (id: number) => {
    if (!session?.token || !editingName.trim()) return;
    setSaving(true);
    try { await updateStoreCategory(id, editingName.trim(), session.token); setEditingId(null); setEditingName(""); await reload(); toast.success("Catégorie mise à jour."); }
    catch (reason) { const message = reason instanceof Error ? reason.message : "Impossible de modifier la catégorie."; setError(message); toast.error(message); }
    finally { setSaving(false); }
  };
  const removeCategory = async (id: number, nom: string) => {
    if (!session?.token || !window.confirm(`Supprimer la catégorie « ${nom} » ?`)) return;
    setSaving(true);
    try { await deleteStoreCategory(id, session.token); await reload(); toast.success("Catégorie supprimée."); }
    catch (reason) { const message = reason instanceof Error ? reason.message : "Impossible de supprimer la catégorie."; setError(message); toast.error(message); }
    finally { setSaving(false); }
  };

  return <div className="management-view"><ManagementHeading eyebrow="ADMINISTRATION" title="Catégories de boutique" description="Les catégories ci-dessous sont proposées aux commerçants lors de la création de leur boutique." />
    <form className="store-category-add" onSubmit={addCategory}><label>Nouvelle catégorie<input required maxLength={100} value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Ex. Artisanat" /></label><button className="button button-dark" disabled={saving || !newName.trim()}><Plus size={15} /> Ajouter</button></form>
    {error ? <p className="auth-error" role="alert">{error}</p> : null}
    {loading ? <p role="status">Chargement des catégories…</p> : <div className="store-category-admin-list">{categories.map((category) => <article className="store-category-admin-row" key={category.id}>{editingId === category.id ? <input aria-label="Nom de la catégorie" maxLength={100} value={editingName} onChange={(event) => setEditingName(event.target.value)} /> : <strong>{category.nom}</strong>}<div>{editingId === category.id ? <><button type="button" className="button button-dark" disabled={saving || !editingName.trim()} onClick={() => void saveCategory(category.id)}>Enregistrer</button><button type="button" className="button button-quiet" onClick={() => setEditingId(null)}>Annuler</button></> : <><button type="button" className="table-icon-button" aria-label={`Modifier ${category.nom}`} onClick={() => { setEditingId(category.id); setEditingName(category.nom); }}><Pencil size={15} /></button><button type="button" className="table-icon-button danger" aria-label={`Supprimer ${category.nom}`} disabled={saving} onClick={() => void removeCategory(category.id, category.nom)}><Trash2 size={15} /></button></>}</div></article>)}{!categories.length ? <p>Aucune catégorie définie.</p> : null}</div>}
  </div>;
}

function AdminProductCategoriesView() {
  const { session } = useOrion();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const reload = async () => {
    setError("");
    try { setCategories(await getProductCategories()); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Impossible de charger les catégories de produits."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void reload(); }, []);

  const addCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session?.token || !newName.trim()) return;
    setSaving(true);
    try { await createProductCategory(newName.trim(), session.token); setNewName(""); await reload(); toast.success("Catégorie de produit ajoutée."); }
    catch (reason) { const message = reason instanceof Error ? reason.message : "Impossible d’ajouter la catégorie."; setError(message); toast.error(message); }
    finally { setSaving(false); }
  };
  const saveCategory = async (id: number) => {
    if (!session?.token || !editingName.trim()) return;
    setSaving(true);
    try { await updateProductCategory(id, editingName.trim(), session.token); setEditingId(null); setEditingName(""); await reload(); toast.success("Catégorie de produit mise à jour."); }
    catch (reason) { const message = reason instanceof Error ? reason.message : "Impossible de modifier la catégorie."; setError(message); toast.error(message); }
    finally { setSaving(false); }
  };
  const removeCategory = async (id: number, name: string) => {
    if (!session?.token || !window.confirm(`Supprimer la catégorie « ${name} » ? Les produits associés ne seront plus catégorisés.`)) return;
    setSaving(true);
    try { await deleteProductCategory(id, session.token); await reload(); toast.success("Catégorie de produit supprimée."); }
    catch (reason) { const message = reason instanceof Error ? reason.message : "Impossible de supprimer la catégorie."; setError(message); toast.error(message); }
    finally { setSaving(false); }
  };

  return <div className="management-view"><ManagementHeading eyebrow="ADMINISTRATION" title="Catégories de produits" description="Les catégories ci-dessous sont proposées aux commerçants lors de la création d’un produit." />
    <form className="store-category-add" onSubmit={addCategory}><label>Nouvelle catégorie<input required maxLength={100} value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Ex. Artisanat" /></label><button className="button button-dark" disabled={saving || !newName.trim()}><Plus size={15} /> Ajouter</button></form>
    {error ? <p className="auth-error" role="alert">{error}</p> : null}
    {loading ? <p role="status">Chargement des catégories…</p> : <div className="store-category-admin-list">{categories.map((category) => <article className="store-category-admin-row" key={category.id}>{editingId === category.id ? <input aria-label="Nom de la catégorie" maxLength={100} value={editingName} onChange={(event) => setEditingName(event.target.value)} /> : <strong>{category.libellé}</strong>}<div>{editingId === category.id ? <><button type="button" className="button button-dark" disabled={saving || !editingName.trim()} onClick={() => void saveCategory(category.id)}>Enregistrer</button><button type="button" className="button button-quiet" onClick={() => setEditingId(null)}>Annuler</button></> : <><button type="button" className="table-icon-button" aria-label={`Modifier ${category.libellé}`} onClick={() => { setEditingId(category.id); setEditingName(category.libellé); }}><Pencil size={15} /></button><button type="button" className="table-icon-button danger" aria-label={`Supprimer ${category.libellé}`} disabled={saving} onClick={() => void removeCategory(category.id, category.libellé)}><Trash2 size={15} /></button></>}</div></article>)}{!categories.length ? <p>Aucune catégorie définie.</p> : null}</div>}
  </div>;
}

function AdminMissionTypesView() {
  const { session } = useOrion();
  const [missionTypes, setMissionTypes] = useState<MissionTypeRecord[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const reload = async () => {
    setError("");
    try { setMissionTypes(await getMissionTypes()); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Impossible de charger les types de mission."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void reload(); }, []);

  const addType = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session?.token || !newName.trim()) return;
    setSaving(true);
    try { await createMissionType(newName.trim(), session.token); setNewName(""); await reload(); toast.success("Type de mission ajouté."); }
    catch (reason) { const message = reason instanceof Error ? reason.message : "Impossible d’ajouter le type de mission."; setError(message); toast.error(message); }
    finally { setSaving(false); }
  };
  const saveType = async (id: number) => {
    if (!session?.token || !editingName.trim()) return;
    setSaving(true);
    try { await updateMissionType(id, editingName.trim(), session.token); setEditingId(null); setEditingName(""); await reload(); toast.success("Type de mission mis à jour."); }
    catch (reason) { const message = reason instanceof Error ? reason.message : "Impossible de modifier le type de mission."; setError(message); toast.error(message); }
    finally { setSaving(false); }
  };
  const removeType = async (id: number, nom: string) => {
    if (!session?.token || !window.confirm(`Supprimer le type « ${nom} » ? Les opportunités déjà créées garderont leur type.`)) return;
    setSaving(true);
    try { await deleteMissionType(id, session.token); await reload(); toast.success("Type de mission supprimé."); }
    catch (reason) { const message = reason instanceof Error ? reason.message : "Impossible de supprimer le type de mission."; setError(message); toast.error(message); }
    finally { setSaving(false); }
  };

  return <div className="management-view"><ManagementHeading eyebrow="ADMINISTRATION" title="Types de mission" description="Les types ci-dessous sont proposés aux commerçants lors de la création d’une opportunité." />
    <form className="store-category-add" onSubmit={addType}><label>Nouveau type<input required maxLength={100} value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Ex. Stage rémunéré" /></label><button className="button button-dark" disabled={saving || !newName.trim()}><Plus size={15} /> Ajouter</button></form>
    {error ? <p className="auth-error" role="alert">{error}</p> : null}
    {loading ? <p role="status">Chargement des types de mission…</p> : <div className="store-category-admin-list">{missionTypes.map((missionType) => <article className="store-category-admin-row" key={missionType.id}>{editingId === missionType.id ? <input aria-label="Nom du type de mission" maxLength={100} value={editingName} onChange={(event) => setEditingName(event.target.value)} /> : <strong>{missionType.nom}</strong>}<div>{editingId === missionType.id ? <><button type="button" className="button button-dark" disabled={saving || !editingName.trim()} onClick={() => void saveType(missionType.id)}>Enregistrer</button><button type="button" className="button button-quiet" onClick={() => setEditingId(null)}>Annuler</button></> : <><button type="button" className="table-icon-button" aria-label={`Modifier ${missionType.nom}`} onClick={() => { setEditingId(missionType.id); setEditingName(missionType.nom); }}><Pencil size={15} /></button><button type="button" className="table-icon-button danger" aria-label={`Supprimer ${missionType.nom}`} disabled={saving} onClick={() => void removeType(missionType.id, missionType.nom)}><Trash2 size={15} /></button></>}</div></article>)}{!missionTypes.length ? <p>Aucun type de mission défini.</p> : null}</div>}
  </div>;
}

function AdminOrdersView() {
  const { session } = useOrion();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (!session?.token) return;
    getAdminOrders(session.token).then(setOrders).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Impossible de charger les commandes."));
  }, [session?.token]);
  const filtered = orders.filter((order) => `${order.reference} ${order.id} ${order.utilisateur?.email ?? ""} ${order.statut}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <div className="management-view"><ManagementHeading eyebrow="ADMINISTRATION" title="Toutes les commandes" description={`${orders.length} commande${orders.length === 1 ? "" : "s"}, tous les comptes confondus.`} /><div className="management-toolbar"><div className="public-search"><Search size={16} /><input aria-label="Rechercher une commande" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Référence, client ou statut" /></div></div>{error ? <p className="auth-error">{error}</p> : <ManagementTable><div className="management-table-head admin-orders-head"><span>COMMANDE</span><span>CLIENT</span><span>PRODUITS</span><span>DATE</span><span>TOTAL</span><span>STATUT</span></div>{filtered.map((order) => <div className="management-table-row admin-orders-row" key={order.id}><div><strong>{order.reference || `Commande #${order.id}`}</strong><small>#{order.id}</small></div><span>{[order.utilisateur?.prenom, order.utilisateur?.nom].filter(Boolean).join(" ") || order.utilisateur?.email || "Client invité"}</span><span>{order.produits?.map((product) => product.nom).join(", ") || "—"}</span><span>{order.date_achat ? new Date(order.date_achat).toLocaleDateString("fr-FR") : "—"}</span><strong>{formatCfa(Number(order.prix_total ?? 0))}</strong><span className={`status-pill ${order.statut === "payee" ? "status-green" : order.statut === "remboursee" ? "status-coral" : "status-gold"}`}>{order.statut}</span></div>)}</ManagementTable>}</div>;
}

function AdminWalletView() {
  const { session } = useOrion();
  const [wallet, setWallet] = useState<AdminPlatformWallet | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!session?.token) return;
    getAdminWallet(session.token).then(setWallet).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Impossible de charger le portefeuille plateforme."));
  }, [session?.token]);
  return <div className="management-view"><ManagementHeading eyebrow="FINANCES ORION" title="Portefeuille plateforme" description="Suivez les commissions retenues sur les commandes et les remboursements enregistrés." />{error ? <p className="auth-error">{error}</p> : !wallet ? <p>Chargement du portefeuille…</p> : <><section className="wallet-metrics admin-wallet-metrics"><article className="stat-card"><span>Solde plateforme</span><strong>{formatCfa(wallet.solde)}</strong><small>Commissions nettes après remboursements</small></article><article className="stat-card"><span>Commissions cumulées</span><strong>{formatCfa(wallet.totalCommissions)}</strong><small>Retenues comptabilisées</small></article><article className="stat-card"><span>Commissions remboursées</span><strong>{formatCfa(wallet.totalRemboursements)}</strong><small>Reprises lors des remboursements</small></article></section>{wallet.updatedAt ? <p className="withdrawal-note">Dernière mise à jour : {new Date(wallet.updatedAt).toLocaleString("fr-FR")}</p> : null}</>}</div>;
}

function AdminAboutTeamSection() {
  const { session } = useOrion();
  const [members, setMembers] = useState<AboutTeamMember[]>([]);
  const [editing, setEditing] = useState<AboutTeamMember | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [position, setPosition] = useState("0");
  const [photo, setPhoto] = useState<File | undefined>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const refresh = () => getAboutTeam().then(setMembers).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Impossible de charger l’équipe."));
  useEffect(() => { void refresh(); }, []);
  const reset = () => { setEditing(null); setName(""); setRole(""); setBio(""); setPosition(String(members.length)); setPhoto(undefined); };
  const selectMember = (member: AboutTeamMember) => { setEditing(member); setName(member.name); setRole(member.role); setBio(member.bio ?? ""); setPosition(String(member.position)); setPhoto(undefined); };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!session?.token) return;
    setSaving(true); setError("");
    try { await saveAboutTeamMember(session.token, { name, role, bio, position: Number(position) || 0, photo }, editing?.id); await refresh(); reset(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Impossible d’enregistrer ce profil."); }
    finally { setSaving(false); }
  };
  const remove = async (member: AboutTeamMember) => {
    if (!session?.token || !window.confirm(`Supprimer le profil de ${member.name} ?`)) return;
    try { await deleteAboutTeamMember(session.token, member.id); await refresh(); if (editing?.id === member.id) reset(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Impossible de supprimer ce profil."); }
  };
  return <section className="panel admin-team-panel"><div className="panel-heading"><div><span className="public-kicker">PAGE À PROPOS</span><h2>Membres de l’administration</h2></div><span>{members.length} profil{members.length > 1 ? "s" : ""}</span></div><p>Ces profils seront visibles publiquement dans la section « Les personnes derrière ORION ».</p>{error ? <p className="auth-error" role="alert">{error}</p> : null}<div className="admin-team-list">{members.map((member) => <article className="admin-team-row" key={member.id}>{member.photo ? <img src={getUploadUrl(member.photo)} alt="" /> : <span className="admin-team-initials">{member.name.slice(0, 1).toUpperCase()}</span>}<div><strong>{member.name}</strong><span>{member.role}</span></div><button type="button" className="button button-secondary" onClick={() => selectMember(member)}>Modifier</button><button type="button" className="button button-secondary" onClick={() => void remove(member)}>Supprimer</button></article>)}</div><form className="admin-team-form" onSubmit={submit}><h3>{editing ? `Modifier ${editing.name}` : "Ajouter un profil"}</h3><div className="form-grid"><label>Nom affiché<input value={name} onChange={(event) => setName(event.target.value)} required maxLength={120} /></label><label>Fonction<input value={role} onChange={(event) => setRole(event.target.value)} placeholder="Ex. Fondateur, administration…" required maxLength={120} /></label><label className="form-full">Présentation<textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={4} maxLength={1200} placeholder="Quelques mots sur son rôle au sein d’ORION" /></label><label>Ordre d’affichage<input type="number" min="0" value={position} onChange={(event) => setPosition(event.target.value)} /></label><label>Photo de profil<input type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files?.[0])} /></label></div><div className="management-form-actions"><button type="submit" className="button button-dark" disabled={saving}>{saving ? "Enregistrement…" : editing ? "Enregistrer les modifications" : "Ajouter le profil"} <Check size={15} /></button>{editing ? <button type="button" className="button button-secondary" onClick={reset}>Annuler</button> : null}</div></form></section>;
}

function AdminSettingsView() {
  const { session } = useOrion();
  const [settings, setSettings] = useState<SiteSettingsRecord | null>(null);
  const [heroFiles, setHeroFiles] = useState<File[]>([]);
  const [carouselFiles, setCarouselFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { getSiteSettings().then(setSettings).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Impossible de charger les images du site.")); }, []);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session?.token) return;
    setSaving(true); setError(""); setMessage("");
    try {
      setSettings(await saveSiteSettings(session.token, heroFiles, carouselFiles));
      setHeroFiles([]); setCarouselFiles([]); setMessage("Les images de la page d’accueil ont été enregistrées.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Impossible d’enregistrer les images."); }
    finally { setSaving(false); }
  };
  const previewList = (files: File[], existing: string[]) => files.length ? files.map((file) => URL.createObjectURL(file)) : existing.map((file) => getUploadUrl(file));
  const heroPreview = useMemo(() => previewList(heroFiles, settings?.heroImages ?? []), [heroFiles, settings?.heroImages]);
  const carouselPreview = useMemo(() => previewList(carouselFiles, settings?.carouselImages ?? []), [carouselFiles, settings?.carouselImages]);
  useEffect(() => () => [...heroPreview, ...carouselPreview].filter((src) => src.startsWith("blob:")).forEach((src) => URL.revokeObjectURL(src)), [heroPreview, carouselPreview]);
  return <div className="management-view"><ManagementHeading eyebrow="CONTENU PUBLIC" title="Images de la page d’accueil" description="Définissez les trois visuels de l’en-tête et les images du carrousel. Les images sont téléversées dans Orion, aucun lien n’est nécessaire." />{error ? <p className="auth-error">{error}</p> : null}{message ? <p className="handover-success">{message}</p> : null}<form className="admin-settings-form" onSubmit={submit}><section className="panel admin-image-panel"><div className="panel-heading"><div><span className="public-kicker">EN-TÊTE</span><h2>Les trois images principales</h2></div><span>{heroFiles.length ? `${heroFiles.length} sélectionnées` : `${settings?.heroImages.length ?? 0}/3 enregistrées`}</span></div><label className="admin-image-picker"><ImagePlus size={18} /><span>Choisir jusqu’à 3 images</span><input type="file" accept="image/*" multiple onChange={(event) => setHeroFiles(Array.from(event.target.files ?? []).slice(0, 3))} /></label><div className="admin-image-grid">{heroPreview.map((src, index) => <img key={`${src}-${index}`} src={src} alt={`Visuel d’en-tête ${index + 1}`} />)}</div><p>Si vous ne choisissez pas de nouveaux fichiers, les images actuelles restent en place.</p></section><section className="panel admin-image-panel"><div className="panel-heading"><div><span className="public-kicker">CARROUSEL</span><h2>Images qui défilent en bas</h2></div><span>{carouselFiles.length ? `${carouselFiles.length} sélectionnées` : `${settings?.carouselImages.length ?? 0} enregistrées`}</span></div><label className="admin-image-picker"><ImagePlus size={18} /><span>Choisir jusqu’à 10 images</span><input type="file" accept="image/*" multiple onChange={(event) => setCarouselFiles(Array.from(event.target.files ?? []).slice(0, 10))} /></label><div className="admin-image-grid admin-carousel-preview">{carouselPreview.map((src, index) => <img key={`${src}-${index}`} src={src} alt={`Image de carrousel ${index + 1}`} />)}</div><p>Le carrousel reprend l’ordre des fichiers sélectionnés.</p></section><div className="management-form-actions"><button type="submit" className="button button-dark" disabled={saving || !settings}>{saving ? "Enregistrement…" : "Enregistrer les images"} <Check size={15} /></button></div></form><AdminAboutTeamSection /></div>;
}

export function DashboardRouteView({ pathname, role }: ManagementProps) {
  const normalized: string = pathname.replace(/\/$/, "");
  if (role === "ADMIN") {
    if (normalized === "/dashboard/users") return <AdminUsersView />;
    if (normalized === "/dashboard/store-categories") return <AdminStoreCategoriesView />;
    if (normalized === "/dashboard/product-categories") return <AdminProductCategoriesView />;
    if (normalized === "/dashboard/mission-types") return <AdminMissionTypesView />;
    if (normalized === "/dashboard/orders") return <AdminOrdersView />;
    if (normalized === "/dashboard/wallet") return <AdminWalletView />;
    if (normalized === "/dashboard/settings") return <AdminSettingsView />;
    return null;
  }
  if (role !== "COMMERCANT" && normalized.startsWith("/dashboard/opportunities")) {
    if (normalized === "/dashboard/opportunities") return <EntrepreneurOpportunitiesView />;
    return <div className="management-view"><BackButton label="Opportunités" /><ManagementHeading eyebrow="OPPORTUNITÉ" title="Découvrez cette mission" description="Consultez le détail et poursuivez votre candidature depuis le site public." /><button type="button" className="button button-dark" onClick={() => window.location.assign(`/opportunities/${normalized.split("/").pop()}`)}>Voir le détail <ArrowRight size={15} /></button></div>;
  }
  if (normalized === "/dashboard/orders") return role === "COMMERCANT" ? <SellerOrdersView /> : <ClientOrdersView />;
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
  if (normalized.startsWith("/dashboard/opportunities/")) return <OpportunityManagementDetail id={normalized.split("/").pop() ?? ""} />;
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
  if (role === "ADMIN") {
    if (normalized === "/dashboard/store-categories") return { eyebrow: "ADMINISTRATION", title: "Catégories de boutique", description: "Ajoutez et gérez les catégories proposées aux commerçants." };
    if (normalized === "/dashboard/product-categories") return { eyebrow: "ADMINISTRATION", title: "Catégories de produits", description: "Ajoutez et gérez les catégories proposées aux commerçants." };
    if (normalized === "/dashboard/mission-types") return { eyebrow: "ADMINISTRATION", title: "Types de mission", description: "Ajoutez et gérez les types proposés lors de la création d’une opportunité." };
    if (normalized === "/dashboard/users") return { eyebrow: "ADMINISTRATION", title: "Utilisateurs", description: "Consultez tous les comptes Orion et leurs profils." };
    if (normalized === "/dashboard/orders") return { eyebrow: "ADMINISTRATION", title: "Commandes", description: "Suivez toutes les commandes de la plateforme." };
    if (normalized === "/dashboard/wallet") return { eyebrow: "ADMINISTRATION", title: "Portefeuille plateforme", description: "Consultez les commissions et le solde global d’Orion." };
    if (normalized === "/dashboard/settings") return { eyebrow: "ADMINISTRATION", title: "Réglages du site", description: "Gérez les images affichées sur la page d’accueil." };
    return null;
  }
  if (normalized === "/dashboard/stores") return { eyebrow: "COMMERCE", title: "Mes boutiques", description: "Gérez vos espaces de vente et choisissez la boutique active." };
  if (normalized.includes("/stores/add")) return { eyebrow: "NOUVEL ESPACE DE VENTE", title: "Créer une boutique", description: "Présentez votre activité avec une identité claire et accueillante." };
  if (normalized.includes("/stores/edit")) return { eyebrow: "MODIFIER UNE BOUTIQUE", title: "Modifier la boutique", description: "Mettez à jour les informations de votre espace de vente." };
  if (normalized === "/dashboard/products") return { eyebrow: "CATALOGUE", title: "Mes produits", description: "Ajoutez, modifiez et suivez les produits de votre boutique active." };
  if (normalized.includes("/products/add")) return { eyebrow: "NOUVEAU PRODUIT", title: "Ajouter un produit", description: "Donnez aux clients les bonnes informations pour choisir avec confiance." };
  if (normalized.includes("/products/edit")) return { eyebrow: "MODIFIER LE PRODUIT", title: "Modifier le produit", description: "Mettez à jour une fiche produit claire et utile." };
  if (normalized.includes("/products/")) return { eyebrow: "DÉTAIL PRODUIT", title: "Détail du produit", description: "Suivez la performance de ce produit dans votre boutique." };
  if (normalized === "/dashboard/opportunities") return role === "COMMERCANT" ? { eyebrow: "OPPORTUNITÉS PUBLIÉES", title: "Mes opportunités", description: "Publiez des missions qui attirent les bons profils." } : { eyebrow: "MON PARCOURS", title: "Mes candidatures", description: "Suivez les missions auxquelles vous avez postulé et les réponses reçues." };
  if (normalized === "/dashboard/orders") return role === "COMMERCANT"
    ? { eyebrow: "VENTES DE VOTRE BOUTIQUE", title: "Commandes reçues", description: "Consultez les achats de vos produits et gérez les remises aux clients." }
    : { eyebrow: "VOTRE PARCOURS D'ACHAT", title: "Mes commandes", description: "Consultez les achats liés à votre compte Orion." };
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

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, FileText, LifeBuoy, Mail, MessageCircle, Search } from "lucide-react";
import { PublicFooter } from "./PublicPages";
import { ContactEmail } from "../components/ContactEmail";
import { getHelpCategories, type HelpCategory } from "../lib/help-service";
import "../support.css";

// Same address as the footer « Centre d'aide » link.
const SUPPORT_EMAIL = "orionmarket9@gmail.com";
// Togo number (+228); WhatsApp avoids the OS « choose an app » dialog that tel:/mailto: open on desktop.
const SUPPORT_PHONE = "+228 97 79 01 49";
const SUPPORT_WHATSAPP_URL = `https://wa.me/22897790149?text=${encodeURIComponent("Bonjour, j’ai besoin d’aide sur Orion.")}`;
const CONDITIONS_LAST_UPDATE = "28 octobre 2026";

type Article = { id: string; title: string; paragraphs: string[] };

const CONDITIONS: Article[] = [
  { id: "presentation", title: "Présentation et acceptation", paragraphs: [
    "Orion est une plateforme qui met en relation des acheteurs, des commerçants et des porteurs d’opportunités en Afrique. Elle permet de publier et de consulter des produits, des boutiques et des missions.",
    "En créant un compte ou en utilisant Orion, tu acceptes les présentes conditions. Si tu n’es pas d’accord, tu ne dois pas utiliser la plateforme.",
  ] },
  { id: "compte", title: "Inscription et compte", paragraphs: [
    "Tu dois avoir au moins 18 ans, ou l’accord d’un représentant légal, pour créer un compte. Les informations fournies doivent être exactes et à jour.",
    "Le profil choisi à l’inscription (Commerçant ou Jeune entrepreneur) est définitif. Tu es responsable de la confidentialité de ton mot de passe et des actions faites depuis ton compte.",
    "Un seul compte par personne, sauf accord de notre part.",
  ] },
  { id: "role", title: "Rôle d’Orion", paragraphs: [
    "Orion est une plateforme d’intermédiation. Nous ne sommes pas le vendeur des produits publiés par les commerçants et nous ne sommes pas partie au contrat de vente conclu entre un acheteur et un commerçant.",
    "Nous faisons de notre mieux pour vérifier les comptes et les contenus, sans pouvoir garantir la qualité, la légalité ou la disponibilité de chaque produit ou offre.",
  ] },
  { id: "paiements", title: "Achats, paiements et remise", paragraphs: [
    "Les paiements sont traités par notre prestataire FedaPay. Orion ne collecte ni ne conserve aucune donnée bancaire.",
    "Une commande est confirmée lorsque FedaPay valide le paiement. Le montant est alors conservé par Orion jusqu’à la remise de la commande.",
    "À la remise, l’acheteur scanne le QR code présenté par le commerçant. Ce scan confirme la réception et libère le paiement au commerçant : il ne doit être fait qu’une fois la commande reçue.",
    "Les frais éventuels de l’opérateur de paiement restent à la charge de la personne qui paie, sauf indication contraire.",
  ] },
  { id: "commercants", title: "Obligations des commerçants", paragraphs: [
    "Le commerçant s’engage à publier des informations exactes (description, prix, photos, stock), à livrer les produits commandés et payés, et à respecter les lois applicables.",
    "L’offre Standard gratuite permet une boutique et jusqu’à 40 produits. Il est interdit de vendre des produits illégaux, contrefaits, dangereux ou réglementés sans autorisation.",
  ] },
  { id: "opportunites", title: "Opportunités", paragraphs: [
    "Les missions publiées dans la section Opportunités sont sous la responsabilité de leur auteur. Orion n’est pas l’employeur et ne garantit ni l’obtention d’une mission ni l’exactitude d’une offre.",
    "La publication d’une mission est payante (500 FCFA). Elle devient visible après confirmation du paiement par FedaPay.",
  ] },
  { id: "interdits", title: "Comportements interdits", paragraphs: [
    "Il est interdit d’utiliser Orion pour tromper ou escroquer d’autres utilisateurs, usurper une identité, publier des contenus illégaux, violents, haineux ou à caractère sexuel, envoyer du spam ou perturber le fonctionnement de la plateforme.",
    "Il est aussi interdit de demander un paiement en dehors d’Orion pour contourner les règles de la plateforme, ou de collecter les données d’autres utilisateurs sans autorisation.",
  ] },
  { id: "responsabilite", title: "Responsabilité et litiges", paragraphs: [
    "En cas de problème avec une commande, contacte d’abord le commerçant par la messagerie. Si le problème n’est pas résolu, écris au support avec ta référence de commande : nous pouvons aider à la médiation, sans obligation de résultat.",
    "Dans la limite permise par la loi, Orion n’est pas responsable des pertes liées à une transaction entre utilisateurs, à une interruption du service ou à un événement indépendant de notre volonté (panne de réseau ou d’un opérateur de paiement, par exemple).",
  ] },
  { id: "suspension", title: "Suspension et fermeture de compte", paragraphs: [
    "Nous pouvons suspendre ou supprimer un compte, ou retirer un contenu, en cas de non-respect de ces conditions, de fraude ou de signalements sérieux.",
    "Tu peux demander la fermeture de ton compte à tout moment en nous écrivant.",
  ] },
  { id: "donnees", title: "Données personnelles", paragraphs: [
    "Nous utilisons tes données uniquement pour faire fonctionner Orion : compte, commandes, livraison, paiements, sécurité et support.",
  ] },
  { id: "modification", title: "Modification des conditions", paragraphs: [
    "Nous pouvons modifier ces conditions. En cas de changement important, nous t’en informons sur la plateforme. Continuer à utiliser Orion après la modification vaut acceptation des nouvelles conditions.",
  ] },
  { id: "droit", title: "Droit applicable et contact", paragraphs: [
    "Ces conditions sont régies par le droit togolais. En cas de litige non résolu à l’amiable, les tribunaux compétents de Lomé seront saisis.",
    `Pour toute question sur ces conditions, écris-nous à ${SUPPORT_EMAIL}.`,
  ] },
];

function SupportHero({ kicker, title, copy, children }: { kicker: string; title: string; copy: string; children?: ReactNode }) {
  return <section className="marketplace-hero support-hero"><div className="marketplace-hero-pattern" aria-hidden="true"><span>✳</span><span>◈</span><span>◎</span></div><div className="support-hero-copy"><span className="marketplace-hero-kicker">{kicker}</span><h1>{title}</h1><p>{copy}</p>{children}</div><span className="marketplace-hero-mark" aria-hidden="true">O</span></section>;
}

function SupportContact({ title, copy, secondary }: { title: string; copy: string; secondary: { to: string; label: string } }) {
  return <aside className="support-contact"><span className="support-contact-icon"><LifeBuoy size={22} /></span><div><h2>{title}</h2><p>{copy}</p></div><div className="support-contact-actions"><ContactEmail email={SUPPORT_EMAIL} className="public-primary-button"><Mail size={16} /> Écrire au support</ContactEmail><a className="public-secondary-button" href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> WhatsApp · {SUPPORT_PHONE}</a><Link className="public-secondary-button" to={secondary.to}>{secondary.label} <ArrowRight size={15} /></Link></div></aside>;
}

export function HelpPage() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<number | "all">("all");
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    let isMounted = true;
    getHelpCategories()
      .then((rows) => { if (isMounted) setCategories(rows); })
      .catch((error: unknown) => { if (isMounted) setLoadError(error instanceof Error ? error.message : "Impossible de charger l’aide."); })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, []);
  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fr-FR");
    return categories
      .filter((category) => active === "all" || category.id === active)
      .map((category) => ({ ...category, questions: category.questions.filter((question) => !normalized || `${question.titre} ${question.description}`.toLocaleLowerCase("fr-FR").includes(normalized)) }))
      .filter((category) => category.questions.length > 0);
  }, [categories, query, active]);

  return <><main className="support-page">
    <SupportHero kicker="CENTRE D’AIDE ORION" title="Comment pouvons-nous t’aider ?" copy="Trouve une réponse rapide, ou écris-nous directement.">
      <label className="support-search"><Search size={17} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Paiement, commande, boutique, compte…" aria-label="Rechercher dans l’aide" /></label>
    </SupportHero>
    <div className="support-body">
    <nav className="support-tabs" aria-label="Catégories d’aide">
      <button type="button" className={active === "all" ? "is-active" : ""} aria-pressed={active === "all"} onClick={() => setActive("all")}>Tout</button>
      {categories.map((category) => <button type="button" key={category.id} className={active === category.id ? "is-active" : ""} aria-pressed={active === category.id} onClick={() => setActive(category.id)}>{category.titre}</button>)}
    </nav>
    <div className="support-faq">
      {loading ? <p className="support-empty" role="status">Chargement de l’aide…</p> : loadError ? <p className="support-empty" role="alert">{loadError}</p> : results.length === 0 ? <p className="support-empty">{query.trim() ? `Aucune réponse ne correspond à « ${query} ». Essaie un autre mot, ou contacte le support ci-dessous.` : "Aucune question d’aide pour le moment. Contacte le support ci-dessous."}</p> : null}
      {results.map((category) => <section key={category.id} className="support-faq-section">
        <div className="support-faq-heading">{category.description ? <span className="public-kicker">{category.description.toUpperCase()}</span> : null}<h2>{category.titre}</h2></div>
        <div className="support-faq-list">{category.questions.map((question) => <details key={question.id} className="support-faq-item"><summary>{question.titre}<ChevronDown size={16} /></summary><p>{question.description}</p></details>)}</div>
      </section>)}
    </div>
    <SupportContact title="Tu n’as pas trouvé ta réponse ?" copy="Notre équipe te répond généralement dans la journée." secondary={{ to: "/conditions", label: "Conditions d’utilisation" }} />
    </div>
  </main><PublicFooter /></>;
}

export function ConditionsPage() {
  return <><main className="support-page">
    <SupportHero kicker="CONDITIONS D’UTILISATION" title="Les règles d’Orion" copy={`Dernière mise à jour : ${CONDITIONS_LAST_UPDATE}. Elles protègent les acheteurs, les commerçants et la plateforme.`} />
    <div className="support-body">
    <div className="conditions-layout">
      <nav className="conditions-toc" aria-label="Sommaire"><div className="conditions-toc-heading"><FileText size={15} /><strong>Sommaire</strong></div><ol>{CONDITIONS.map((article, index) => <li key={article.id}><a href={`#${article.id}`}><span>{String(index + 1).padStart(2, "0")}</span>{article.title}</a></li>)}</ol></nav>
      <div className="conditions-articles">
        {CONDITIONS.map((article, index) => <article key={article.id} id={article.id} className="conditions-article"><span className="conditions-article-index">{String(index + 1).padStart(2, "0")}</span><div><h2>{article.title}</h2>{article.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></article>)}
      </div>
    </div>
    <SupportContact title="Une question sur ces conditions ?" copy="Notre équipe peut t’expliquer n’importe quel point." secondary={{ to: "/aide", label: "Voir le centre d’aide" }} />
    </div>
  </main><PublicFooter /></>;
}

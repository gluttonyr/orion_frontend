import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, FileText, LifeBuoy, Mail, Search } from "lucide-react";
import { PublicFooter } from "./PublicPages";
import "../support.css";

// Same address as the footer « Centre d'aide » link.
const SUPPORT_EMAIL = "support@orion.africa";
const CONDITIONS_LAST_UPDATE = "28 octobre 2026";

type Faq = { q: string; a: string };
type HelpCategory = { id: string; title: string; hint: string; faqs: Faq[] };

const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: "compte",
    title: "Compte et connexion",
    hint: "Créer un compte, se connecter, modifier son profil",
    faqs: [
      { q: "Comment créer un compte sur Orion ?", a: "Clique sur « Créer mon compte » depuis la page de connexion, renseigne ton e-mail et un mot de passe, puis choisis ton profil : Commerçant ou Jeune entrepreneur. Tu peux ensuite compléter ton profil à tout moment." },
      { q: "Puis-je changer de profil après l’inscription ?", a: "Non. Le profil Commerçant ou Jeune entrepreneur est choisi à l’inscription et reste définitif. Si tu as besoin d’un autre profil, contacte le support." },
      { q: "J’ai oublié mon mot de passe. Que faire ?", a: `Écris au support à ${SUPPORT_EMAIL} depuis l’adresse e-mail de ton compte : l’équipe t’aidera à retrouver l’accès.` },
      { q: "Comment modifier mes informations personnelles ?", a: "Depuis ton tableau de bord, ouvre « Profil » pour mettre à jour ton nom, tes coordonnées et ta photo." },
    ],
  },
  {
    id: "acheter",
    title: "Acheter un produit",
    hint: "Commander, payer, recevoir sa commande",
    faqs: [
      { q: "Comment passer une commande ?", a: "Ajoute les produits à ton panier depuis la marketplace, puis ouvre le panier et clique sur « Payer ». Tu dois être connecté pour finaliser la commande." },
      { q: "Comment indiquer mon adresse de livraison ?", a: "Au moment du paiement, colle un lien Google Maps de ton adresse ou utilise le bouton de position pour partager ta position actuelle." },
      { q: "Quels modes de paiement sont acceptés ?", a: "Le paiement se fait sur la page sécurisée de FedaPay, avec les moyens qu’elle propose (Mobile Money notamment). Orion ne collecte aucune donnée bancaire." },
      { q: "Quand ma commande est-elle confirmée ?", a: "Dès que FedaPay confirme le paiement, la commande passe au statut payé et apparaît dans « Mes commandes ». Tu n’as aucune référence à saisir." },
      { q: "Comment confirmer la réception de ma commande ?", a: "À la remise, le vendeur te montre un QR code. Scanne-le depuis « Mes commandes » (ou importe une photo du QR) : cela confirme la réception et libère le paiement au vendeur. Ne scanne le QR qu’une fois la commande reçue." },
    ],
  },
  {
    id: "vendre",
    title: "Vendre sur Orion",
    hint: "Boutique, produits, commandes reçues",
    faqs: [
      { q: "Comment devenir commerçant ?", a: "Choisis le profil Commerçant lors de ton inscription, puis crée ta boutique depuis ton tableau de bord." },
      { q: "Combien coûte l’ouverture d’une boutique ?", a: "L’offre Standard est gratuite : elle comprend une boutique et jusqu’à 40 produits." },
      { q: "Comment publier un produit ?", a: "Dans ton tableau de bord, ouvre « Mes produits » et ajoute un produit : nom, prix, catégorie, stock, description et photos. Tu peux aussi définir un prix promotionnel." },
      { q: "Quand suis-je payé ?", a: "Le montant d’une commande payée est bloqué jusqu’à la remise. Génère le QR de remise depuis tes commandes reçues et fais-le scanner par le client : le montant est alors libéré dans ton portefeuille Orion." },
    ],
  },
  {
    id: "opportunites",
    title: "Opportunités",
    hint: "Postuler, publier une mission",
    faqs: [
      { q: "Que sont les opportunités ?", a: "Ce sont des missions publiées par des commerçants : emploi, collaboration, prestation. Les jeunes entrepreneurs peuvent y postuler directement." },
      { q: "Comment postuler à une opportunité ?", a: "Ouvre l’offre et envoie ta candidature. Tu suis sa réponse (en attente, acceptée ou refusée) dans « Mes candidatures »." },
      { q: "Combien coûte la publication d’une mission ?", a: "La publication coûte 500 FCFA, payés via FedaPay. La mission devient visible dès que le paiement est confirmé." },
    ],
  },
  {
    id: "securite",
    title: "Sécurité et litiges",
    hint: "Arnaques, problème avec un vendeur",
    faqs: [
      { q: "Comment éviter les arnaques ?", a: "Paie toujours dans Orion, jamais en dehors de la plateforme. Ne scanne le QR de remise qu’après avoir reçu ta commande et ne partage jamais ton code secret Mobile Money." },
      { q: "J’ai un problème avec un vendeur. Que faire ?", a: `Contacte d’abord le vendeur par la messagerie. Si le problème persiste, écris à ${SUPPORT_EMAIL} avec ta référence de commande et des captures d’écran.` },
      { q: "Comment signaler un produit ou un compte suspect ?", a: `Écris à ${SUPPORT_EMAIL} en indiquant le lien du produit ou de la boutique concernée. L’équipe examine chaque signalement.` },
    ],
  },
];

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
  return <aside className="support-contact"><span className="support-contact-icon"><LifeBuoy size={22} /></span><div><h2>{title}</h2><p>{copy}</p></div><div className="support-contact-actions"><a className="public-primary-button" href={`mailto:${SUPPORT_EMAIL}`}><Mail size={16} /> Écrire au support</a><Link className="public-secondary-button" to={secondary.to}>{secondary.label} <ArrowRight size={15} /></Link></div></aside>;
}

export function HelpPage() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("all");
  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fr-FR");
    return HELP_CATEGORIES
      .filter((category) => active === "all" || category.id === active)
      .map((category) => ({ ...category, faqs: category.faqs.filter((faq) => !normalized || `${faq.q} ${faq.a}`.toLocaleLowerCase("fr-FR").includes(normalized)) }))
      .filter((category) => category.faqs.length > 0);
  }, [query, active]);

  return <><main className="marketplace-page support-page">
    <SupportHero kicker="CENTRE D’AIDE ORION" title="Comment pouvons-nous t’aider ?" copy="Trouve une réponse rapide, ou écris-nous directement.">
      <label className="support-search"><Search size={17} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Paiement, commande, boutique, compte…" aria-label="Rechercher dans l’aide" /></label>
    </SupportHero>
    <nav className="support-tabs" aria-label="Catégories d’aide">
      <button type="button" className={active === "all" ? "is-active" : ""} aria-pressed={active === "all"} onClick={() => setActive("all")}>Tout</button>
      {HELP_CATEGORIES.map((category) => <button type="button" key={category.id} className={active === category.id ? "is-active" : ""} aria-pressed={active === category.id} onClick={() => setActive(category.id)}>{category.title}</button>)}
    </nav>
    <div className="support-faq">
      {results.length === 0 ? <p className="support-empty">Aucune réponse ne correspond à « {query} ». Essaie un autre mot, ou contacte le support ci-dessous.</p> : null}
      {results.map((category) => <section key={category.id} className="support-faq-section">
        <div className="support-faq-heading"><span className="public-kicker">{category.hint.toUpperCase()}</span><h2>{category.title}</h2></div>
        <div className="support-faq-list">{category.faqs.map((faq) => <details key={faq.q} className="support-faq-item"><summary>{faq.q}<ChevronDown size={16} /></summary><p>{faq.a}</p></details>)}</div>
      </section>)}
    </div>
    <SupportContact title="Tu n’as pas trouvé ta réponse ?" copy="Notre équipe te répond généralement dans la journée." secondary={{ to: "/conditions", label: "Conditions d’utilisation" }} />
  </main><PublicFooter /></>;
}

export function ConditionsPage() {
  return <><main className="marketplace-page support-page">
    <SupportHero kicker="CONDITIONS D’UTILISATION" title="Les règles d’Orion" copy={`Dernière mise à jour : ${CONDITIONS_LAST_UPDATE}. Elles protègent les acheteurs, les commerçants et la plateforme.`} />
    <div className="conditions-layout">
      <nav className="conditions-toc" aria-label="Sommaire"><div className="conditions-toc-heading"><FileText size={15} /><strong>Sommaire</strong></div><ol>{CONDITIONS.map((article, index) => <li key={article.id}><a href={`#${article.id}`}><span>{String(index + 1).padStart(2, "0")}</span>{article.title}</a></li>)}</ol></nav>
      <div className="conditions-articles">
        {CONDITIONS.map((article, index) => <article key={article.id} id={article.id} className="conditions-article"><span className="conditions-article-index">{String(index + 1).padStart(2, "0")}</span><div><h2>{article.title}</h2>{article.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></article>)}
      </div>
    </div>
    <SupportContact title="Une question sur ces conditions ?" copy="Notre équipe peut t’expliquer n’importe quel point." secondary={{ to: "/aide", label: "Voir le centre d’aide" }} />
  </main><PublicFooter /></>;
}

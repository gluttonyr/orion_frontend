import { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader, type IScannerControls } from '@zxing/browser';
import { CheckCircle2, Download, Info, Lock, QrCode, RefreshCw, RotateCcw, ScanLine, Search, ShoppingBag, Wallet } from 'lucide-react';
import '../wallet.css';
import { useOrion } from '../OrionContext';
import { confirmHandover, createHandoverQr, getSellerRemises, getSellerWallet, type SellerOrderRemise, type SellerWallet } from '../lib/wallet-service';
import { OrionLoader } from "./OrionLoader";
import { ListPagination, usePagination } from "./ListPagination";

const money = (value: number) => `${Number(value ?? 0).toLocaleString('fr-FR')} FCFA`;

export function SellerHandoverWallet() {
  const { session } = useOrion();
  const [wallet, setWallet] = useState<SellerWallet | null>(null);
  const [orders, setOrders] = useState<SellerOrderRemise[]>([]);
  const ordersPage = usePagination(orders);
  const [qr, setQr] = useState<{ content: string; qrDataUrl: string; venteId: number } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const refresh = () => {
    if (!session?.token) return;
    setLoading(true);
    Promise.all([getSellerWallet(session.token), getSellerRemises(session.token)])
      .then(([balance, sales]) => { setWallet(balance); setOrders(sales); setError(''); })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Impossible de charger le portefeuille.'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { refresh(); }, [session?.token]);
  const generate = async (order: SellerOrderRemise) => {
    if (!session?.token) return;
    try { setQr(await createHandoverQr(order.remiseId, session.token)); setError(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Impossible de générer le QR.'); }
  };
  const totalEarned = (wallet?.disponible ?? 0) + (wallet?.bloque ?? 0);
  const releasedCount = orders.filter((order) => order.statut === 'liberee').length;
  const blockedCount = orders.filter((order) => order.statut === 'bloquee').length;
  return <div className="view-stack seller-wallet">
    <section className="seller-wallet-hero">
      <div className="seller-wallet-hero-main">
        <span className="seller-wallet-kicker"><Wallet size={14} /> SOLDE LIBÉRÉ</span>
        <strong className="seller-wallet-balance">{loading && !wallet ? '…' : money(wallet?.disponible ?? 0)}</strong>
        <p>Ventes confirmées par vos clients. Total gagné sur Orion : <b>{money(totalEarned)}</b></p>
      </div>
      <div className="seller-wallet-hero-side">
        <div className="seller-wallet-pending"><span>À recevoir après remise</span><strong>{money(wallet?.bloque ?? 0)}</strong><small>{blockedCount} commande{blockedCount > 1 ? 's' : ''} à remettre</small></div>
        <button type="button" className="seller-wallet-refresh" onClick={refresh} disabled={loading}><RefreshCw size={15} className={loading ? 'is-spinning' : ''} /> Actualiser</button>
      </div>
    </section>

    <section className="seller-wallet-metrics">
      <article className="seller-wallet-metric is-pending"><span className="seller-wallet-metric-icon"><Lock size={18} /></span><div><span className="seller-wallet-metric-label">Montant bloqué</span><strong>{money(wallet?.bloque ?? 0)}</strong><small>Libéré dès que le client scanne le QR de remise.</small></div></article>
      <article className="seller-wallet-metric is-released"><span className="seller-wallet-metric-icon"><CheckCircle2 size={18} /></span><div><span className="seller-wallet-metric-label">Montant libéré</span><strong>{money(wallet?.disponible ?? 0)}</strong><small>{releasedCount} remise{releasedCount > 1 ? 's' : ''} confirmée{releasedCount > 1 ? 's' : ''} par vos clients.</small></div></article>
      <article className="seller-wallet-metric is-refunded"><span className="seller-wallet-metric-icon"><RotateCcw size={18} /></span><div><span className="seller-wallet-metric-label">Remboursé</span><strong>{money(wallet?.rembourse ?? 0)}</strong><small>Commandes annulées et remboursées au client.</small></div></article>
    </section>

    <section className="seller-wallet-howto">
      <div className="seller-wallet-howto-heading"><Info size={16} /><h3>Comment vous êtes payé</h3></div>
      <ol>
        <li><span>1</span><div><strong>Le client paie</strong><p>L’argent est sécurisé par Orion et apparaît en « Montant bloqué ».</p></div></li>
        <li><span>2</span><div><strong>Vous remettez la commande</strong><p>Générez le QR ci-dessous : le client le scanne à la livraison et le montant passe en « libéré ».</p></div></li>
        <li><span>3</span><div><strong>Versement sur votre Mobile Money</strong><p>{wallet?.versementAutomatiqueActif ? 'Le montant libéré est versé automatiquement sur votre compte Mobile Money.' : 'Le virement automatique n’est pas encore activé : l’équipe Orion vous verse vos montants libérés. Contactez le support pour organiser le versement.'}</p></div></li>
      </ol>
    </section>

    {error ? <p className="auth-error" role="alert">{error}</p> : null}
    {qr ? <section className="panel handover-qr-panel"><div><p className="eyebrow">COMMANDE #{qr.venteId}</p><h2>QR de remise</h2><p>Le client doit le scanner depuis son compte Orion pour libérer les fonds.</p><img src={qr.qrDataUrl} alt={`QR de remise pour la commande ${qr.venteId}`} width="240" height="240" /><a className="button button-dark" href={qr.qrDataUrl} download={`orion-commande-${qr.venteId}-qr.png`}><Download size={15} /> Télécharger le QR</a></div></section> : null}

    <section className="seller-wallet-orders">
      <div className="seller-wallet-orders-heading"><div><span className="seller-wallet-kicker-dark">COMMANDES VENDEUR</span><h2>Remises et fonds</h2></div><span>{orders.length} commande{orders.length > 1 ? 's' : ''}</span></div>
      {loading ? <OrionLoader label="Chargement du portefeuille…" /> : orders.length === 0 ? <div className="seller-orders-empty"><ShoppingBag size={24} /><p>Aucune commande payée pour le moment.</p></div> : <div className="seller-wallet-order-list">{ordersPage.pageItems.map((order) => {
        const status = order.statut === 'bloquee' ? { label: 'Payée · à remettre', tone: 'status-gold' } : order.statut === 'liberee' ? { label: 'Remise confirmée · fonds libérés', tone: 'status-green' } : { label: 'Remboursée', tone: 'status-coral' };
        return <article className="seller-wallet-order" key={order.remiseId}>
          <div className="seller-wallet-order-main">
            <div className="seller-wallet-order-title"><strong>Commande #{order.venteId}</strong><span className={`status-pill ${status.tone}`}>{status.label}</span></div>
            <p>{order.articles.map((item) => `${item.nom} × ${item.quantite}`).join(', ')}</p>
            {order.commissionMontant > 0 ? <dl className="seller-wallet-breakdown"><div><dt>Prix de vente</dt><dd>{money(order.montantBrut)}</dd></div><div><dt>Commission Orion ({order.commissionPourcentage} %)</dt><dd>− {money(order.commissionMontant)}</dd></div><div className="is-total"><dt>Vous recevez</dt><dd>{money(order.montant)}</dd></div></dl> : null}
          </div>
          <div className="seller-wallet-order-side"><strong>{money(order.montant)}</strong>{order.statut === 'bloquee' ? <button type="button" className="button button-dark" onClick={() => generate(order)}><QrCode size={15} /> Générer le QR</button> : null}</div>
        </article>;
      })}<ListPagination {...ordersPage} /></div>}
    </section>
  </div>;
}

export function SellerOrdersView() {
  const { session } = useOrion();
  const [orders, setOrders] = useState<SellerOrderRemise[]>([]);
  const [filter, setFilter] = useState<'all' | 'bloquee' | 'liberee' | 'remboursee'>('all');
  const [query, setQuery] = useState('');
  const [qr, setQr] = useState<{ content: string; qrDataUrl: string; venteId: number } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!session?.token) { setOrders([]); setLoading(false); return; }
    setLoading(true);
    try { setOrders(await getSellerRemises(session.token)); setError(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Impossible de charger les commandes.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void refresh(); }, [session?.token]);

  const generate = async (order: SellerOrderRemise) => {
    if (!session?.token) return;
    try { setQr(await createHandoverQr(order.remiseId, session.token)); setError(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Impossible de générer le QR.'); }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filter === 'all' || order.statut === filter;
    const searchable = `${order.vente?.reference ?? ''} ${order.venteId} ${order.articles.map((item) => item.nom).join(' ')}`.toLowerCase();
    return matchesStatus && searchable.includes(query.toLowerCase().trim());
  });
  const filteredOrdersPage = usePagination(filteredOrders);
  const paidOrders = orders.filter((order) => order.statut === 'bloquee' || order.statut === 'liberee');
  const paidTotal = paidOrders.reduce((total, order) => total + order.montant, 0);
  const waitingCount = orders.filter((order) => order.statut === 'bloquee').length;

  return <div className="view-stack seller-orders-view">
    <section className="seller-order-summary"><article><span>COMMANDES</span><strong>{loading ? '…' : orders.length}</strong></article><article><span>VENTES PAYÉES</span><strong>{loading ? '…' : money(paidTotal)}</strong></article><article><span>REMISES À CONFIRMER</span><strong>{loading ? '…' : waitingCount}</strong></article></section>
    {qr ? <section className="panel handover-qr-panel"><div><p className="eyebrow">COMMANDE #{qr.venteId}</p><h2>QR de remise</h2><p>Le client le scanne depuis son compte Orion pour confirmer la remise.</p><img src={qr.qrDataUrl} alt={`QR de remise pour la commande ${qr.venteId}`} width="220" height="220" /><a className="button button-dark" href={qr.qrDataUrl} download={`orion-commande-${qr.venteId}-qr.png`}><Download size={15} /> Télécharger le QR</a></div></section> : null}
    <section className="panel seller-order-list-panel"><div className="panel-heading"><div><p className="eyebrow">VENTES DE VOTRE BOUTIQUE</p><h2>Commandes reçues</h2></div><button type="button" className="button button-quiet" onClick={() => void refresh()} disabled={loading}><RefreshCw size={15} /> Actualiser</button></div>
      <div className="seller-order-toolbar"><div className="public-search"><Search size={16} /><input aria-label="Rechercher une commande" placeholder="Référence, numéro ou produit" value={query} onChange={(event) => setQuery(event.target.value)} /></div><div className="seller-order-filters"><button type="button" className={filter === 'all' ? 'is-active' : ''} onClick={() => setFilter('all')}>Toutes</button><button type="button" className={filter === 'bloquee' ? 'is-active' : ''} onClick={() => setFilter('bloquee')}>À remettre</button><button type="button" className={filter === 'liberee' ? 'is-active' : ''} onClick={() => setFilter('liberee')}>Remises</button><button type="button" className={filter === 'remboursee' ? 'is-active' : ''} onClick={() => setFilter('remboursee')}>Remboursées</button></div></div>
      {error ? <p className="auth-error" role="alert">{error}</p> : null}
      {loading ? <OrionLoader label="Chargement des commandes…" /> : filteredOrders.length === 0 ? <div className="seller-orders-empty"><ShoppingBag size={24} /><p>{orders.length ? 'Aucune commande ne correspond à ces filtres.' : 'Vous n’avez pas encore reçu de commande.'}</p></div> : <div className="seller-orders-list">{filteredOrdersPage.pageItems.map((order) => {
        const label = order.statut === 'bloquee' ? 'Payée · à remettre' : order.statut === 'liberee' ? 'Remise confirmée' : order.statut === 'remboursee' ? 'Remboursée' : 'En attente de paiement';
        const statusClass = order.statut === 'bloquee' ? 'status-gold' : order.statut === 'liberee' ? 'status-green' : order.statut === 'remboursee' ? 'status-coral' : '';
        return <article className="seller-order-card" key={order.remiseId}><div className="seller-order-card-main"><div className="seller-order-card-heading"><div><span className="public-kicker">{order.vente?.reference || `COMMANDE #${order.venteId}`}</span><small>{order.date ? new Date(order.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Date indisponible'}</small></div><span className={`status-pill ${statusClass}`}>{label}</span></div><div className="seller-order-articles">{order.articles.map((item, index) => <span key={`${item.nom}-${index}`}>{item.nom} <b>× {item.quantite}</b></span>)}</div></div><div className="seller-order-card-total"><strong>{money(order.montant)}</strong>{order.commissionMontant > 0 ? <small>{money(order.montantBrut)} − commission {order.commissionPourcentage}% ({money(order.commissionMontant)})</small> : null}{order.statut === 'bloquee' ? <button type="button" className="button button-dark" onClick={() => void generate(order)}><QrCode size={15} /> Générer le QR</button> : null}</div></article>;
      })}<ListPagination {...filteredOrdersPage} /></div>}
    </section>
  </div>;
}

export function ClientHandoverScanner({ token, orderId, onConfirmed }: { token: string; orderId: number; onConfirmed: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => () => controlsRef.current?.stop(), []);
  const submitContent = async (content: string) => {
    if (!content.startsWith('ORION-HANDOVER:')) { setError('Ce QR ne correspond pas à une remise Orion.'); return; }
    try {
      await confirmHandover(content, orderId, token);
      setMessage('Remise confirmée. Le montant a été libéré pour le vendeur.');
      setError(''); onConfirmed();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Impossible de confirmer cette remise.'); }
  };
  const startCamera = async () => {
    if (!videoRef.current) return;
    try {
      setError(''); setScanning(true);
      const reader = new BrowserQRCodeReader();
      controlsRef.current = await reader.decodeFromVideoDevice(undefined, videoRef.current, (result, _error, controls) => {
        if (!result) return;
        controls.stop(); setScanning(false); void submitContent(result.getText());
      });
    } catch { setScanning(false); setError('Caméra indisponible. Autorisez son accès ou importez une image du QR.'); }
  };
  const readImage = async (file?: File) => {
    if (!file) return;
    try {
      const url = URL.createObjectURL(file);
      const result = await new BrowserQRCodeReader().decodeFromImageUrl(url);
      URL.revokeObjectURL(url);
      await submitContent(result.getText());
    } catch { setError('Aucun QR Orion lisible dans cette image.'); }
  };
  return <div className="handover-scanner"><div className="handover-scanner-actions"><button type="button" className="button button-dark" onClick={startCamera} disabled={scanning}><ScanLine size={15} /> {scanning ? 'Caméra active…' : 'Scanner avec la caméra'}</button><label className="button button-quiet"><QrCode size={15} /> Importer une image<input type="file" accept="image/*" onChange={(event) => void readImage(event.target.files?.[0])} /></label></div><video ref={videoRef} className="handover-video" style={{ display: scanning ? 'block' : 'none' }} muted playsInline />{message ? <p className="handover-success"><CheckCircle2 size={16} /> {message}</p> : null}{error ? <p className="auth-error" role="alert">{error}</p> : null}</div>;
}

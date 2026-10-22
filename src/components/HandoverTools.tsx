import { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { CheckCircle2, Download, QrCode, RefreshCw, ScanLine, Search, ShoppingBag } from 'lucide-react';
import { useOrion } from '../OrionContext';
import { confirmHandover, createHandoverQr, getSellerRemises, getSellerWallet, type SellerOrderRemise, type SellerWallet } from '../lib/wallet-service';

const money = (value: number) => `${Number(value ?? 0).toLocaleString('fr-FR')} FCFA`;

export function SellerHandoverWallet() {
  const { session } = useOrion();
  const [wallet, setWallet] = useState<SellerWallet | null>(null);
  const [orders, setOrders] = useState<SellerOrderRemise[]>([]);
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
  return <div className="view-stack">
    <div className="wallet-overview"><div><p className="card-overline light">SOLDE DISPONIBLE</p><div className="wallet-overview-amount">{money(wallet?.disponible ?? 0)}</div><p>En attente de remise : {money(wallet?.bloque ?? 0)}</p></div><button type="button" className="wallet-outline-button" onClick={refresh}><RefreshCw size={15} /> Actualiser</button></div>
    <div className="wallet-metrics"><article className="stat-card"><span>Montant bloqué</span><strong>{money(wallet?.bloque ?? 0)}</strong><small>Libéré après validation du QR par le client</small></article><article className="stat-card"><span>Montant libéré</span><strong>{money(wallet?.disponible ?? 0)}</strong><small>Versement externe à configurer auprès de FedaPay</small></article><article className="stat-card"><span>Remboursé</span><strong>{money(wallet?.rembourse ?? 0)}</strong><small>Commandes remboursées</small></article></div>
    {wallet ? <p className="withdrawal-note"><span>{wallet.messageVersement}</span></p> : null}
    {error ? <p className="auth-error" role="alert">{error}</p> : null}
    {qr ? <section className="panel handover-qr-panel"><div><p className="eyebrow">COMMANDE #{qr.venteId}</p><h2>QR de remise</h2><p>Le client doit le scanner depuis son compte Orion pour libérer les fonds.</p><img src={qr.qrDataUrl} alt={`QR de remise pour la commande ${qr.venteId}`} width="240" height="240" /><a className="button button-dark" href={qr.qrDataUrl} download={`orion-commande-${qr.venteId}-qr.png`}><Download size={15} /> Télécharger le QR</a></div></section> : null}
    <section className="panel"><div className="panel-heading"><div><p className="eyebrow">COMMANDES VENDEUR</p><h2>Remises et fonds</h2></div></div>{loading ? <p>Chargement…</p> : orders.length === 0 ? <p>Aucune commande payée pour le moment.</p> : <div className="handover-order-list">{orders.map((order) => <article className="handover-order" key={order.remiseId}><div><strong>Commande #{order.venteId} · {money(order.montant)}</strong><p>{order.articles.map((item) => `${item.nom} × ${item.quantite}`).join(', ')}</p>{order.commissionMontant > 0 ? <small>Brut {money(order.montantBrut)} · commission {order.commissionPourcentage}% ({money(order.commissionMontant)}) · net vendeur {money(order.montant)}</small> : null}<span className={`status-pill ${order.statut === 'liberee' ? 'status-green' : order.statut === 'bloquee' ? 'status-gold' : ''}`}>{order.statut === 'bloquee' ? 'Payée · fonds bloqués' : order.statut === 'liberee' ? 'Remise confirmée · fonds libérés' : 'Remboursée'}</span></div>{order.statut === 'bloquee' ? <button type="button" className="button button-dark" onClick={() => generate(order)}><QrCode size={15} /> Générer le QR</button> : null}</article>)}</div>}</section>
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
  const paidOrders = orders.filter((order) => order.statut === 'bloquee' || order.statut === 'liberee');
  const paidTotal = paidOrders.reduce((total, order) => total + order.montant, 0);
  const waitingCount = orders.filter((order) => order.statut === 'bloquee').length;

  return <div className="view-stack seller-orders-view">
    <section className="seller-order-summary"><article><span>COMMANDES</span><strong>{loading ? '…' : orders.length}</strong></article><article><span>VENTES PAYÉES</span><strong>{loading ? '…' : money(paidTotal)}</strong></article><article><span>REMISES À CONFIRMER</span><strong>{loading ? '…' : waitingCount}</strong></article></section>
    {qr ? <section className="panel handover-qr-panel"><div><p className="eyebrow">COMMANDE #{qr.venteId}</p><h2>QR de remise</h2><p>Le client le scanne depuis son compte Orion pour confirmer la remise.</p><img src={qr.qrDataUrl} alt={`QR de remise pour la commande ${qr.venteId}`} width="220" height="220" /><a className="button button-dark" href={qr.qrDataUrl} download={`orion-commande-${qr.venteId}-qr.png`}><Download size={15} /> Télécharger le QR</a></div></section> : null}
    <section className="panel seller-order-list-panel"><div className="panel-heading"><div><p className="eyebrow">VENTES DE VOTRE BOUTIQUE</p><h2>Commandes reçues</h2></div><button type="button" className="button button-quiet" onClick={() => void refresh()} disabled={loading}><RefreshCw size={15} /> Actualiser</button></div>
      <div className="seller-order-toolbar"><div className="public-search"><Search size={16} /><input aria-label="Rechercher une commande" placeholder="Référence, numéro ou produit" value={query} onChange={(event) => setQuery(event.target.value)} /></div><div className="seller-order-filters"><button type="button" className={filter === 'all' ? 'is-active' : ''} onClick={() => setFilter('all')}>Toutes</button><button type="button" className={filter === 'bloquee' ? 'is-active' : ''} onClick={() => setFilter('bloquee')}>À remettre</button><button type="button" className={filter === 'liberee' ? 'is-active' : ''} onClick={() => setFilter('liberee')}>Remises</button><button type="button" className={filter === 'remboursee' ? 'is-active' : ''} onClick={() => setFilter('remboursee')}>Remboursées</button></div></div>
      {error ? <p className="auth-error" role="alert">{error}</p> : null}
      {loading ? <p className="seller-empty-state">Chargement des commandes…</p> : filteredOrders.length === 0 ? <div className="seller-orders-empty"><ShoppingBag size={24} /><p>{orders.length ? 'Aucune commande ne correspond à ces filtres.' : 'Vous n’avez pas encore reçu de commande.'}</p></div> : <div className="seller-orders-list">{filteredOrders.map((order) => {
        const label = order.statut === 'bloquee' ? 'Payée · à remettre' : order.statut === 'liberee' ? 'Remise confirmée' : order.statut === 'remboursee' ? 'Remboursée' : 'En attente de paiement';
        const statusClass = order.statut === 'bloquee' ? 'status-gold' : order.statut === 'liberee' ? 'status-green' : order.statut === 'remboursee' ? 'status-coral' : '';
        return <article className="seller-order-card" key={order.remiseId}><div className="seller-order-card-main"><div className="seller-order-card-heading"><div><span className="public-kicker">{order.vente?.reference || `COMMANDE #${order.venteId}`}</span><small>{order.date ? new Date(order.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Date indisponible'}</small></div><span className={`status-pill ${statusClass}`}>{label}</span></div><div className="seller-order-articles">{order.articles.map((item, index) => <span key={`${item.nom}-${index}`}>{item.nom} <b>× {item.quantite}</b></span>)}</div></div><div className="seller-order-card-total"><strong>{money(order.montant)}</strong>{order.commissionMontant > 0 ? <small>{money(order.montantBrut)} − commission {order.commissionPourcentage}% ({money(order.commissionMontant)})</small> : null}{order.statut === 'bloquee' ? <button type="button" className="button button-dark" onClick={() => void generate(order)}><QrCode size={15} /> Générer le QR</button> : null}</div></article>;
      })}</div>}
    </section>
  </div>;
}

export function ClientHandoverScanner({ token, orderId, onConfirmed }: { token: string; orderId: number; onConfirmed: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => () => readerRef.current?.reset(), []);
  const submitContent = async (content: string) => {
    if (!content.startsWith('ORION-HANDOVER:')) { setError('Ce QR ne correspond pas à une remise Orion.'); return; }
    try {
      const result = await confirmHandover(content, orderId, token);
      setMessage('Remise confirmée. Le montant a été libéré pour le vendeur.');
      setError(''); onConfirmed();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Impossible de confirmer cette remise.'); }
  };
  const startCamera = async () => {
    if (!videoRef.current) return;
    try {
      setError(''); setScanning(true);
      const reader = new BrowserQRCodeReader(); readerRef.current = reader;
      await reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
        if (!result) return;
        reader.reset(); setScanning(false); void submitContent(result.getText());
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

import { useRef, useState } from "react";
import { LoaderCircle, MapPin } from "lucide-react";
import { resolveStoreLocation } from "../lib/store-service";

// Google Maps link or current position, shown as a readable place name. Shared by the store form and the checkout.
export function LocationField({ value, onChange, token, fallbackLabel = "", required = false }: { value: string; onChange: (value: string) => void; token?: string; fallbackLabel?: string; required?: boolean }) {
  const [focused, setFocused] = useState(false);
  const [resolvedLabel, setResolvedLabel] = useState("");
  const [resolving, setResolving] = useState(false);
  const [locating, setLocating] = useState(false);
  const requestId = useRef(0);

  const capturePosition = (): void => {
    if (!navigator.geolocation) { window.alert("La géolocalisation n’est pas disponible sur cet appareil."); return; }
    if (locating) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      requestId.current += 1;
      setResolvedLabel("");
      onChange(`https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`);
      setLocating(false);
    }, () => {
      window.alert("Position inaccessible. Autorisez la géolocalisation ou collez un lien Google Maps.");
      setLocating(false);
    }, { enableHighAccuracy: true, timeout: 12000 });
  };

  const handleBlur = async (): Promise<void> => {
    setFocused(false);
    const rawLocation = value.trim();
    if (!rawLocation || !/^https:\/\//i.test(rawLocation) || !token) return;
    const currentRequest = ++requestId.current;
    setResolving(true);
    try {
      const result = await resolveStoreLocation(rawLocation, token);
      if (requestId.current === currentRequest && result.label) setResolvedLabel(result.label);
    } catch {
      // Le lien reste enregistré et le résumé local sert de solution de repli.
    } finally {
      if (requestId.current === currentRequest) setResolving(false);
    }
  };

  const summary = (): string => {
    if (resolvedLabel) return resolvedLabel;
    if (!value.trim()) return "";
    try {
      const url = new URL(value);
      const placeSegment = url.pathname.match(/\/place\/([^/]+)/i)?.[1];
      const query = url.searchParams.get("query") || url.searchParams.get("q");
      const candidate = placeSegment ? decodeURIComponent(placeSegment.replaceAll("+", " ")) : query;
      if (candidate && !/^-?\d+(\.\d+)?[, ]+-?\d+(\.\d+)?$/.test(candidate.trim())) {
        return candidate.replaceAll("+", " ").replace(/\s+/g, " ").trim();
      }
      if (/google\.[^/]+\/maps/i.test(value)) return fallbackLabel.trim() || "Position enregistrée";
    } catch { /* Le texte saisi n’est pas une URL : il reste lisible tel quel. */ }
    return value;
  };

  return <span className="store-location-input-wrap"><input required={required} value={focused ? value : resolving ? "Recherche du lieu…" : summary()} onFocus={() => setFocused(true)} onBlur={() => void handleBlur()} onChange={(event) => { requestId.current += 1; onChange(event.target.value); setResolvedLabel(""); }} placeholder="Collez un lien Google Maps" /><button type="button" className="store-location-button" onClick={capturePosition} disabled={locating} aria-label={locating ? "Recherche de votre position" : "Utiliser ma position actuelle"} title={locating ? "Recherche de votre position…" : "Utiliser ma position actuelle"}>{locating ? <LoaderCircle className="store-location-spinner" size={16} /> : <MapPin size={16} />}</button></span>;
}

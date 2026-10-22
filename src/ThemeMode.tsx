import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Moon, Sun } from "lucide-react";

type ThemeMode = "light" | "dark";
const ThemeModeContext = createContext<{ mode: ThemeMode; toggle: () => void } | null>(null);

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => localStorage.getItem("orion-theme") === "dark" ? "dark" : "light");
  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    localStorage.setItem("orion-theme", mode);
    document.documentElement.style.colorScheme = mode;
  }, [mode]);
  const value = useMemo(() => ({ mode, toggle: () => setMode((current) => current === "dark" ? "light" : "dark") }), [mode]);
  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function ThemeModeButton({ className = "topbar-icon-button" }: { className?: string }) {
  const theme = useContext(ThemeModeContext);
  if (!theme) return null;
  const Icon = theme.mode === "dark" ? Sun : Moon;
  return <button type="button" className={className} aria-label={theme.mode === "dark" ? "Activer le thème clair" : "Activer le mode sombre"} title={theme.mode === "dark" ? "Mode clair" : "Mode sombre"} onClick={theme.toggle}><Icon size={19} strokeWidth={1.8} /></button>;
}

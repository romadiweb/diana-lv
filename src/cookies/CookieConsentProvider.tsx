import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getStoredConsent, storeConsent, type CookieConsent } from "./consent";
import { supabase } from "../lib/supabase";

type CookieConsentContextValue = {
  consent: CookieConsent | null;
  isOpen: boolean;
  open: () => void;
  close: () => void;

  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (prefs: { analytics: boolean }) => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

async function trySyncToSupabase(consent: CookieConsent) {
  try {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

    await supabase.auth.updateUser({
      data: { consent },
    });
  } catch {
    // silent
  }
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    setConsent(stored);
    if (!stored) setIsOpen(true);
  }, []);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const acceptAll = () => {
    const next = storeConsent({ analytics: true });
    setConsent(next);
    setIsOpen(false);
    void trySyncToSupabase(next);
  };

  const rejectAll = () => {
    const next = storeConsent({ analytics: false });
    setConsent(next);
    setIsOpen(false);
    void trySyncToSupabase(next);
  };

  const savePreferences = (prefs: { analytics: boolean }) => {
    const next = storeConsent({ analytics: prefs.analytics });
    setConsent(next);
    setIsOpen(false);
    void trySyncToSupabase(next);
  };

  const value = useMemo(
    () => ({
      consent,
      isOpen,
      open,
      close,
      acceptAll,
      rejectAll,
      savePreferences,
    }),
    [consent, isOpen]
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) throw new Error("useCookieConsent must be used inside CookieConsentProvider");
  return ctx;
}

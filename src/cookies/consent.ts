export type CookieConsent = {
  version: number;
  necessary: true; // always true
  analytics: boolean;
  decidedAt: string; // ISO
};

const STORAGE_KEY = "consent";
const CONSENT_VERSION = 1;

export function getStoredConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CookieConsent;

    // Basic validation + versioning
    if (
      !parsed ||
      parsed.version !== CONSENT_VERSION ||
      parsed.necessary !== true ||
      typeof parsed.analytics !== "boolean" ||
      typeof parsed.decidedAt !== "string"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function storeConsent(input: Omit<CookieConsent, "version" | "necessary" | "decidedAt"> & Partial<Pick<CookieConsent, "decidedAt">>): CookieConsent {
  const consent: CookieConsent = {
    version: CONSENT_VERSION,
    necessary: true,
    analytics: !!input.analytics,
    decidedAt: input.decidedAt ?? new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  return consent;
}

export function clearStoredConsent() {
  localStorage.removeItem(STORAGE_KEY);
}

export function hasDecided(): boolean {
  return !!getStoredConsent();
}

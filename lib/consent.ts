/**
 * Consent copy shown next to each checkbox. If you change the wording, bump the version
 * so each stored consent records exactly what the person agreed to.
 */
export const CONSENT_VERSION = "2026-11-10.v1";

export const consentText = {
  email: "Send me launch updates and occasional marketing emails from Veerly. Unsubscribe anytime.",
  whatsapp: "Notify me on WhatsApp when Veerly launches.",
} as const;

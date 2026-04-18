/**
 * @file smsTemplates.js
 * @description Pure utility functions for building PingMe Smart Bracelet SMS alert messages.
 *
 * DESIGN PRINCIPLE — Mandatory + Customizable:
 *   Every outgoing emergency SMS is composed of two layers:
 *     1. Mandatory fields (Name, Emergency Level, Location Link) — auto-injected, never editable.
 *     2. Custom help phrase — the single sentence the bracelet owner can personalize.
 *
 * The safe-status message is fully automatic; no customization is needed.
 */

/** Default phrase used when no custom phrase has been saved by the user. */
export const DEFAULT_HELP_PHRASE = "I need help!";

/**
 * Human-readable severity labels keyed by the numeric SOS level stored in Firestore.
 *   Level 1 → MILD      (minor incident, still alert)
 *   Level 2 → MODERATE  (needs attention soon)
 *   Level 3 → SEVERE    (critical, immediate response required)
 */
export const LEVEL_LABEL = {
  1: "MILD",
  2: "MODERATE",
  3: "SEVERE",
};

/**
 * Builds the tracking URL embedded in every emergency SMS.
 * Points to the live PingMe map pre-centred on the bracelet's coordinates.
 *
 * @param {number}  lat        - WGS-84 latitude
 * @param {number}  lng        - WGS-84 longitude
 * @param {string}  braceletId - Firestore document ID of the bracelet (e.g. "PM-2026-001")
 * @returns {string} Absolute URL
 */
export function buildLocationUrl(lat, lng, braceletId) {
  const base = "https://ping-me-now.netlify.app";
  if (lat == null || lng == null) return base;
  const params = new URLSearchParams({
    lat: Number(lat).toFixed(6),
    lng: Number(lng).toFixed(6),
    id: braceletId ?? "",
  });
  return `${base}/track?${params.toString()}`;
}

/**
 * Assembles the full emergency SMS string.
 *
 * Format:
 *   "Smart Bracelet Alert - TUPM [SEVERE Emergency]. This is Jerome. I need help!
 *   Track me on the app: https://ping-me-now.netlify.app/track?..."
 *
 * @param {string} name        - Bracelet owner's full name (from appUsers profile)
 * @param {number} sosLevel    - Numeric severity (1 | 2 | 3); defaults to 1 if invalid
 * @param {string} locationUrl - Pre-built tracking URL from buildLocationUrl()
 * @param {string} [customPhrase] - User-customized middle phrase; falls back to default
 * @returns {string} Complete SMS body (≤ 160 chars recommended but not enforced here)
 */
export function buildEmergencySms(name, sosLevel, locationUrl, customPhrase) {
  const level = LEVEL_LABEL[sosLevel] ?? LEVEL_LABEL[1];
  const phrase = (customPhrase || DEFAULT_HELP_PHRASE).trim();
  return (
    `Smart Bracelet Alert - TUPM [${level} Emergency]. ` +
    `This is ${name}. ${phrase} ` +
    `Track me on the app: ${locationUrl}`
  );
}

/**
 * Assembles the follow-up "all clear" SMS sent when SOS is deactivated.
 *
 * Format:
 *   "Smart Bracelet Alert - TUPM. Jerome is now safe."
 *
 * @param {string} name - Bracelet owner's full name
 * @returns {string} Complete SMS body
 */
export function buildSafeSms(name) {
  return `Smart Bracelet Alert - TUPM. ${name} is now safe.`;
}

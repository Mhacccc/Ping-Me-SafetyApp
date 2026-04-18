/**
 * @file smsService.js
 * @description PingMe SMS gateway integration using the Semaphore Philippines SMS API.
 *
 * ─── SETUP ───────────────────────────────────────────────────────────────────
 * 1. Sign up at https://semaphore.co and create an account.
 * 2. Copy your API key from the Semaphore dashboard.
 * 3. Paste it as the value of SEMAPHORE_API_KEY below.
 * 4. Set SENDER_NAME to your Semaphore-approved sender name (max 11 chars).
 *
 * If the key is left empty, the service logs a warning and skips all sends —
 * the rest of the app (SOS report generation, UI) continues to work normally.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Configuration ────────────────────────────────────────────────────────────
const SEMAPHORE_API_KEY = "";   // ← Paste your Semaphore API key here
const SEMAPHORE_URL    = "https://api.semaphore.co/api/v4/messages";
const SENDER_NAME      = "PingMe";  // Semaphore sender name (up to 11 chars)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalises a Philippine mobile number to the Semaphore-accepted format (09XXXXXXXXX).
 * Accepts:  09XXXXXXXXX | +639XXXXXXXXX | 639XXXXXXXXX
 * Returns:  09XXXXXXXXX  or  null if unrecognised.
 *
 * @param {string} raw
 * @returns {string|null}
 */
function normaliseNumber(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.startsWith("63") && digits.length === 12) {
    return "0" + digits.slice(2);   // 639XXXXXXXXX → 09XXXXXXXXX
  }
  if (digits.startsWith("09") && digits.length === 11) {
    return digits;
  }
  return null;
}

/**
 * Sends a single SMS to one recipient via the Semaphore API.
 * Errors are caught and logged — they never propagate to callers.
 *
 * @param {string} number  - Mobile number (any accepted PH format)
 * @param {string} message - Full SMS body
 * @returns {Promise<void>}
 */
async function sendOne(number, message) {
  const normalised = normaliseNumber(number);
  if (!normalised) {
    console.warn(`[smsService] Skipped invalid number: "${number}"`);
    return;
  }

  try {
    const body = new URLSearchParams({
      apikey:      SEMAPHORE_API_KEY,
      number:      normalised,
      message,
      sendername:  SENDER_NAME,
    });

    const res = await fetch(SEMAPHORE_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    body.toString(),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "(unreadable)");
      console.error(`[smsService] API error ${res.status} for ${normalised}: ${text}`);
      return;
    }

    const data = await res.json().catch(() => null);
    console.info(`[smsService] ✔ Sent to ${normalised}`, data ?? "");
  } catch (err) {
    console.error(`[smsService] Network error for ${normalised}:`, err);
  }
}

/**
 * Sends the same SMS message to every contact in the provided list.
 * Silently skips if no API key is configured or the list is empty.
 *
 * @param {Array<{contactNo: string, name: string}>} contacts - Emergency contact objects
 * @param {string} message - Fully assembled SMS body (from smsTemplates.js)
 * @returns {Promise<void>}
 */
export async function sendSms(contacts, message) {
  if (!SEMAPHORE_API_KEY) {
    console.warn(
      "[smsService] SEMAPHORE_API_KEY is not configured. " +
      "SMS will not be sent. Set the key in src/services/smsService.js."
    );
    return;
  }

  if (!contacts || contacts.length === 0) {
    console.warn("[smsService] No emergency contacts — SMS skipped.");
    return;
  }

  // Fire all sends in parallel; individual errors are handled inside sendOne()
  await Promise.allSettled(
    contacts.map((c) => sendOne(c.contactNo, message))
  );
}

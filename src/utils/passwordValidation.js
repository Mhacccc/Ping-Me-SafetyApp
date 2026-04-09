/**
 * Password validation utility for PingMe sign-up.
 * Enforces a strong password policy:
 *  - Minimum 8 characters
 *  - At least one uppercase letter (A-Z)
 *  - At least one lowercase letter (a-z)
 *  - At least one digit (0-9)
 *  - At least one special character (!@#$%^&*…)
 */

/** Individual rule definitions — each has an id, label, and test function. */
export const PASSWORD_RULES = [
  {
    id: "minLength",
    label: "At least 8 characters",
    test: (pw) => pw.length >= 8,
  },
  {
    id: "uppercase",
    label: "One uppercase letter (A-Z)",
    test: (pw) => /[A-Z]/.test(pw),
  },
  {
    id: "lowercase",
    label: "One lowercase letter (a-z)",
    test: (pw) => /[a-z]/.test(pw),
  },
  {
    id: "number",
    label: "One number (0-9)",
    test: (pw) => /[0-9]/.test(pw),
  },
  {
    id: "special",
    label: "One special character (!@#$%^&*…)",
    test: (pw) => /[^A-Za-z0-9]/.test(pw),
  },
];

/**
 * Runs every rule against the given password.
 * @param {string} password
 * @returns {{ id: string, label: string, passed: boolean }[]}
 */
export function checkPasswordRules(password) {
  return PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    passed: rule.test(password),
  }));
}

/**
 * Returns the number of rules passed (0-5).
 * Useful for rendering a strength bar.
 * @param {string} password
 * @returns {number}
 */
export function getPasswordStrengthScore(password) {
  return PASSWORD_RULES.filter((rule) => rule.test(password)).length;
}

/**
 * Maps a strength score to a human-readable label and color token.
 * @param {number} score  0-5
 * @returns {{ label: string, level: 'empty'|'weak'|'fair'|'good'|'strong' }}
 */
export function getStrengthMeta(score) {
  if (score === 0) return { label: "",         level: "empty"  };
  if (score <= 1)  return { label: "Very Weak", level: "weak"   };
  if (score === 2) return { label: "Weak",      level: "weak"   };
  if (score === 3) return { label: "Fair",      level: "fair"   };
  if (score === 4) return { label: "Good",      level: "good"   };
  return             { label: "Strong",     level: "strong" };
}

/**
 * Returns true only when ALL password rules pass.
 * @param {string} password
 * @returns {boolean}
 */
export function isPasswordValid(password) {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}

/**
 * Returns a single human-readable error string for the first failing rule,
 * or null if the password is valid. Suitable for form-level error display.
 * @param {string} password
 * @returns {string|null}
 */
export function getPasswordError(password) {
  const failed = PASSWORD_RULES.find((rule) => !rule.test(password));
  if (!failed) return null;
  return `Password must include: ${failed.label.toLowerCase()}.`;
}

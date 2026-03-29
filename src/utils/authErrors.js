/**
 * Maps Firebase Auth error codes to user-friendly, descriptive error messages.
 * @param {Object} error - The error object caught from Firebase Auth.
 * @returns {string} - A friendly error message.
 */
export const getAuthErrorMessage = (error) => {
  if (!error) return "An unknown error occurred.";

  const code = error.code;

  switch (code) {
    // Login / Common
    case "auth/invalid-email":
      return "The email address you entered is not valid.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/user-not-found":
      return "No account found with this email. Please sign up first.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/invalid-credential":
      return "Invalid email or password. Please check your credentials.";
    case "auth/email-not-verified":
      return "Please verify your email address. Check your inbox for the verification link.";
    
    // Signup
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/operation-not-allowed":
      return "Email/password accounts are not enabled. Contact support.";
    case "auth/weak-password":
      return "Your password is too weak. Please use a stronger password.";
    
    // Google Auth / Popup
    case "auth/popup-closed-by-user":
      return "The sign-in popup was closed before completion. Please try again.";
    case "auth/cancelled-by-user":
      return "The sign-in request was cancelled. Please try again.";
    case "auth/popup-blocked":
      return "The sign-in popup was blocked by your browser. Please enable popups for this site.";
    
    // System
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    case "auth/too-many-requests":
      return "Too many attempts. Your account has been temporarily locked for security. Please try again later.";
    case "auth/internal-error":
      return "An internal server error occurred. Please try again later.";
    
    default:
      // Try to clean up the default message if it's a standard Firebase error string
      return error.message
        ? error.message.replace("Firebase: ", "").replace(/\(auth\/.*\)\.?/, "").trim()
        : "An unexpected error occurred. Please try again.";
  }
};

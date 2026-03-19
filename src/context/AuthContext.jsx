import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebaseConfig';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Handle Redirect Result (for PWA/Mobile)
  async function handleRedirectResult() {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        const user = result.user;
        const userDocRef = doc(db, 'appUsers', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          // Clear Google photoURL
          await updateProfile(user, { photoURL: "" });

          await setDoc(userDocRef, {
            name: user.displayName,
            email: user.email,
            linkedBraceletsID: [],
            createdAt: serverTimestamp()
          });
        }
      }
    } catch (error) {
      console.error("Redirect sign-in error:", error);
    }
  }

  async function signInWithGoogle() {
    // Detect if the app is running in "standalone" mode (installed PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isStandalone) {
      // Use redirect for better PWA compatibility on mobile
      return signInWithRedirect(auth, googleProvider);
    } else {
      // Use popup for a smoother desktop/browser experience
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDocRef = doc(db, 'appUsers', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await updateProfile(user, { photoURL: "" });
        await setDoc(userDocRef, {
          name: user.displayName,
          email: user.email,
          linkedBraceletsID: [],
          createdAt: serverTimestamp()
        });
      }
      return result;
    }
  }

  // Email/Password Signup: Creates Auth user AND appUsers document
  async function signup(email, password, name) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update the Auth profile with the display name
    await updateProfile(user, {
      displayName: name
    });
    
    // Create the appUser document
    await setDoc(doc(db, 'appUsers', user.uid), {
      name: name,
      email: email,
      linkedBraceletsID: [], // Initialize empty array for bracelets
      createdAt: serverTimestamp()
    });
    
    return userCredential;
  }

  // Email/Password Login
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Password Reset Email
  async function resetPassword(email) {
    // Firebase sendPasswordResetEmail is silent for security (to avoid email enumeration).
    // We manually check Firestore to see if the user exists first to give better feedback.
    const q = query(collection(db, 'appUsers'), where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      const error = new Error("No account found with this email.");
      error.code = "auth/user-not-found";
      throw error;
    }

    return sendPasswordResetEmail(auth, email);
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    // Check for redirect result on mount (for PWAs after redirect back)
    handleRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // If the avatar is from Google, clear it to let the app's default (red.webp) take over.
        // Users can still upload their own custom avatar via the Account page later.
        if (user.photoURL && user.photoURL.includes("googleusercontent.com")) {
          try {
            await updateProfile(user, { photoURL: "" });
          } catch (error) {
            console.error("Error clearing Google photoURL:", error);
          }
        }

        // If user is logged in but has no displayName, try to sync it from Firestore
        if (!user.displayName) {
          try {
            const userDocRef = doc(db, 'appUsers', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists() && userDoc.data().name) {
              await updateProfile(user, { displayName: userDoc.data().name });
            }
          } catch (error) {
            console.error("Error syncing displayName:", error);
          }
        }
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    signInWithGoogle,
    resetPassword,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
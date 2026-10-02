import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  role: "client" | "lawyer" | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  username: string | null;
  signInWithGoogle: (selectedRole?: "client" | "lawyer") => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signUpWithEmail: (
    name: string,
    email: string,
    password: string,
    role: "client" | "lawyer",
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const PROFILE_OPERATION_TIMEOUT_MS = 8000;

const withProfileTimeout = <T,>(operation: Promise<T>): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () =>
        reject(
          new Error(
            "Firestore is taking too long to respond. Check that Cloud Firestore is enabled for this project.",
          ),
        ),
      PROFILE_OPERATION_TIMEOUT_MS,
    );
  });

  return Promise.race([operation, timeout]).finally(() => {
    if (timer !== undefined) clearTimeout(timer);
  });
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"client" | "lawyer" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authInitialized = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!authInitialized.current) setIsLoading(true);
      setUser(currentUser);

      if (currentUser) {
        try {
          const userDoc = await withProfileTimeout(
            getDoc(doc(db, "users", currentUser.uid)),
          );
          if (userDoc.exists()) {
            const userRole = userDoc.data().role;
            setRole(
              userRole === "client" || userRole === "lawyer" ? userRole : null,
            );
          } else {
            setRole(null);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setRole(null);
        }
      } else {
        setRole(null);
      }

      authInitialized.current = true;
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async (selectedRole?: "client" | "lawyer") => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userRef = doc(db, "users", result.user.uid);
      const userDoc = await withProfileTimeout(getDoc(userRef));

      if (!userDoc.exists()) {
        const role = selectedRole || "client";
        await withProfileTimeout(
          setDoc(userRef, {
            name: result.user.displayName || "",
            email: result.user.email || "",
            role,
            createdAt: serverTimestamp(),
          }),
        );

        if (role === "lawyer") {
          await withProfileTimeout(
            setDoc(doc(db, "lawyers", result.user.uid), {
              name: result.user.displayName || "New lawyer",
              specialty: "General Law",
              experience: "0 years",
              location: "",
              fees: "Contact for pricing",
              languages: ["English"],
              verified: false,
              available: true,
              image: "/placeholder.svg",
              consultations: 0,
              successRate: 0,
              reviews: 0,
              rating: 0,
              description: "New lawyer profile. Add your details to go live.",
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }),
          );
        }
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error signing in with email:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (
    name: string,
    email: string,
    password: string,
    role: "client" | "lawyer",
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await updateProfile(userCredential.user, { displayName: name });

      const userRef = doc(db, "users", userCredential.user.uid);
      try {
        await withProfileTimeout(
          setDoc(userRef, {
            name,
            email,
            role,
            createdAt: serverTimestamp(),
          }),
        );

        if (role === "lawyer") {
          await withProfileTimeout(
            setDoc(doc(db, "lawyers", userCredential.user.uid), {
              name,
              specialty: "General Law",
              experience: "0 years",
              location: "",
              fees: "Contact for pricing",
              languages: ["English"],
              verified: false,
              available: true,
              image: "/placeholder.svg",
              consultations: 0,
              successRate: 0,
              reviews: 0,
              rating: 0,
              description: "New lawyer profile. Add your details to go live.",
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }),
          );
        }
      } catch (profileError) {
        console.error(
          "Firebase account created but profile setup failed:",
          profileError,
        );
        throw new Error(
          "Your sign-in account may have been created, but its profile could not be saved. Enable Cloud Firestore for this Firebase project, then sign in again.",
        );
      }
    } catch (error) {
      console.error("Error signing up with email:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const isLoggedIn = !!user;
  const username = user?.displayName || user?.email || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoggedIn,
        isLoading,
        username,
        signInWithGoogle,
        signInWithEmail,
        sendPasswordReset,
        signUpWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDaSArCTwM6mWtC7i9Zf5EKz_oQHj1S-2c",
  authDomain: "legal-sangam.web.app",
  databaseURL: "https://legalsangam-1f3a5-default-rtdb.firebaseio.com",
  projectId: "legalsangam-1f3a5",
  storageBucket: "legalsangam-1f3a5.firebasestorage.app",
  messagingSenderId: "794101922613",
  appId: "1:794101922613:web:4dfcc59c57b3127635aa7c",
  measurementId: "G-457D2JJ0H2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);
export default app;

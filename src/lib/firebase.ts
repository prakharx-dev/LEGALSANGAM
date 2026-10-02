// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFGkqIO4z5znOZ3T2MUoyMOmmOGHfOtwQ",
  authDomain: "prakharx-4c900.firebaseapp.com",
  databaseURL:
    "https://prakharx-4c900-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "prakharx-4c900",
  storageBucket: "prakharx-4c900.firebasestorage.app",
  messagingSenderId: "203496841627",
  appId: "1:203496841627:web:eb83c588e5bd2c76a6c13e",
  measurementId: "G-X0F5K01EZH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);
export default app;

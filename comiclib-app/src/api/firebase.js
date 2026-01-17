import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_REACT_APP_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_REACT_APP_FIREBASE_APP_ID

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log(app.name);  // "[DEFAULT]"
console.log(firebaseConfig)
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connectivity Check Helper
export const checkConnection = async () => {
  try {
    // Try to fetch a dummy document with a short timeout
    //const docRef = doc(db, 'system', 'connectivity_check');
    const docRef = doc(db, 'addDoc', 'TPYnUheBVuAu2FA44EjG');
    // Create a timeout promise
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), 5000); // 5s timeout
    });

    // Race the fetch against the timeout
    await Promise.race([
      getDoc(docRef),
      timeout
    ]);

    return true;
  } catch (error) {
    console.error("Firebase Connection Check Failed:", error);
    return false;
  }
};

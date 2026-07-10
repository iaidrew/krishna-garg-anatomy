import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD8a92pVEZXLI54wMw0KPg1SV8Wi0wOCY8",
  authDomain: "gen-lang-client-0641957408.firebaseapp.com",
  projectId: "gen-lang-client-0641957408",
  storageBucket: "gen-lang-client-0641957408.firebasestorage.app",
  messagingSenderId: "998963845226",
  appId: "1:998963845226:web:d4583a41c914e7388e9213"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom databaseId
export const db = getFirestore(app, "ai-studio-krishnagarganato-e128fd92-c1df-4679-b7b7-3e0fa006194d");

// Initialize Authentication
export const auth = getAuth(app);

// Initialize Cloud Storage for durable study-material attachments
export const storage = getStorage(app);

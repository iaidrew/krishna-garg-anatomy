import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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

/**
 * Detects the correct server-side API base URL.
 * If running locally in dev or directly on the container, relative paths ("") are used.
 * If running on Netlify (or other external hostnames), it falls back to the Cloud Run server.
 */
export function getApiBaseUrl(): string {
  const hostname = window.location.hostname;
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.includes(".run.app")
  ) {
    return "";
  }
  
  // Expose configuration via Vite env var if provided, else fallback to the applet's Cloud Run server
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  return "https://ais-dev-kemlx2hqfliwwwvi77jrc2-300664365715.asia-east1.run.app";
}


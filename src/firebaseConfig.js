// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ⬇️ Replace these with your Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyDKsagbIn6cbw4Ugcs0M7lR0upSaTsuoyo",
  authDomain: "sayfe-e15fb.firebaseapp.com",
  databaseURL: "https://sayfe-e15fb-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "sayfe-e15fb",
  storageBucket: "sayfe-e15fb.firebasestorage.app",
  messagingSenderId: "48378767033",
  appId: "1:48378767033:web:db02ad57ccbc4e7ecfdd68",
  measurementId: "G-6QLV8ED70D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

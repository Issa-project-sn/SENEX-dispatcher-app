import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDD7IObDBJ10OmirkKchRupokI42XJFzUo",
  authDomain: "senex-livraison.firebaseapp.com",
  projectId: "senex-livraison",
  storageBucket: "senex-livraison.firebasestorage.app",
  messagingSenderId: "516916890769",
  appId: "1:516916890769:web:2ee669abc22926db2e8330",
  measurementId: "G-PMEP98H974"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

export { db, auth };
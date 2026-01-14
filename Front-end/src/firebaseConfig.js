import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyA-C3TOIgAA8LesAuTgNam-vZEwAdrw8J0",
    authDomain: "code-sync-c45ea.firebaseapp.com",
    projectId: "code-sync-c45ea",
    storageBucket: "code-sync-c45ea.firebasestorage.app",
    messagingSenderId: "44788945834",
    appId: "1:44788945834:web:d11875f9d8d44abc0c51d3",
    measurementId: "G-BPQZKN6XN9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

export { auth, db, rtdb, analytics };
export default app;

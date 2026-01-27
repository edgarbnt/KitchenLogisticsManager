// kitchen-log/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAapOS5Z8tnMxGLk9dr9rPEhV9gIu8O4Hg",
    authDomain: "kitchenlogisticmanager.firebaseapp.com",
    projectId: "kitchenlogisticmanager",
    storageBucket: "kitchenlogisticmanager.firebasestorage.app",
    messagingSenderId: "1039107902703",
    appId: "1:1039107902703:web:67c89b5f98da2b81f75f1a",
    measurementId: "G-KKCF08HGW5"
};

// Singleton pattern pour éviter les initialisations multiples
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
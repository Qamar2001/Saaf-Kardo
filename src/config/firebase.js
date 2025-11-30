import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyC8T1dllyFPEerUAIZzacLdIRVYEiKnW8w",
    authDomain: "saaf-kardo.firebaseapp.com",
    projectId: "saaf-kardo",
    storageBucket: "saaf-kardo.firebasestorage.app",
    messagingSenderId: "807287178144",
    appId: "1:807287178144:web:13ca2dffe65f2af7855ac5",
    measurementId: "G-65L429F1QZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

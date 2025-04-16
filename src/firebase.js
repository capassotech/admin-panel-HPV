// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBiq1JVYxAteGujLGDaP5FDPiROIpZWKBU",
    authDomain: "hpv-desarrollo.firebaseapp.com",
    databaseURL: "https://hpv-desarrollo-default-rtdb.firebaseio.com",
    projectId: "hpv-desarrollo",
    storageBucket: "hpv-desarrollo.firebasestorage.app",
    messagingSenderId: "43047314530",
    appId: "1:43047314530:web:95492d73ec4a9f967a5d3b"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta la instancia de autenticación
export const auth = getAuth(app);

// Exporta la instancia de Realtime Database
export const database = getDatabase(app);
export const storage = getStorage(app);
// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDCjcyPOQ_29zyZGtxk13iJdbDsP1AG8bM",
    authDomain: "home-pisos-vinilicos.firebaseapp.com",
    databaseURL: "https://home-pisos-vinilicos-default-rtdb.firebaseio.com",
    projectId: "home-pisos-vinilicos",
    storageBucket: "home-pisos-vinilicos.appspot.com",
    messagingSenderId: "392689672279",
    appId: "1:392689672279:web:81245db39bf2e1dab7c312",
    measurementId: "G-4HC6MV32X4"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta la instancia de autenticación
export const auth = getAuth(app);

// Exporta la instancia de Realtime Database
export const database = getDatabase(app);
export const storage = getStorage(app);
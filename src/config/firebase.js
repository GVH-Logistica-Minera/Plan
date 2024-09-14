// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Si usas autenticación

// Configuración de Firebase, esta debe ser tu configuración personalizada
const firebaseConfig = {
  apiKey: "AIzaSyDkcseSbFoCfP3gO9p8S2HluEgE3QO_UiY",
  authDomain: "gvh-planificacion.firebaseapp.com",
  projectId: "gvh-planificacion",
  storageBucket: "gvh-planificacion.appspot.com",
  messagingSenderId: "296961338963",
  appId: "1:296961338963:web:45d3cb0788da1030dd20a6",
  measurementId: "G-QH4XRV35FY"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
const db = getFirestore(app);

// Si también usas autenticación
const auth = getAuth(app);

export { db, auth };

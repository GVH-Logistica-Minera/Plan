// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDkcseSbFoCfP3gO9p8S2HluEgE3QO_UiY",
  authDomain: "gvh-planificacion.firebaseapp.com",
  projectId: "gvh-planificacion",
  storageBucket: "gvh-planificacion.appspot.com",
  messagingSenderId: "296961338963",
  appId: "1:296961338963:web:45d3cb0788da1030dd20a6",
  measurementId: "G-QH4XRV35FY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
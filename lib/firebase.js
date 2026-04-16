// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDxz1G5D-Usc-RP_C99WTNmBpwjoXyuNtA",
  authDomain: "dsa-forum-registration.firebaseapp.com",
  projectId: "dsa-forum-registration",
  storageBucket: "dsa-forum-registration.firebasestorage.app",
  messagingSenderId: "24727084690",
  appId: "1:24727084690:web:a890a0fe52b3883539904b",
  measurementId: "G-ZNCD4QED05"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
// Import the functions you need from the SDKs you need
import { getApp, getApps,initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBgws60VzJBKlztkVYUcpQOUmarWIWLFT8",
  authDomain: "nebula-drive-7368f.firebaseapp.com",
  projectId: "nebula-drive-7368f",
  storageBucket: "nebula-drive-7368f.firebasestorage.app",
  messagingSenderId: "35461012734",
  appId: "1:35461012734:web:d2409059ebf8aba6a419af",
  measurementId: "G-G41CY8BGP2",
};

// Initialize Firebase
const app = getApps().length? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export {db, storage}
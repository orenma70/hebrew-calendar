// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAxaXYRUhLEVHWaRXCTXrre3zMZrJh14dQ",
  authDomain: "all-you-need-64b1f.firebaseapp.com",
  projectId: "all-you-need-64b1f",
  storageBucket: "all-you-need-64b1f.firebasestorage.app",
  messagingSenderId: "524686052819",
  appId: "1:524686052819:web:6cb3fc3b9cffaacad4b326",
  measurementId: "G-6FYQVR7Z6L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;
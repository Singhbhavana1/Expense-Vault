// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCHjWo5NWRb7EJjWa9dKzeRF4KtRLFxBDQ",
  authDomain: "expensevault-391d2.firebaseapp.com",
  projectId: "expensevault-391d2",
  storageBucket: "expensevault-391d2.firebasestorage.app",
  messagingSenderId: "481643749142",
  appId: "1:481643749142:web:e287530398566d6218ba37"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Initialize Firebase
export default app;
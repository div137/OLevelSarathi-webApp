import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyANlX-0ZePklhDK1MAndTnla53sIeT4DJM",
  authDomain: "olevelsarathi.firebaseapp.com",
  databaseURL: "https://tic-tic-ta-default-rtdb.firebaseio.com",
  projectId: "olevelsarathi",
  storageBucket: "olevelsarathi.firebasestorage.app",
  messagingSenderId: "626543464326",
  appId: "1:626543464326:web:b2e5d1665247b0bf3ce607",
  measurementId: "G-GD5RK7Z12K"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export default app;

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIBU08SkNkw7Gdue4v01dl2xqUl9U-TkA",
  authDomain: "pollu-aware-ai.firebaseapp.com",
  projectId: "pollu-aware-ai",
  storageBucket: "pollu-aware-ai.firebasestorage.app",
  messagingSenderId: "1067164445939",
  appId: "1:1067164445939:web:102e5b37798b89eca59b86",
  measurementId: "G-H06KG48HMH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
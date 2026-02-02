
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration provided by you
const firebaseConfig = {
  apiKey: "AIzaSyBQmXSqkElm2MvmqUQkEQpaDSsmGXgp4EQ",
  authDomain: "abdulhakim-8d112.firebaseapp.com",
  databaseURL: "https://abdulhakim-8d112-default-rtdb.firebaseio.com",
  projectId: "abdulhakim-8d112",
  storageBucket: "abdulhakim-8d112.firebasestorage.app",
  messagingSenderId: "597953612044",
  appId: "1:597953612044:web:583f62e99c4a54714b2129",
  measurementId: "G-80GK8XHFMM"
};

// Initialize Firebase App first
const app = initializeApp(firebaseConfig);

// Initialize Analytics
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Initialize and export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Standard Google Auth configuration
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

import { getAuth } from "firebase/auth";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAnBxoUrF2zz3C6AGYgbI0zLyEFYUFvd94",
  authDomain: "chatterbox-43d4a.firebaseapp.com",
  projectId: "chatterbox-43d4a",
  storageBucket: "chatterbox-43d4a.appspot.app",
  messagingSenderId: "815454325255",
  appId: "1:815454325255:web:9d2ff0a0efb13bd30f78a2",
  measurementId: "G-4BDZQB4WC7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export default auth;

// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, query, orderByChild, equalTo, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAln62Yu3Hy9ILrqUpLGsxkbe6DXtSTVO0",
  authDomain: "subscription-system-tenderapp.firebaseapp.com",
  databaseURL: "https://subscription-system-tenderapp-default-rtdb.firebaseio.com",
  projectId: "subscription-system-tenderapp",
  storageBucket: "subscription-system-tenderapp.firebasestorage.app",
  messagingSenderId: "936772760561",
  appId: "1:936772760561:web:012d9540d051237d964a50"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, query, orderByChild, equalTo, get };
export default db;
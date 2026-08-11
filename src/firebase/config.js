import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Gerçek Firebase config değerleri buraya gelecek
const firebaseConfig = {
  apiKey: "AIzaSyCOh3tp2VRc3Pqgx-efW-cDHbeR-M_P3D8",
  authDomain: "ariza-takip-89a17.firebaseapp.com",
  projectId: "ariza-takip-89a17",
  storageBucket: "ariza-takip-89a17.firebasestorage.app",
  messagingSenderId: "786838330677",
  appId: "1:786838330677:web:8bda6ad57c136066a8007c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

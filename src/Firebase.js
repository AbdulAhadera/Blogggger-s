
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
    apiKey: "AIzaSyCMzxMjNu-2RIon544g8n6QDbGJKU3ng1U",
    authDomain: "blog-2fe88.firebaseapp.com",
    projectId: "blog-2fe88",
    storageBucket: "blog-2fe88.appspot.com",
    messagingSenderId: "728883914282",
    appId: "1:728883914282:web:931df3caac406e24c80553",
    measurementId: "G-PXP62ZNV2L",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app)
export { app, db, storage };
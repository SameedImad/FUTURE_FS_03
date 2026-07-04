import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD2CRyh0oyXi6ZPxMCbG9Wa0XcpLLaJA0E",
  authDomain: "royal-delight-c8709.firebaseapp.com",
  projectId: "royal-delight-c8709",
  storageBucket: "royal-delight-c8709.firebasestorage.app",
  messagingSenderId: "785638168638",
  appId: "1:785638168638:web:ce5694b30266efadb3596f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

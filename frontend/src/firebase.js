import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDw21ADTMPWLmGEpHpxnNSDu85Tksk64Bc",
  authDomain: "speakup-2049a.firebaseapp.com",
  projectId: "speakup-2049a",
  storageBucket: "speakup-2049a.firebasestorage.app",
  messagingSenderId: "32019515920",
  appId: "1:32019515920:web:e892db9688db638a45d895",
  measurementId: "G-NPEGMN9L9T"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });
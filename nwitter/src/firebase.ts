import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
const firebaseConfig = {
  apiKey: 'AIzaSyD_-HEsPT4aYc17E7b_JIvLHhJIHqkHths',
  authDomain: 'nwitter-213bd.firebaseapp.com',
  projectId: 'nwitter-213bd',
  storageBucket: 'nwitter-213bd.firebasestorage.app',
  messagingSenderId: '1092991846907',
  appId: '1:1092991846907:web:c0bf4ca63cd2f5e2e7235e',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

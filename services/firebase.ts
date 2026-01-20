import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, update, child, remove } from 'firebase/database';

// Configuração do Firebase (pública - dados não sensíveis)
const firebaseConfig = {
  apiKey: "AIzaSyBnL8YK7q1p8xR9vZ2wJ6mK3hL4nO5pQ6r",
  authDomain: "tank-strike-nemes.firebaseapp.com",
  projectId: "tank-strike-nemes",
  storageBucket: "tank-strike-nemes.firebasestorage.app",
  messagingSenderId: "123456789012",
  databaseURL: "https://tank-strike-nemes-default-rtdb.firebaseio.com",
  appId: "1:123456789012:web:abcdef1234567890ghij"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, set, get, update, child, remove };

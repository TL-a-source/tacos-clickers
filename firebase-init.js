// firebase-init.js

// Importez les fonctions nécessaires du SDK Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-database.js";

// Votre configuration Firebase (utilisez vos informations exactes ici)
const firebaseConfig = {
  apiKey: "AIzaSyCG2ul4JfId1azKDsn14s_BIf9RWiEpksE",
  authDomain: "tacosclicker-3ed32.firebaseapp.com",
  // IMPORTANT : Utiliser l'URL de votre instance par défaut avec la région
  databaseURL: "https://tacosclicker-3ed32-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tacosclicker-3ed32",
  storageBucket: "tacosclicker-3ed32.appspot.com",
  messagingSenderId: "596410473263",
  appId: "1:596410473263:web:794fe1bb0c14f47fca5fda"
};

// Initialisez l'application Firebase
const app = initializeApp(firebaseConfig);

// Obtenez l'instance de la base de données
const db = getDatabase(app);

// Exportez l'instance de la base de données pour pouvoir l'importer dans d'autres fichiers
export { db };

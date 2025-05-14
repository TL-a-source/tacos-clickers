// script.js

import { db, ref, set, get } from './firebase-init.js';

let data = {
  tacos: 0,
  tortilleros: 0,
  chefs: 0,
  restaurants: 0,
  doubleProduction: false,
  reductionPrix: false,
  prixBase: {
    tortillero: 500,
    chef: 5000,
    restaurant: 50000,
    doubleProduction: 10000,
    reductionPrix: 20000
  }
};

let afkMode = false;
let afkInterval = null;

let cps = 0;
let maxCps = 10;
let cpsTimer = null;

const inactivityLimit = 300000; // 5 minutes
let inactivityTimer = null;

window.onload = () => {
  const playerName = localStorage.getItem("playerName") || "Anonyme";
  updateAffichage();
  setInterval(prodAuto, 1000);
  afficherClassement();

  if (playerName && playerName !== "Anonyme") {
    chargerDonneesUtilisateur(playerName);
  }

  if (localStorage.getItem("afkMode") === "true") {
    afkMode = true;
    document.getElementById("btnAfk").textContent = "Désactiver le mode AFK";
    document.getElementById("afkStatus").textContent = "Statut : Actif";
    startAfkLoop();
  }

  resetInactivityTimer();
  document.addEventListener("mousemove", resetInactivityTimer);
  document.addEventListener("keydown", resetInactivityTimer);
  document.addEventListener("click", resetInactivityTimer);
};

function updateAffichage() {
  const count = Math.floor(data.tacos);
  document.getElementById("tacoCount").textContent = count;
  let message = " taco";
  if (count > 1 || count === 0) message += "s";

  document.getElementById("titreJeu").innerHTML =
    "🌮 Taco Clicker 🌮 - <span id=\"tacoCount\">" + count + "</span>" + message;

  document.getElementById("tortilleroCount").textContent = data.tortilleros;
  document.getElementById("chefCount").textContent = data.chefs;
  document.getElementById("restaurantCount").textContent = data.restaurants;
  document.getElementById("doubleProductionStatus").textContent = data.doubleProduction ? "Oui" : "Non";
  document.getElementById("reductionPrixStatus").textContent = data.reductionPrix ? "Oui" : "Non";
}
window.updateAffichage = updateAffichage;

function prodAuto() {
  let production = 0;
  production += data.tortilleros * 1;
  production += data.chefs * 10;
  production += data.restaurants * 100;
  if (data.doubleProduction) production *= 2;

  data.tacos += production;
  updateAffichage();

  const playerName = localStorage.getItem("playerName");
  if (playerName && playerName !== "Anonyme") {
    mettreAJoutéClassement(playerName);
  }
}
window.prodAuto = prodAuto;

function acheter(type) {
  let prix = data.prixBase[type];
  if (data.reductionPrix) prix = Math.floor(prix * 0.9);

  if (data.tacos >= prix) {
    data.tacos -= prix;
    data[type + "s"]++;
    updateAffichage();
  }
}
window.acheter = acheter;

function regarderPub(type) {
  alert("Vous regardez une publicité...");
  setTimeout(() => {
    if (type === 'doubleProduction') data.doubleProduction = true;
    else if (type === 'reductionPrix') data.reductionPrix = true;
    updateAffichage();
  }, 5000);
}
window.regarderPub = regarderPub;

function toggleAfk() {
  afkMode = !afkMode;
  localStorage.setItem("afkMode", afkMode);
  const btn = document.getElementById("btnAfk");
  const status = document.getElementById("afkStatus");

  if (afkMode) {
    btn.textContent = "Désactiver le mode AFK";
    status.textContent = "Statut : Actif";
    startAfkLoop();
  } else {
    btn.textContent = "Activer le mode AFK";
    status.textContent = "Statut : Inactif";
    clearInterval(afkInterval);
    afkInterval = null;
  }
}
window.toggleAfk = toggleAfk;

function startAfkLoop() {
  afkInterval = setInterval(() => {
    data.tacos += 500;
    updateAffichage();

    const playerName = localStorage.getItem("playerName");
    if (playerName && playerName !== "Anonyme") {
      mettreAJoutéClassement(playerName);
    }
  }, 300000);
}

function activateAfkAutomatically() {
  afkMode = true;
  localStorage.setItem("afkMode", "true");
  document.getElementById("btnAfk").textContent = "Désactiver le mode AFK";
  document.getElementById("afkStatus").textContent = "Statut : Actif";
  showAfkNotification();
  startAfkLoop();
}

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(activateAfkAutomatically, inactivityLimit);
}
window.resetInactivityTimer = resetInactivityTimer;

function showAfkNotification() {
  const notif = document.getElementById("afkNotification");
  notif.classList.add("show");
  setTimeout(() => {
    notif.classList.remove("show");
  }, 4000);
}

// Son au clic
const clickSound = new Audio('assets/taco-click.mp3');
clickSound.volume = 0.3;

function clickTaco() {
  if (cps >= maxCps) return;

  let gain = 1;
  if (data.doubleProduction) gain *= 2;

  data.tacos += gain;
  updateAffichage();

  clickSound.currentTime = 0;
  clickSound.play();

  const pop = document.createElement("div");
  pop.style.position = "absolute";
  pop.style.top = "40%";
  pop.style.left = "50%";
  pop.style.transform = "translate(-50%, -50%)";
  pop.style.fontSize = "24px";
  pop.style.color = "#ff4444";
  pop.style.opacity = "0.9";
  pop.style.transition = "opacity 0.5s";
  pop.textContent = "+ " + gain + " 🌮";
  document.body.appendChild(pop);

  setTimeout(() => {
    pop.style.opacity = "0";
    setTimeout(() => {
      pop.remove();
    }, 500);
  }, 800);

  cps++;
  if (!cpsTimer) {
    cpsTimer = setTimeout(() => {
      cps = 0;
      cpsTimer = null;
    }, 1000);
  }

  let playerName = localStorage.getItem("playerName");
  if (!playerName) {
    playerName = prompt("Entrez votre nom pour le classement :", "Anonyme");
    if (playerName) {
      localStorage.setItem("playerName", playerName);
    }
  }

  mettreAJoutéClassement(playerName || "Anonyme");
}
window.clickTaco = clickTaco;

function chargerDonneesUtilisateur(nom) {
  const userRef = ref(db, 'users/' + nom);

  get(userRef).then((snapshot) => {
    if (snapshot.exists()) {
      const userData = snapshot.val();
      data.tacos = userData.score || 0;
      updateAffichage();
    } else {
      console.warn("Aucune donnée trouvée pour", nom);
    }
  }).catch((error) => {
    console.error("Erreur lors du chargement des données utilisateur :", error);
  });
}
window.chargerDonneesUtilisateur = chargerDonneesUtilisateur;

function mettreAJoutéClassement(nom) {
  if (nom === "Anonyme") return;

  const userRef = ref(db, 'users/' + nom);

  get(userRef).then((snapshot) => {
    if (snapshot.exists()) {
      const userData = snapshot.val();

      if (data.tacos > userData.score) {
        set(userRef, {
          password: userData.password,
          score: Math.floor(data.tacos),
          lastPlayed: Date.now()
        });
      }
    } else {
      set(userRef, {
        password: "inconnu",
        score: Math.floor(data.tacos),
        lastPlayed: Date.now()
      });
    }
  }).catch((error) => {
    console.error("❌ Erreur Firebase :", error);
  });
}
window.mettreAJoutéClassement = mettreAJoutéClassement;

function afficherClassement() {
  const liste = document.getElementById("classementListe");
  liste.innerHTML = "";

  db.ref("users")
    .orderByChild("score")
    .limitToLast(30)
    .on("value", (snapshot) => {
      const joueursFirebase = [];

      snapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key;
        const val = childSnapshot.val();

        if (key === "Anonyme") return;

        joueursFirebase.push({
          nom: key,
          score: val?.score || 0
        });
      });

      joueursFirebase.sort((a, b) => b.score - a.score);

      joueursFirebase.slice(0, 10).forEach((joueur, i) => {
        const li = document.createElement("li");
        li.textContent = `${i + 1}. ${joueur.nom} - ${joueur.score} tacos`;
        liste.appendChild(li);
      });
    }, (error) => {
      console.error("Erreur Firebase :", error);
      liste.innerHTML = "<li>⚠️ Impossible de charger le classement.</li>";
    });
}
window.afficherClassement = afficherClassement;
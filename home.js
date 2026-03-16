//--------------------------------------------------------------------------------------------------
// Olyway : Home Code
//--------------------------------------------------------------------------------------------------
//----- Variables globales -----
let iSeuilPrecision = 15;             // Paramètre mémorisé
let gTempsMaxLocalisation = 30;       // Paramètre mémorisé
let gNiveauBatterie = 0;
const ATTENTE = true;                 // Pour indiquer l'attente fin de speech

//--------------------------------------------------------------------------------------------------
// Initialisations
//--------------------------------------------------------------------------------------------------

//----- Installation du Service Worker -----
if ('serviceWorker' in navigator)
{
  // updateViaCache: 'none' force le navigateur à ignorer son cache HTTP
  const registrationPromise = navigator.serviceWorker.register('./sw.js',
  {
    updateViaCache: 'none'
  });

  registrationPromise.then(registration =>
  {
    // Force une vérification de mise à jour à chaque chargement de la page
    registration.update();

    // Updatefound
    registration.addEventListener('updatefound', () =>
    {
      console.log('Nouvelle version du service worker trouvée, installation en cours.');
      const newWorker = registration.installing;
      newWorker.addEventListener('statechange', () =>
      {
        if (newWorker.state === 'installed')
        {
          console.log('installed');
        }
      });
    });
  }).catch(error =>
  {
  });
}

//----- Wake Lock -----
document.addEventListener('visibilitychange', async () =>
{
  if (wakeLock !== null && document.visibilityState === 'visible')
  {
    wakeLock = await navigator.wakeLock.request('screen');
  }
});

//----- Gestionnaires d'événements DOM -----
document.addEventListener('DOMContentLoaded', async () =>
{
  console.log("Version = ", VERSION);
  pid('TxtOlyway').innerHTML = "Olyway \n<span style='font-size: 0.5em; color: #FC6;'>" + VERSION + "</span>";

//  ButDémarrageClick(); // DEBUG:activer , RELEASE:commenter
});


//--------------------------------------------------------------------------------------------------
// Raccourci sur les éléments du DOM
//--------------------------------------------------------------------------------------------------
function pid(id)
{
  const element = document.getElementById(id);
  if (element == null)
    console.log("PID '"+ id + "' introuvable !");
  return(element);
}


//--------------------------------------------------------------------------------------------------
// Bouton démarrage
//--------------------------------------------------------------------------------------------------
function ButDémarrageClick()
{
  openFullscreen();
  Speech("Bienvenue sur Olyway.", ATTENTE);
  AfficherEcranPrincipal();
}

//--------------------------------------------------------------------------------------------------
// Fonction d'attente d'une durée
//--------------------------------------------------------------------------------------------------
function sleep(ms)
{
  return(new Promise(resolve => setTimeout(resolve, ms)));
}

//--------------------------------------------------------------------------------------------------
// Plein écran
//--------------------------------------------------------------------------------------------------
let gFullScreen = false;
function openFullscreen()
{
  let elem = document.documentElement;
  if (elem.requestFullscreen)
    elem.requestFullscreen();

  /* Safari / iOS */
  else if (elem.webkitRequestFullscreen)
    elem.webkitRequestFullscreen();

  /* IE11 */
  else if (elem.msRequestFullscreen)
    elem.msRequestFullscreen();
  gFullScreen = true;
}

//--------------------------------------------------------------------------------------------------
// Quitter le plein écran
//--------------------------------------------------------------------------------------------------
function closeFullscreen()
{
  let elem = document;

  if (elem.exitFullscreen)
    elem.exitFullscreen();

  /* Safari / iOS */
  else if (elem.webkitExitFullscreen)
    elem.webkitExitFullscreen();

  /* IE11 */
  else if (elem.msExitFullscreen)
    elem.msExitFullscreen();

  gFullScreen = false;
}

//--------------------------------------------------------------------------------------------------
// Gestion de la mise en veille (Wake Lock)
//--------------------------------------------------------------------------------------------------
let wakeLock = null;

// Fonction pour ACTIVER le Wake Lock
async function ActiverWakeLock()
{
  try
  {
    if ('wakeLock' in navigator) {
      if (wakeLock === null) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () =>
        {
          // console.log('Wake Lock libéré');
        });
      }
    }
    else
    {
      alert("Votre navigateur ne supporte pas le maintien de l'écran.");
    }
  }
  catch (err)
  {
    console.error("Wake Lock Error");
  }
}

// Fonction pour DÉSACTIVER le Wake Lock
async function DesactiverWakeLock()
{

  if (wakeLock !== null)
  {
    try
    {
      await wakeLock.release();
      wakeLock = null;
    }
    catch (err)
    {
      console.error("Wake Unlock Error");
    }
  }
}

//--------------------------------------------------------------------------------------------------
// Speech
//--------------------------------------------------------------------------------------------------
let currentUtterance = null;
let speechPromise = Promise.resolve(); // Stocke la promesse de la phrase en cours

async function Speech(texte, pAttendre = false) {
  if ('speechSynthesis' in window) {

    // 1. SI pAttendre est vrai, on attend que la phrase PRÉCÉDENTE soit finie
    if (pAttendre) {
      await speechPromise;
    } else {
      // SI pAttendre est faux, on coupe la parole immédiatement comme avant
      window.speechSynthesis.cancel();
      await sleep(100);
    }

    // 2. On crée la nouvelle promesse pour la phrase actuelle
    speechPromise = new Promise((resolve) => {
      currentUtterance = new SpeechSynthesisUtterance(texte);
      currentUtterance.lang = 'fr-FR';

      currentUtterance.onend = () => {
        currentUtterance = null;
        resolve();
      };

      currentUtterance.onerror = (event) => {
        console.error("Erreur SpeechSynthesis:", event);
        currentUtterance = null;
        resolve();
      };

      window.speechSynthesis.speak(currentUtterance);
    });

    // Note : On ne fait pas "await speechPromise" ici,
    // pour que la fonction Speech redonne la main au code appelant immédiatement,
    // sauf si vous appelez vous-même "await Speech(...)" à l'extérieur.

  } else {
    alert("Synthèse vocale non supportée.");
  }
}

//--------------------------------------------------------------------------------------------------
// Récupération du niveau de batterie
//--------------------------------------------------------------------------------------------------
function NiveauBatterie()
{
  try
  {
    if (navigator.getBattery)
    {
      navigator.getBattery().then(function(battery)
      {
        gNiveauBatterie = Math.floor(battery.level * 100);
      });
    }
  }
  catch(error)
  {
    gNiveauBatterie = 123;
  }
}


//--------------------------------------------------------------------------------------------------
// Afficher un seul écran d'une liste en masquant les autres
//--------------------------------------------------------------------------------------------------
const gListeEcrans = [    "EcranDemarrage",
                          "EcranPrincipal",
/* Suivre Parcours */     // TODO "EcranParcours",
                          "EcranNouveauParcours",
                              "EcranEnregistrement",
                                  "EcranPause",
                              "EcranNom",
                          "EcranReglages",
                          "EcranInfos",
                      ];
function AfficherEcran(pEcran)
{
  let lTrouve = false;
  for (let i = 0; i < gListeEcrans.length; i++)
  {
    const lNomEcran = gListeEcrans[i];
    if (lNomEcran === pEcran)
    {
      pid(lNomEcran).style.display = 'block';
      lTrouve = true;
    }
    else
    {
      pid(lNomEcran).style.display = 'none';
    }
  }

  if (!lTrouve)
    console.log("Ecran introuvable : ", pEcran);
}


// Instrumentation
function InputChange(pTexte)
{
  pid('ButTraceBouton').innerHTML = pTexte;
  pid('ButTraceSpan').innerHTML = pTexte;
}



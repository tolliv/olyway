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
  console.log("Version :", VERSION);
  const lVersion = "VERSION : " + VERSION.substring(0, 2) + " " + VERSION.substring(2, 4) + " " +VERSION.substring(5, 10);

  pid('TxtOlyway').innerHTML = "Olyway \n<span style='font-size: 0.5em; color: #FC6;'>" + lVersion + "</span>";

  const lPlatform = getPlatform();
  console.log("Plateforme :", lPlatform);
  if (lPlatform == "Windows" || lPlatform == "Linux")
  {
    gModeSimulation = true;
    console.log("Mode simulation activé");
  }

  // AfficherEcranGestion(); // DEBUG:activer , RELEASE:commenter
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
  if (!gModeSimulation)
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
// Speech : Arrête la parole en cours et énonce le nouveau texte
//--------------------------------------------------------------------------------------------------
function Speech(texte)
{
  if ('speechSynthesis' in window)
  {
    // On annule immédiatement toute lecture en cours
    window.speechSynthesis.cancel();

    // On crée l'énoncé
    const utterance = new SpeechSynthesisUtterance(texte);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.0;       // Vitesse normale

    // Délai de 50ms pour assurer la stabilité.
    setTimeout(() =>
    {
      window.speechSynthesis.speak(utterance);
    }, 50);
  }
  else
  {
    console.error("Synthèse vocale non supportée.");
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
// Lecture de la plateforme
//--------------------------------------------------------------------------------------------------
function getPlatform()
{
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("android"))
        return "Android";
    else if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod"))
        return "iOS";
    else if (ua.includes("windows") || ua.includes("win32") || ua.includes("win64"))
        return "Windows";
    else if (ua.includes("macintosh") || ua.includes("mac os x"))
        return "MacOS";
    else if (ua.includes("linux"))
        return "Linux";
    else
        return "Unknown";
}


//--------------------------------------------------------------------------------------------------
// Afficher un seul écran d'une liste en masquant les autres
//--------------------------------------------------------------------------------------------------
const gListeEcrans = [    "EcranDemarrage",
                          "EcranPrincipal",
                          "EcranSuivreParcours",
                          "EcranNouveauParcours",
                              "EcranEnregistrement",
                                  "EcranPause",
                              "EcranNom",
                          "EcranGestion",
                              "EcranSelection",
                              "EcranParcoursInfos",
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



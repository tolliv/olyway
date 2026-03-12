//--------------------------------------------------------------------------------------------------
// Olyway : Home Code
//--------------------------------------------------------------------------------------------------
const DEBUG = 0;

//----- Variables globales -----
let iSeuilPrecision = 15;             // Paramètre mémorisé
let gTempsMaxLocalisation = 30;       // Paramètre mémorisé

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
document.addEventListener('DOMContentLoaded', async function()
{
  console.log("Version = ", VERSION);

  // Lancement
  pid('EcranDemarrage').style.display = 'none';

  // Affichage de l'écran Principal
  AfficherEcranPrincipal();

  //AfficherEcranEnregistrement(); // DEBUG mettre en commentaire
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
          console.log('Wake Lock libéré');
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
let speechPromise = Promise.resolve();

function Speech(texte)
{
  if ('speechSynthesis' in window)
  {
    window.speechSynthesis.cancel();

    // On crée une nouvelle promesse qui se résoudra quand le texte sera fini
    speechPromise = new Promise((resolve) =>
    {
      const message = new SpeechSynthesisUtterance(texte);
      message.lang = 'fr-FR';

      message.onend = () => resolve(); // Résolution normale
      message.onerror = () => resolve(); // Éviter de bloquer en cas d'erreur

      window.speechSynthesis.speak(message);
    });
  }
  else
  {
    alert("Synthèse vocale non supportée.");
  }
}

//--------------------------------------------------------------------------------------------------
// Atttente fin de la lecture en cours
//--------------------------------------------------------------------------------------------------
async function AttenteFinSpeech()
{
  await sleep(1000);

  // On attend simplement la fin de la promesse créée dans Speech()
  await speechPromise;
}

//--------------------------------------------------------------------------------------------------
// Afficher un seul écran d'une liste en masquant les autres
//--------------------------------------------------------------------------------------------------
const gListeEcrans = ["EcranPrincipal",
/* Suivre Parcours */     // TODO "EcranParcours",
/* Nouveau Parcours */    "EcranNouveauParcours",
                              "EcranEnregistrement",
                                  "EcranPause",
/* Réglages */            "EcranReglages",
/* Informations */        "EcranInfos",
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
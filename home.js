//--------------------------------------------------------------------------------------------------
// Olyway : Home Code
//--------------------------------------------------------------------------------------------------

//----- Variables globales -----
let iSeuilPrecision;                  // Paramètre mémorisé
let gTempsMaxLocalisation = 10;       // Paramètre mémorisé
let gNewVersion = "";

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
          pid('TxtVersionFuture').innerHTML = "&nbsp;Nouvelle version installée&nbsp;";
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

  Speech("Bienvenue sur Olyway");
//  await AttenteFinSpeech(); // DEBUG supprimer commentaire si release

  // Affichage de l'écran Principal
  pid('EcranDemarrage').style.display = 'none';
  AfficherEcran("EcranPrincipal");

  AfficherEcranEnregistrer(); // DEBUG supprimer commentaire si release
});

//--------------------------------------------------------------------------------------------------
// Raccourci sur les éléments du DOM
//--------------------------------------------------------------------------------------------------
function pid(id)
{
  const element = document.getElementById(id);
  if (element == null)
    console.log("'"+ id + "' introuvable !");
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
  const btn = document.getElementById('btnWakeLock');

  try
  {
    if ('wakeLock' in navigator) {
      if (wakeLock === null) {
        wakeLock = await navigator.wakeLock.request('screen');
        btn.textContent = "ON";
        openFullscreen();

        wakeLock.addEventListener('release', () => {
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
    console.error(`${err.name}, ${err.message}`);
  }
}

// Fonction pour DÉSACTIVER le Wake Lock
async function DesactiverWakeLock()
{
  const btn = document.getElementById('btnWakeLock');

  if (wakeLock !== null)
  {
    try
    {
      await wakeLock.release();
      wakeLock = null;
      btn.textContent = "OFF";
      closeFullscreen();
    }
    catch (err)
    {
      console.error(`Erreur lors de la libération : ${err.message}`);
    }
  }
}

//--------------------------------------------------------------------------------------------------
// Speech
//--------------------------------------------------------------------------------------------------
function Speech(texte)
{
  // On vérifie si l'API est supportée
  if ('speechSynthesis' in window)
  {
    // Arrête la lecture de la phrase en cours
    window.speechSynthesis.cancel();
    const message = new SpeechSynthesisUtterance(texte);
    message.lang = 'fr-FR'; // Définit la langue en français
    window.speechSynthesis.speak(message);
  }
  else
  {
    alert("Désolé, votre navigateur ne supporte pas la synthèse vocale.");
  }
}

//--------------------------------------------------------------------------------------------------
// Atttente fin de la lecture en cours
//--------------------------------------------------------------------------------------------------
async function AttenteFinSpeech()
{
  do
  {
    await sleep(100);
  } while (window.speechSynthesis.speaking);
}

//--------------------------------------------------------------------------------------------------
// Afficher un seul écran d'une liste en masquant les autres
//--------------------------------------------------------------------------------------------------
const gListeEcrans = ["EcranPrincipal",
                          "EcranItineraires",
                              "EcranSuivre",
                                  /* EcranReglages */
                                  /* EcranDemarrer */
                              "EcranCreer",
                                  "EcranEnregistrer",
                                      /* EcranReglages */
                                      "EcranEnregistrement",
                                          "EcranPause",
                          "EcranTraces",
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

function InputChange(pTexte)
{
  pid('ButTraceBouton').innerHTML = pTexte;
  pid('ButTraceSpan').innerHTML = pTexte;
}
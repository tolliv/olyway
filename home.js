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

  // Affichage de l'écran Principal
  Speech("Bienvenue sur Olyway");
  await AttenteFinSpeech();
  pid('EcranDemarrage').style.display = 'none';
  AfficherEcran("EcranPrincipal");
});

//--------------------------------------------------------------------------------------------------
// Raccourci sur les éléments du DOM
//--------------------------------------------------------------------------------------------------
function pid(id)
{
  const element = document.getElementById(id);
  if (id == null)
    console.log("ID NULL (" + id + ")");
  return element;
}

//--------------------------------------------------------------------------------------------------
// Fonction d'attente d'une durée
//--------------------------------------------------------------------------------------------------
function sleep(ms)
{
  return new Promise(resolve => setTimeout(resolve, ms));
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
  if (document.exitFullscreen)
    document.exitFullscreen();

  /* Safari / iOS */
  else if (document.webkitExitFullscreen)
    document.webkitExitFullscreen();

  /* IE11 */
  else if (document.msExitFullscreen)
    document.msExitFullscreen();

  gFullScreen = false;
}

//--------------------------------------------------------------------------------------------------
// Gestion de la mise en veille (Wake Lock)
//--------------------------------------------------------------------------------------------------
let wakeLock = null;

async function toggleWakeLock()
{
  const btn = document.getElementById('btnWakeLock');

  // Activer le Wake Lock
  if (wakeLock === null)
  {
    try {
      if ('wakeLock' in navigator)
      {
        wakeLock = await navigator.wakeLock.request('screen');
        btn.textContent = "ON";
        openFullscreen();
        wakeLock.addEventListener('release', () =>
        {
          console.log('Wake Lock libéré');
        });
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

  // Désactiver le Wake Lock
  else
  {
    wakeLock.release()
      .then(() => {
        wakeLock = null;
        btn.textContent = "OFF";
        closeFullscreen();
      });
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
const gListeEcrans = ["EcranPrincipal", "EcranItineraires", "EcranTraces", "EcranEnregistrer", "EcranInfos"];
function AfficherEcran(pEcran)
{
  for (let i = 0; i < gListeEcrans.length; i++)
  {
    const lNomEcran = gListeEcrans[i];
    if (lNomEcran === pEcran)
      pid(lNomEcran).style.display = 'block';
    else
      pid(lNomEcran).style.display = 'none';
  }
}

//==================================================================================================
// Ecran Principal
//==================================================================================================
//--------------------------------------------------------------------------------------------------
// Afficher l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranPrincipal()
{
  if (gInterfaceSon) Speech("écran principal");
  AfficherEcran("EcranPrincipal");
}

//--------------------------------------------------------------------------------------------------
// Activer ou non le son sur l'interface
//--------------------------------------------------------------------------------------------------
let gInterfaceSon = true;
function EcranPrincipalVoixClick()
{
  if (gInterfaceSon == true)
  {
    Speech("voix désactivée")
    pid('EcranPrincipalVoix').innerHTML = "VOIX DESACTIVEE";
    pid('EcranPrincipalVoix').style.backgroundColor = "#000";
    pid('EcranPrincipalVoix').style.color = "#FFF";
    gInterfaceSon = false;
  }
  else
  {
    Speech("voix activée")
    pid('EcranPrincipalVoix').innerHTML = "VOIX ACTIVEE";
    pid('EcranPrincipalVoix').style.backgroundColor = "#0F0";
    pid('EcranPrincipalVoix').style.color = "#000";
    gInterfaceSon = true;
  }
}



//==================================================================================================
// Ecran ITINERAIRES
//==================================================================================================
const gItinerairesListe = [
{ nom: "QUARTIER", distance: 4.2 },
{ nom: "LEGENDES", distance: 8.2},
];


//--------------------------------------------------------------------------------------------------
// Afficher l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranItineraires()
{
  if (gInterfaceSon) Speech("écran itinéraires");
  AfficherEcran("EcranItineraires");
  pid('TxtItinerairesNom').innerHTML = gItinerairesListe[0].nom + "<br>"+ gItinerairesListe[0].nom + " >";
  pid('TxtItinerairesValeur').innerHTML = gItinerairesListe[0].distance + "km";
}



//==================================================================================================
// Ecran TRACES
//==================================================================================================
//--------------------------------------------------------------------------------------------------
// Afficher l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranTraces()
{
  if (gInterfaceSon) Speech("écran traces");
  AfficherEcran("EcranTraces");
}



//==================================================================================================
// Ecran ENREGISTRER
//==================================================================================================
//--------------------------------------------------------------------------------------------------
// Afficher l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranEnregistrer()
{
  if (gInterfaceSon) Speech("écran enregistrer");
  AfficherEcran("EcranEnregistrer");
}



//==================================================================================================
// Ecran INFOS
//==================================================================================================
const gInfosParamListe = ["VERSION", "AUTEURS"];
let gInfosParam = "VERSION"; // Valeur par défaut

//--------------------------------------------------------------------------------------------------
// Afficher l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranInfos()
{
  if (gInterfaceSon) Speech("écran infos");
  AfficherEcran("EcranInfos");
  AfficherInfosParam();
}

//--------------------------------------------------------------------------------------------------
// Afficher les paramètres
//--------------------------------------------------------------------------------------------------
function AfficherInfosParam()
{
  // Liste des paramètres
  switch(gInfosParam)
  {
    case "VERSION":
        pid('TxtInfosParam').innerHTML = "VERSION >";
        pid('TxtInfosValeur').innerHTML = VERSION.substring(0, 2) + " " + VERSION.substring(2, 4) + " " +VERSION.substring(5, 10);
      break;
    case "AUTEURS":
        pid('TxtInfosParam').innerHTML = "AUTEURS >";
        pid('TxtInfosValeur').innerHTML = "tolliv & frneko";
      break;
  }
}

//--------------------------------------------------------------------------------------------------
// Paramètre suivant
//--------------------------------------------------------------------------------------------------
function TxtInfosParamClick()
{
  let lIndex = gInfosParamListe.indexOf(gInfosParam);
  lIndex = (lIndex + 1) % gInfosParamListe.length;
  gInfosParam = gInfosParamListe[lIndex];
  AfficherInfosParam();
}
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

//----- Gestionnaires d'événements DOM -----
document.addEventListener('DOMContentLoaded', function()
{
  // Version actuelle écran HOME
//  pid('TxtVersionActuelle').innerHTML = "Version " + VERSION;

  // Affichage de l'écran HOME
  AfficherEcranHOME();
});

//----- Wake Lock -----
document.addEventListener('visibilitychange', async () =>
{
  if (wakeLock !== null && document.visibilityState === 'visible')
  {
    wakeLock = await navigator.wakeLock.request('screen');
  }
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
// Afficher l'écran Home
//--------------------------------------------------------------------------------------------------
function AfficherEcranHOME()
{
  console.log("Démarrage Olyway");

  // Affichage écran
  pid('scrHome').style.display = 'block';
}

//--------------------------------------------------------------------------------------------------
// Plein écran
//--------------------------------------------------------------------------------------------------
function openFullscreen()
{
  let elem = document.documentElement;
  if (elem.requestFullscreen)
  {
    elem.requestFullscreen();
  }

  /* Safari / iOS */
  else if (elem.webkitRequestFullscreen)
  {
    elem.webkitRequestFullscreen();
  }

  /* IE11 */
  else if (elem.msRequestFullscreen)
  {
    elem.msRequestFullscreen();
  }
}

//--------------------------------------------------------------------------------------------------
// Quitter le plein écran
//--------------------------------------------------------------------------------------------------
function closeFullscreen()
{
  if (document.exitFullscreen)
  {
    document.exitFullscreen();
  }

  /* Safari / iOS */
  else if (document.webkitExitFullscreen)
  {
    document.webkitExitFullscreen();
  }

  /* IE11 */
  else if (document.msExitFullscreen)
  {
    document.msExitFullscreen();
  }
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




function ButPrincipalEnregistrer()
{
  openFullscreen();
}
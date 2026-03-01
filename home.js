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
/* TODO
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
*/

//----- Gestionnaires d'événements DOM -----
document.addEventListener('DOMContentLoaded', function()
{
  // Affichage de l'écran HOME
  AfficherEcranHOME();
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

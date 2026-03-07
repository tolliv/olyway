//==================================================================================================
// Ecran ENREGISTRER
//==================================================================================================
let gTimeoutReprendre = null;

//--------------------------------------------------------------------------------------------------
// Afficher l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranEnregistrer()
{
  if (gInterfaceSon) Speech("écran enregistrer");
  AfficherEcran("EcranEnregistrer");
}

//--------------------------------------------------------------------------------------------------
// Enregistrer un nouvel itinéraire
//--------------------------------------------------------------------------------------------------
function ButtonEnregistrerDemarrerClick()
{
//  ActiverWakeLock();
  openFullscreen(); // DEBUG supprimer commentaire si release
  AfficherEcran("EcranEnregistrement");
}

//--------------------------------------------------------------------------------------------------
// Appui bouton pendant l'enregistrement
//--------------------------------------------------------------------------------------------------
function ButtonEnregistrementStopClick()
{
  let gReleves = "\n";
  gReleves += "&nbsp;TEMPS :\n";
  gReleves += "&nbsp;&nbsp;&nbsp;1h 04mn 05s\n\n";
  gReleves += "&nbsp;DISTANCE :\n";
  gReleves += "&nbsp;&nbsp;&nbsp;2.8km\n\n";
  gReleves += "&nbsp;D+ :\n";
  gReleves += "&nbsp;&nbsp;&nbsp;58m\n";
  pid('TxtReleves').innerHTML = gReleves;
  AfficherEcran("EcranPause");

  gTimeoutReprendre = setTimeout(() =>
  {
    AfficherEcran("EcranEnregistrement");
  }, 5000);

}


//--------------------------------------------------------------------------------------------------
// Arrêter l'enregistrement
//--------------------------------------------------------------------------------------------------
function EnregistrementArreter()
{
  if (gTimeoutReprendre !== null)
  {
    clearTimeout(gTimeoutReprendre);
    gTimeoutReprendre = null;
  }
  closeFullscreen();
  AfficherEcran("EcranItineraires");
}
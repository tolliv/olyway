//==================================================================================================
// Ecran NOUVEAU PARCOURS
//==================================================================================================

//--------------------------------------------------------------------------------------------------
// Afficher écran de démarrage pour demander confirmation ou non
//--------------------------------------------------------------------------------------------------
function AfficherEcranEnregistrement()
{
  if (gVoixInterface) Speech("nouveau parcours");

  // Reinit l'affichage avant d'afficher la fenêtre
  pid('ButNouveauParcoursDemarrer').style.display = 'none';
  pid('TxtAttentePrecision').innerHTML = "";
  AfficherEcran('EcranNouveauParcours');

  // La machine d'état est démarrée et le restera jusqu'à la fermeture de l'application
  gStateEnregistrement = 'DEMARRAGE';
  // openFullscreen();
  ActiverWakeLock();
  StateMachineEnregistrement();
}

//--------------------------------------------------------------------------------------------------
// Démarrer un nouveau parcours
//--------------------------------------------------------------------------------------------------
function ButNouveauParcoursDemarrerClick()
{
  EnregistrementDemarrer();
}

//--------------------------------------------------------------------------------------------------
// Finalement on ne veut pas créer un nouveau parcours
//--------------------------------------------------------------------------------------------------
function ButNouveauParcoursAnnulerClick()
{
  FinNouveauParcours();
}

//--------------------------------------------------------------------------------------------------
// Fin nouveau parcourrs
//--------------------------------------------------------------------------------------------------
function FinNouveauParcours()
{
  // Arrêt de la machine d'état
  gStateEnregistrement = 'ARRET';
  // closeFullscreen();

  // Arrêt geolocalisation et retour au menu principal
  ArretGeolocalisation();
  DesactiverWakeLock();
  AfficherEcranPrincipal();
}
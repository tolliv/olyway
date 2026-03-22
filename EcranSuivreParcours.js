//==================================================================================================
// Ecran SUIVRE PARCOURS
//==================================================================================================
let gSuiviParcoursChoix = 0;
const AU_DEPART = 1;
const AU_PLUS_PRES = 2;

//--------------------------------------------------------------------------------------------------
// Affichage de l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranSuivreParcours()
{
  if (gVoixInterface) Speech("Suivre un parcours");
  CallSelectionOK = SuivreParcoursSelectionne;
  CallSelectionAnnuler = AfficherEcranPrincipal;
  AfficherEcranSelection();
}

//----- Parcours sélectionné -----
function SuivreParcoursSelectionne(pCle)
{
  // Lecture du parcours depuis le localStorage
  const donneesBrutes = localStorage.getItem(pCle);
  let lErreur = false;
  if (donneesBrutes)
  {
    const lParcours = JSON.parse(donneesBrutes);
    gTableauMesures = lParcours.points;
    if (gTableauMesures.length < 2)
      lErreur = true;
  }
  else
  {
    //si la clé n'existe pas, on vide le tableau
    gTableauMesures = [];
    lErreur = true;
  }

  // Action suivant erreur ou pas
  if (!lErreur)
  {
    AfficherEcran('EcranSuivreParcours_Choix');
  }
  else
  {
    alert("Problème de lecture du parcours");
  }
}

//--------------------------------------------------------------------------------------------------
// Choix de partir du départ
//--------------------------------------------------------------------------------------------------
function ButSuivreParcoursAuDepartClick()
{
  gSuiviParcoursChoix = AU_DEPART;
  ActiverWakeLock();
  gStateSuivi = 'DEMARRAGE';
  pid('TxtAttentePrecisionSuivi').innerHTML = "";
  AfficherEcran('EcranSuivreParcours');
  StateMachineSuivi();
}

//--------------------------------------------------------------------------------------------------
// Choix de partir du point le plus près
//--------------------------------------------------------------------------------------------------
function ButSuivreParcoursAuPlusPresClick()
{
  gSuiviParcoursChoix = AU_PLUS_PRES;
  ActiverWakeLock();
  gStateSuivi = 'DEMARRAGE';
  pid('TxtAttentePrecisionSuivi').innerHTML = "";
  AfficherEcran('EcranSuivreParcours');
  StateMachineSuivi();
}

//--------------------------------------------------------------------------------------------------
// Annulation du suivi de parcours
//--------------------------------------------------------------------------------------------------
function ButSuivreParcoursAnnulerClick()
{
  // Arrêt de la machine d'état
  gStateSuivi = 'ARRET';
  ArretGeolocalisation();
  DesactiverWakeLock();
  AfficherEcranPrincipal();
}
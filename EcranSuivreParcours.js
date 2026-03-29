//==================================================================================================
// Ecran SUIVRE PARCOURS
//==================================================================================================
let gSuiviParcoursChoix = '';

//--------------------------------------------------------------------------------------------------
// Affichage de l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranSuivreParcours()
{
  SpeechStop();
  if (IsNotInstalled())
  {
    if (gVoixInterface) Speech("Suivre un parcours");
    CallSelectionOK = SuivreParcoursSelectionne;
    CallSelectionAnnuler = AfficherEcranPrincipal;
    AfficherEcranSelection();
  }
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
    SpeechStop();
    AfficherEcran('EcranSuivreParcours_Choix');
    if (gVoixInterface) Speech("écran mode");
  }
  else
  {
    alert("Problème de lecture du parcours");
  }
}

//--------------------------------------------------------------------------------------------------
// Choix de partir du départ ou d'un autre point
//--------------------------------------------------------------------------------------------------
function ButSuivreParcoursAuDepartClick()
{
  ButSuivreParcoursCommon('AU_DEPART', "Aller au départ");
}
function ButSuivreParcoursAuPlusPresClick()
{
  ButSuivreParcoursCommon('AU_PLUS_PRES', "Aller à un point");
}
function ButSuivreParcoursCommon(pChoix, pTexte)
{
  gSuiviParcoursChoix = pChoix;
  ActiverWakeLock();
  gStateSuivi = 'DEMARRAGE';
  pid('ConteneurBoussole').style.display = 'none';
  pid('TxtAttentePrecisionSuivi').innerHTML = "";
  pid('TitreSuivreParcours').innerHTML = pTexte;
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
  StopCompass();
  DesactiverWakeLock();
  SpeechStop();
  AfficherEcranPrincipal();
}
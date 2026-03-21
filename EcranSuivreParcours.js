//==================================================================================================
// Ecran SUIVRE PARCOURS
//==================================================================================================

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
  AfficherEcran('EcranSuivreParcours');
}


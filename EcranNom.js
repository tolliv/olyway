//==================================================================================================
// Ecran Nom
//==================================================================================================
//--------------------------------------------------------------------------------------------------
// Afficher l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranNom()
{
  if (gVoixInterface) Speech("Saisir un nom");
  AfficherEcran("EcranNom");
}

//--------------------------------------------------------------------------------------------------
// Validation du nom
//--------------------------------------------------------------------------------------------------
function ButNomValiderClick()
{
  // Conversion en GPX, et sauvegarde
  lDate = pid('TxtNomParcours').value;
  if (lDate == null || lDate == "")       // Protection
    lDate = FormaterDatePourFichier();
  SaveGPX(gTableauMesures, lDate);
  AfficherEcranPrincipal();
}

//--------------------------------------------------------------------------------------------------
// Annulation, il n'y a pas de sauvegarde
//--------------------------------------------------------------------------------------------------
function ButNomAnnulerClick()
{
  AfficherEcranPrincipal();
}

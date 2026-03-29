//==================================================================================================
// Ecran Principal
//==================================================================================================
//--------------------------------------------------------------------------------------------------
// Afficher l'écran
//--------------------------------------------------------------------------------------------------
async function AfficherEcranPrincipal()
{
  SpeechStop();
  if (!gModeSimulation)
    openFullscreen();

  // On continue s'il n'y a pas de nouvelle version
  if (IsNotInstalled())
  {
    if (gVoixInterface) Speech("écran principal");
    AfficherEcran("EcranPrincipal");
  }
}


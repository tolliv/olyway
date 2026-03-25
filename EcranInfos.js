//==================================================================================================
// Ecran INFOS
//==================================================================================================

//--------------------------------------------------------------------------------------------------
// Afficher l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranInfos()
{
  SpeechStop();
  if (gVoixInterface) Speech("écran informations");
  AfficherInfosParam();
  AfficherEcran("EcranInfos");
}

//--------------------------------------------------------------------------------------------------
// Afficher les paramètres
//--------------------------------------------------------------------------------------------------
function AfficherInfosParam()
{
  let lInfos = "";
  lInfos += "VERSION : \n" + VERSION.substring(0, 2) + " " + VERSION.substring(2, 4) + " " +VERSION.substring(5, 10) + "\n\n";
  lInfos += "CONTACT : \nvillot31@orange.fr";
  pid('TxtInfos').innerHTML = lInfos;
}




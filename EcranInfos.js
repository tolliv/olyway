//==================================================================================================
// Ecran INFOS
//==================================================================================================

//--------------------------------------------------------------------------------------------------
// Afficher l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranInfos()
{
  if (gInterfaceSon) Speech("menu informations");
  AfficherInfosParam();
  AfficherEcran("EcranInfos");
}

//--------------------------------------------------------------------------------------------------
// Afficher les paramètres
//--------------------------------------------------------------------------------------------------
function AfficherInfosParam()
{
  pid('TxtInfosVersion').innerHTML = "Version \n" + VERSION.substring(0, 2) + " " + VERSION.substring(2, 4) + " " +VERSION.substring(5, 10);
  pid('TxtInfosAuteurs').innerHTML = "Auteurs \ntolliv & frneko";
}




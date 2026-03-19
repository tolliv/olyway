//==================================================================================================
// Ecran PARCOURS INFOS
//==================================================================================================

//--------------------------------------------------------------------------------------------------
// Afficher l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranParcoursInfos(pCle)
{
  if (gVoixInterface) Speech("informations du parcours");
  AfficherParcoursInfosParam(pCle);
  AfficherEcran("EcranParcoursInfos");
}

//--------------------------------------------------------------------------------------------------
// Afficher les paramètres
//--------------------------------------------------------------------------------------------------
function AfficherParcoursInfosParam(pCle)
{
  let lDonneesJSON = localStorage.getItem(pCle);
  let lObjetParcours = JSON.parse(lDonneesJSON);
  let lNom = lObjetParcours.nom;

  let lInfos = "";
  lInfos += "DATE: \n" + pCle + "\n\n";
  lInfos += "NOM : \n" + lNom + "\n\n";
  lInfos += "DISTANCE : \n" + lObjetParcours.distance.toFixed(1) + "km\n\n";

  pid('TxtParcoursInfos').innerHTML = lInfos;
}




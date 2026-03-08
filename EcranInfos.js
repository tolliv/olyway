//==================================================================================================
// Ecran INFOS
//==================================================================================================
const gInfosParamListe = ["VERSION", "AUTEURS"];
let gInfosParam = "VERSION"; // Valeur par défaut

//--------------------------------------------------------------------------------------------------
// Afficher l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranInfos()
{
  if (gInterfaceSon) Speech("écran infos");
  AfficherEcran("EcranInfos");
  AfficherInfosParam();
}

//--------------------------------------------------------------------------------------------------
// Afficher les paramètres
//--------------------------------------------------------------------------------------------------
function AfficherInfosParam()
{
  // Liste des paramètres
  switch(gInfosParam)
  {
    case "VERSION":
        pid('TxtInfosParam').innerHTML = "VERSION (+)";
        pid('TxtInfosValeur').innerHTML = VERSION.substring(0, 2) + " " + VERSION.substring(2, 4) + " " +VERSION.substring(5, 10);
      break;
    case "AUTEURS":
        pid('TxtInfosParam').innerHTML = "AUTEURS (+)";
        pid('TxtInfosValeur').innerHTML = "tolliv & frneko";
      break;
  }
}

//--------------------------------------------------------------------------------------------------
// Paramètre suivant
//--------------------------------------------------------------------------------------------------
function TxtInfosParamClick()
{
  let lIndex = gInfosParamListe.indexOf(gInfosParam);
  lIndex = (lIndex + 1) % gInfosParamListe.length;
  gInfosParam = gInfosParamListe[lIndex];
  AfficherInfosParam();
}



//==================================================================================================
// Ecran Principal
//==================================================================================================
//--------------------------------------------------------------------------------------------------
// Afficher l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranPrincipal()
{
  if (gInterfaceSon) Speech("écran principal");
  AfficherEcran("EcranPrincipal");
}

//--------------------------------------------------------------------------------------------------
// Activer ou non le son sur l'interface
//--------------------------------------------------------------------------------------------------
let gInterfaceSon = true;
function EcranPrincipalVoixClick()
{
  if (gInterfaceSon == true)
  {
    Speech("voix désactivée")
    pid('EcranPrincipalVoix').innerHTML = "VOIX DESACTIVÉE";
    pid('EcranPrincipalVoix').style.backgroundColor = "#000";
    pid('EcranPrincipalVoix').style.color = "#FFF";
    gInterfaceSon = false;
  }
  else
  {
    Speech("voix activée")
    pid('EcranPrincipalVoix').innerHTML = "VOIX ACTIVÉE";
    pid('EcranPrincipalVoix').style.backgroundColor = "#0F0";
    pid('EcranPrincipalVoix').style.color = "#000";
    gInterfaceSon = true;
  }
}

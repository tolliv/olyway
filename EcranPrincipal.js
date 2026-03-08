//==================================================================================================
// Ecran Principal
//==================================================================================================
//--------------------------------------------------------------------------------------------------
// Afficher l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranPrincipal()
{
  if (gInterfaceSon) Speech("menu principal");
  AfficherEcran("EcranPrincipal");
}

//--------------------------------------------------------------------------------------------------
// Activer ou non le son sur l'interface
//--------------------------------------------------------------------------------------------------
let gInterfaceSon = true;                   // activée par défaut
function EcranPrincipalVoixClick()
{
  if (gInterfaceSon == true)
  {
    Speech("voix désactivée")
    pid('EcranPrincipalVoix').innerHTML = "Voix désactivée";
    pid('EcranPrincipalVoix').style.backgroundColor = "#000";
    pid('EcranPrincipalVoix').style.color = "#FFF";
    gInterfaceSon = false;
  }
  else
  {
    Speech("voix activée")
    pid('EcranPrincipalVoix').innerHTML = "Voix activée";
    pid('EcranPrincipalVoix').style.backgroundColor = "#0F0";
    pid('EcranPrincipalVoix').style.color = "#000";
    gInterfaceSon = true;
  }
}

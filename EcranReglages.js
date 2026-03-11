//==================================================================================================
// Ecran REGLAGES
//==================================================================================================

let gInterfaceSon;
function AfficherEcranReglages()
{
  AfficherEcran("EcranReglages");

  // Valeurs par défaut
  gInterfaceSon = true;
  ButReglagesVoixOn();
}

function ButReglagesVoixClick()
{
  if (gInterfaceSon)
    ButReglagesVoixOff();
  else
    ButReglagesVoixOn();
}

function ButReglagesVoixOn()
{
  gInterfaceSon = true;
  pid('ButReglagesVoix').classList.remove('classReglageOff');
  pid('ButReglagesVoix').classList.add('classReglageOn');
  pid('ButReglagesVoix').innerHTML = "<div>Voix Interface<br><span class='texte-active'>Activée</span></div>";
}

function ButReglagesVoixOff()
{
  gInterfaceSon = false;
  pid('ButReglagesVoix').classList.remove('classReglageOn');
  pid('ButReglagesVoix').classList.add('classReglageOff');
  pid('ButReglagesVoix').innerHTML = "<div>Voix Interface<br><span class='texte-desactive'>Désactivée</span></div>";
}
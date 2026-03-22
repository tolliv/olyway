//==================================================================================================
// Ecran REGLAGES
//==================================================================================================
// Valeurs par défaut
let gVoixInterface = false;
let gVoixNavigation = true;

//--------------------------------------------------------------------------------------------------
// Affichage de l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranReglages()
{
  if (gVoixInterface) Speech("réglages");

  if (!gVoixInterface)  ButVoixInterfaceOff();
  else                  ButVoixInterfaceOn();

  if (!gVoixNavigation) ButVoixNavigationOff();
  else                  ButVoixNavigationOn();
  AfficherEcran("EcranReglages");
}

//--------------------------------------------------------------------------------------------------
// Réglage : Voix de l'interface
//--------------------------------------------------------------------------------------------------
function ButVoixInterfaceClick()
{
  if (gVoixInterface)
  {
    ButVoixInterfaceOff();
    Speech("voix interface désactivée");
  }
  else
  {
    ButVoixInterfaceOn();
    Speech("voix interface activée");
  }
}

function ButVoixInterfaceOn()
{
  gVoixInterface = true;
  pid('ButVoixInterface').classList.remove('classReglageOff');
  pid('ButVoixInterface').classList.add('classReglageOn');
  pid('ButVoixInterface').innerHTML = "<div>Voix interface<br><span class='texte-active'>Activée</span></div>";
}

function ButVoixInterfaceOff()
{
  gVoixInterface = false;
  pid('ButVoixInterface').classList.remove('classReglageOn');
  pid('ButVoixInterface').classList.add('classReglageOff');
  pid('ButVoixInterface').innerHTML = "<div>Voix interface<br><span class='texte-desactive'>Désactivée</span></div>";
}

//--------------------------------------------------------------------------------------------------
// Réglage : Voix pendant la navigation
//--------------------------------------------------------------------------------------------------
function ButVoixNavigationClick()
{
  if (gVoixNavigation)
  {
    ButVoixNavigationOff();
    if (gVoixInterface) Speech("voix navigation activée");
  }
  else
  {
    ButVoixNavigationOn();
    if (gVoixInterface) Speech("voix navigation désactivée");
  }
}

function ButVoixNavigationOn()
{
  gVoixNavigation = true;
  pid('ButVoixNavigation').classList.remove('classReglageOff');
  pid('ButVoixNavigation').classList.add('classReglageOn');
  pid('ButVoixNavigation').innerHTML = "<div>Voix navigation<br><span class='texte-active'>Activée</span></div>";
}

function ButVoixNavigationOff()
{
  gVoixNavigation = false;
  pid('ButVoixNavigation').classList.remove('classReglageOn');
  pid('ButVoixNavigation').classList.add('classReglageOff');
  pid('ButVoixNavigation').innerHTML = "<div>Voix navigation<br><span class='texte-desactive'>Désactivée</span></div>";
}
//==================================================================================================
// Ecran REGLAGES
//==================================================================================================
// Valeurs par défaut
let gVoixInterface = true;
let gVoixNavigation = true;

//--------------------------------------------------------------------------------------------------
// Affichage de l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranReglages()
{
  if (gVoixInterface) Speech("réglages");
  AfficherEcran("EcranReglages");
}

//--------------------------------------------------------------------------------------------------
// Réglage : Voix de l'interface
//--------------------------------------------------------------------------------------------------
function ButVoixInterfaceClick()
{
  if (gVoixInterface)
    ButVoixInterfaceOff();
  else
    ButVoixInterfaceOn();
}

function ButVoixInterfaceOn()
{
  gVoixInterface = true;
  if (gVoixInterface) Speech("voix interface activée");
  pid('ButVoixInterface').classList.remove('classReglageOff');
  pid('ButVoixInterface').classList.add('classReglageOn');
  pid('ButVoixInterface').innerHTML = "<div>Voix interface<br><span class='texte-active'>Activée</span></div>";
}

function ButVoixInterfaceOff()
{
  if (gVoixInterface) Speech("voix interface désactivée");
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
    ButVoixNavigationOff();
  else
    ButVoixNavigationOn();
}

function ButVoixNavigationOn()
{
  gVoixNavigation = true;
  if (gVoixNavigation) Speech("voix navigation activée");
  pid('ButVoixNavigation').classList.remove('classReglageOff');
  pid('ButVoixNavigation').classList.add('classReglageOn');
  pid('ButVoixNavigation').innerHTML = "<div>Voix navigation<br><span class='texte-active'>Activée</span></div>";
}

function ButVoixNavigationOff()
{
  if (gVoixNavigation) Speech("voix navigation désactivée");
  gVoixNavigation = false;
  pid('ButVoixNavigation').classList.remove('classReglageOn');
  pid('ButVoixNavigation').classList.add('classReglageOff');
  pid('ButVoixNavigation').innerHTML = "<div>Voix navigation<br><span class='texte-desactive'>Désactivée</span></div>";
}
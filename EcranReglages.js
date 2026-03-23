//==================================================================================================
// Ecran REGLAGES
//==================================================================================================
// Valeurs par défaut
let gVoixInterface = false;
let gVoixNavigation = true;
let gCouleur = true;

//--------------------------------------------------------------------------------------------------
// Affichage de l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranReglages()
{
  if (gVoixInterface) Speech("écran réglages");

  if (!gVoixInterface)  ButVoixInterfaceOff();
  else                  ButVoixInterfaceOn();

  if (!gVoixNavigation) ButVoixNavigationOff();
  else                  ButVoixNavigationOn();

  if (!gCouleur)        ButCouleurOff();
  else                  ButCouleurOn();
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
  pid('ButVoixInterface').innerHTML = "<div>Interface<br><span class='texte-active'>Activée</span></div>";
}

function ButVoixInterfaceOff()
{
  gVoixInterface = false;
  pid('ButVoixInterface').classList.remove('classReglageOn');
  pid('ButVoixInterface').classList.add('classReglageOff');
  pid('ButVoixInterface').innerHTML = "<div>Interface<br><span class='texte-desactive'>Désactivée</span></div>";
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
  pid('ButVoixNavigation').innerHTML = "<div>Navigation<br><span class='texte-active'>Activée</span></div>";
}

function ButVoixNavigationOff()
{
  gVoixNavigation = false;
  pid('ButVoixNavigation').classList.remove('classReglageOn');
  pid('ButVoixNavigation').classList.add('classReglageOff');
  pid('ButVoixNavigation').innerHTML = "<div>Navigation<br><span class='texte-desactive'>Désactivée</span></div>";
}


//--------------------------------------------------------------------------------------------------
// Réglage : couleur du texte blanche (OFF) ou jaune (ON)
//--------------------------------------------------------------------------------------------------
function ButCouleurClick()
{
  if (gCouleur)
  {
    ButCouleurOff();
    if (gVoixInterface) Speech("couleur blanche");
  }
  else
  {
    ButCouleurOn();
    if (gVoixInterface) Speech("couleur jaune");
  }
}

function ButCouleurOn()
{
  gCouleur = true;
  pid('ButCouleur').classList.remove('classReglageOff');
  pid('ButCouleur').classList.add('classReglageOn');
  pid('ButCouleur').innerHTML = "<div>Couleur<br><span class='texte-active'>Jaune</span></div>";
  document.documentElement.style.setProperty('--COLOR', '#FF6');
}

function ButCouleurOff()
{
  gCouleur = false;
  pid('ButCouleur').classList.remove('classReglageOn');
  pid('ButCouleur').classList.add('classReglageOff');
  pid('ButCouleur').innerHTML = "<div>Couleur<br><span class='texte-desactive'>Blanche</span></div>";
  document.documentElement.style.setProperty('--COLOR', '#FFF');
}

//==================================================================================================
// Ecran REGLAGES
//==================================================================================================

//--------------------------------------------------------------------------------------------------
// Affichage de l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranReglages()
{
  SpeechStop();
  if (IsNotInstalled())
  {
    if (gVoixInterface) Speech("écran réglages");

    if (gVoixInterface)  ButVoixInterfaceOn();
    else                 ButVoixInterfaceOff();

    if (gVoixNavigation) ButVoixNavigationOn();
    else                 ButVoixNavigationOff();

    if (gCouleur)        ButCouleurOn();
    else                 ButCouleurOff();
    AfficherEcran("EcranReglages");
  }
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
  localStorage.setItem('ParamVoixInterface', gVoixInterface?'1':'0');
}

function ButVoixInterfaceOff()
{
  gVoixInterface = false;
  pid('ButVoixInterface').classList.remove('classReglageOn');
  pid('ButVoixInterface').classList.add('classReglageOff');
  pid('ButVoixInterface').innerHTML = "<div>Interface<br><span class='texte-desactive'>Désactivée</span></div>";
}

function ButVoixInterfaceOn()
{
  gVoixInterface = true;
  pid('ButVoixInterface').classList.remove('classReglageOff');
  pid('ButVoixInterface').classList.add('classReglageOn');
  pid('ButVoixInterface').innerHTML = "<div>Interface<br><span class='texte-active'>Activée</span></div>";
}


//--------------------------------------------------------------------------------------------------
// Réglage : Voix pendant la navigation
//--------------------------------------------------------------------------------------------------
function ButVoixNavigationClick()
{
  if (gVoixNavigation)
  {
    ButVoixNavigationOff();
    if (gVoixInterface) Speech("voix navigation désactivée");
  }
  else
  {
    ButVoixNavigationOn();
    if (gVoixInterface) Speech("voix navigation activée");
  }
  localStorage.setItem('ParamVoixNavigation', gVoixNavigation?'1':'0');
}

function ButVoixNavigationOff()
{
  gVoixNavigation = false;
  pid('ButVoixNavigation').classList.remove('classReglageOn');
  pid('ButVoixNavigation').classList.add('classReglageOff');
  pid('ButVoixNavigation').innerHTML = "<div>Navigation<br><span class='texte-desactive'>Désactivée</span></div>";
}

function ButVoixNavigationOn()
{
  gVoixNavigation = true;
  pid('ButVoixNavigation').classList.remove('classReglageOff');
  pid('ButVoixNavigation').classList.add('classReglageOn');
  pid('ButVoixNavigation').innerHTML = "<div>Navigation<br><span class='texte-active'>Activée</span></div>";
}



//--------------------------------------------------------------------------------------------------
// Réglage : couleur du texte Jaune (ON / true) ou Blanche (OFF / false)
//--------------------------------------------------------------------------------------------------
function ButCouleurClick()
{
  if (gCouleur)
  {
    ButCouleurOff();
    if (gVoixInterface) Speech("couleur jaune désactivée");
  }
  else
  {
    ButCouleurOn();
    if (gVoixInterface) Speech("couleur jaune activée");
  }
  localStorage.setItem('ParamCouleur', gCouleur?'1':'0');
}

function ButCouleurOff()
{
  gCouleur = false;
  pid('ButCouleur').classList.remove('classReglageOn');
  pid('ButCouleur').classList.add('classReglageOff');
  pid('ButCouleur').innerHTML = "<div>Jaune<br><span class='texte-desactive'>Désactivée</span></div>";
  document.documentElement.style.setProperty('--COLOR', '#FFF');
  document.documentElement.style.setProperty('--SUBCOLOR', '#FF6');
}

function ButCouleurOn()
{
  gCouleur = true;
  pid('ButCouleur').classList.remove('classReglageOff');
  pid('ButCouleur').classList.add('classReglageOn');
  pid('ButCouleur').innerHTML = "<div>Jaune<br><span class='texte-active'>Activée</span></div>";
  document.documentElement.style.setProperty('--COLOR', '#FF6');
  document.documentElement.style.setProperty('--SUBCOLOR', '#FFF');
}


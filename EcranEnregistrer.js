//==================================================================================================
// Ecran ENREGISTRER
//==================================================================================================
//----- Paramètres de configuration -----
let gParamTempsPauseDebut = 1*4;  // PARAM
let gParamTempsPause = 4*4;  // PARAM

//----- Variables globales à cet écran -----
let gTimeoutReprendre = null;
let gRequestStopStateMachine = false;
let gStateEnregistrement = 'ARRET';
let gCounterPause = 0;
let gCounterIndicateurEnregistrement = 0;
let gChaineIndicateurEnregistrement = "";

//--------------------------------------------------------------------------------------------------
// Afficher l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranEnregistrer()
{
  if (gInterfaceSon) Speech("écran enregistrer");
  AfficherEcran("EcranEnregistrer");
}

//--------------------------------------------------------------------------------------------------
// Enregistrer un nouvel parcours
//--------------------------------------------------------------------------------------------------
function ButtonEnregistrerDemarrerClick()
{
  ActiverWakeLock();
  if (DEBUG == 0) openFullscreen(); // DEBUG supprimer commentaire si release

  if (gInterfaceSon) Speech("Enregistrement démarré.");
  AttenteFinSpeech();

  // Puis lance la state machine
  gStateEnregistrement = 'AFFICHAGE_DEBUT';
  gCounterPause = gParamTempsPauseDebut;
  StateMachineEnregistrement();
  AfficherEcran("EcranPause");
  AfficheReleves();
}

//--------------------------------------------------------------------------------------------------
// Affichage des relevés pendant l'enregistrement
// Durée, distance
//--------------------------------------------------------------------------------------------------
function AfficheReleves()
{
  // Récupération des valeurs
  let lDuree = "1 heure 04 minutes";
  let lDistance = "2,83km";

  // Texte pour l'affichage
  let lAffichage = "DURÉE :\n" + lDuree + "\n\nDISTANCE :\n" + lDistance;
  pid('TxtReleves').innerHTML = lAffichage;

  // Texte pour le Speech
  let lSpeech = "Durée " + lDuree + ". Distance " + lDistance;
//  if (gInterfaceSon) Speech(lSpeech);
}


//--------------------------------------------------------------------------------------------------
// Appui bouton pendant l'enregistrement
//--------------------------------------------------------------------------------------------------
function ButtonEnregistrementStopClick()
{
  if (gInterfaceSon) Speech("Ecran réactivé.");
  AfficheReleves();
  AfficherEcran('EcranPause');
  gStateEnregistrement = 'PAUSE';
  gCounterPause = gParamTempsPause;
}

//--------------------------------------------------------------------------------------------------
// Reinit timeout pause
//--------------------------------------------------------------------------------------------------
function ButRelevesEnregistrementClick()
{
  gCounterPause = gParamTempsPause;
}

//--------------------------------------------------------------------------------------------------
// Arrêter l'enregistrement
//--------------------------------------------------------------------------------------------------
function EnregistrementArreter()
{
  if (gInterfaceSon) Speech("Enregistrement arrêté.");
  if (gTimeoutReprendre !== null)
  {
    clearTimeout(gTimeoutReprendre);
    gTimeoutReprendre = null;
  }
  DesactiverWakeLock();
  if (DEBUG == 0) closeFullscreen();
  AfficherEcran("EcranParcours");
}

//--------------------------------------------------------------------------------------------------
// State machine Enregistrement
// Réveillée toutes les 300ms
//--------------------------------------------------------------------------------------------------
function StateMachineEnregistrement()
{
  setTimeout(() =>
  {
    switch(gStateEnregistrement)
    {
      // Rien à faire
      case 'ARRET':
        break;

      // Affichage de l'écran Pause juste après démarrer
      case 'AFFICHAGE_DEBUT':
        gCounterPause--;
        pid('TxtPauseInfos').innerHTML = gCounterPause;
        if (gCounterPause <= 0)
        {
          AfficherEcran('EcranEnregistrement');
          gChaineIndicateurEnregistrement = "O";
          gCounterIndicateurEnregistrement = 0;
          gStateEnregistrement = 'RUN';
          if (gInterfaceSon) Speech("Ecran désactivé.");
        }
        break;

      // Mode RUN ou seul l'écran Enregistrement est affiché
      case 'RUN':
        gCounterIndicateurEnregistrement++;
        if (gCounterIndicateurEnregistrement >= 100)
        {
          gChaineIndicateurEnregistrement = "O";
          gCounterIndicateurEnregistrement = 0;
        }

        if ( (gCounterIndicateurEnregistrement % 8) == 1)
        {
          gChaineIndicateurEnregistrement = "&nbsp;" + gChaineIndicateurEnregistrement;
          pid('BoutonEnregistrement').innerHTML = gChaineIndicateurEnregistrement;
        }

        if ( (gCounterIndicateurEnregistrement % 8) == 2)
          pid('BoutonEnregistrement').innerHTML = "";
        break;

      // Appui sur l'écran Enregistrement : Pause
      case 'PAUSE':
        gCounterPause--;
        pid('TxtPauseInfos').innerHTML = gCounterPause;
        if (gCounterPause <= 0)
        {
          AfficherEcran('EcranEnregistrement');
          gChaineIndicateurEnregistrement = "O";
          gCounterIndicateurEnregistrement = 0;
          gStateEnregistrement = 'RUN';
          if (gInterfaceSon) Speech("Ecran désactivé.");
        }
        break;
    }

    // Arrêt ou pas de la state machine
    if (!gRequestStopStateMachine)
      StateMachineEnregistrement();
  }, 250);
}
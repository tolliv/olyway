//==================================================================================================
// Ecran ENREGISTRER
//==================================================================================================
//----- Paramètres de configuration -----
let gParamTempsPauseDebut = 4*15;  // PARAM
let gParamTempsPause =      4*15;   // PARAM
if (DEBUG == 1)
{
  gParamTempsPauseDebut = 4*2;
  gParamTempsPause      = 4*2;
}

//----- Variables globales à cet écran -----
let gTimeoutReprendre = null;
let gRequestStopStateMachine = false;
let gStateEnregistrement = 'ARRET';
let gCounterPause = 0;
let gCounterIndicateurEnregistrement = 0;
let gChaineIndicateurEnregistrement = "";


//--------------------------------------------------------------------------------------------------
// Afficher écran de démarrage pour demander confirmation ou non
//--------------------------------------------------------------------------------------------------
function AfficherEcranEnregistrement()
{
  if (gInterfaceSon) Speech("menu enregistrement");
  AfficherEcran('EcranDemarrer');
}

//--------------------------------------------------------------------------------------------------
// Démarrage de l'enregistrement
//--------------------------------------------------------------------------------------------------
function ButEnregistrementDemarrerClick()
{
    ActiverWakeLock();
    if (DEBUG == 0) openFullscreen(); // DEBUG supprimer commentaire si release

    if (gInterfaceSon) Speech("Enregistrement démarré.");
    await AttenteFinSpeech();

    // Puis lance la state machine
    AfficherEcran('EcranEnregistrement');
    gChaineIndicateurEnregistrement = "O";
    gCounterIndicateurEnregistrement = 0;
    gStateEnregistrement = 'RUN';
    StateMachineEnregistrement();
}

//--------------------------------------------------------------------------------------------------
// Annulation de l'enregistrement
//--------------------------------------------------------------------------------------------------
function ButEnregistrementAnnulerClick()
{
  AfficherEcranPrincipal();
}

//--------------------------------------------------------------------------------------------------
// Appui bouton pendant l'enregistrement
//--------------------------------------------------------------------------------------------------
function ButtonEnregistrementStopClick()
{
  AfficheReleves();
  AfficherEcran('EcranPause');
  gStateEnregistrement = 'PAUSE';
  gCounterPause = gParamTempsPause;
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
  let lHeure = "15 heures 34 minutes";
  let lBatterie = "53%";

  // Texte pour l'affichage
  let lAffichage = "";
  lAffichage += "DURÉE :\n" + lDuree + "\n\n";
  lAffichage += "DISTANCE :\n" + lDistance + "\n\n";
  lAffichage += "HEURE :\n" + lHeure + "\n\n";
  lAffichage += "BATTERIE :\n" + lBatterie + "\n\n";
  pid('TxtReleves').innerHTML = lAffichage;

  // Texte pour le Speech
  let lSpeech = "";
  lSpeech += "Durée " + lDuree + "\n";
  lSpeech += "Distance " + lDistance + "\n";
  lSpeech += "Heure " + lHeure + "\n";
  lSpeech += "Batterie " + lBatterie + "\n";
  if (gInterfaceSon) Speech(lSpeech);
}


//--------------------------------------------------------------------------------------------------
// Reinit timeout pause en cliquant sur l'écran des mesures
//--------------------------------------------------------------------------------------------------
function ButRelevesEnregistrementClick()
{
  gCounterPause = gParamTempsPause;
}

//--------------------------------------------------------------------------------------------------
// Arrêter l'enregistrement
//--------------------------------------------------------------------------------------------------
function ButEnregistrementArreter()
{
  gStateEnregistrement = 'ARRET';
  DesactiverWakeLock();
  if (DEBUG == 0) closeFullscreen();
  if (gInterfaceSon) Speech("Arrêt de l'enregistrement. Le parcours est mémorisé");
  await AttenteFinSpeech();
  AfficherEcranPrincipal();
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
          if (gInterfaceSon) Speech("Extinction de l'écran.");
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

      // Pause suite à un appui sur l'écran
      // On repasse en extinction de l'écran qu'au bout d'un certain temps et si pas de speech en cours
      case 'PAUSE':
        gCounterPause--;
        pid('TxtPauseInfos').innerHTML = gCounterPause;
        if ((gCounterPause <= 0) && (!window.speechSynthesis.speaking))
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
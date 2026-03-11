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
const gSymboleEnregistrement = "🔴";


//--------------------------------------------------------------------------------------------------
// Démarrage de l'enregistrement
//--------------------------------------------------------------------------------------------------
function EnregistrementDemarrer()
{
    ActiverWakeLock();
    // openFullscreen();

    if (gInterfaceSon) Speech("Enregistrement démarré.");
    AttenteFinSpeech();

    // Puis lance la state machine
    AfficherEcran('EcranEnregistrement');
    gStateEnregistrement = 'EXTINCTION';
    gCounterIndicateurEnregistrement = 0;
    pid('BoutonEnregistrement').innerHTML = gSymboleEnregistrement;

    // La machine d'état est démarré et le restera jusqu'à la fermeture de l'application
    StateMachineEnregistrement();
}

//--------------------------------------------------------------------------------------------------
// Appui bouton pendant l'enregistrement
//--------------------------------------------------------------------------------------------------
function ButtonEnregistrementStopClick()
{
  AfficheReleves();
  AfficherEcran('EcranPause');
  gStateEnregistrement = 'ALLUMAGE';
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
  // closeFullscreen();
  if (gInterfaceSon) Speech("Arrêt de l'enregistrement. Le parcours est mémorisé");
  AttenteFinSpeech();
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

      // Mode RUN ou seul l'écran Enregistrement est affiché
      case 'EXTINCTION':
        gCounterIndicateurEnregistrement++;

        if (gCounterIndicateurEnregistrement == 10)
        {
          pid('BoutonEnregistrement').innerHTML = gSymboleEnregistrement;
        }

        if (gCounterIndicateurEnregistrement == 15)
        {
          pid('BoutonEnregistrement').innerHTML = "";
          gCounterIndicateurEnregistrement = 0;
        }
        break;

      // Allumage de l'écran pause suite à un appui sur l'écran
      // On repasse en extinction de l'écran qu'au bout d'un certain temps et si pas de speech en cours
      case 'ALLUMAGE':
        gCounterPause--;
        pid('TxtPauseInfos').innerHTML = gCounterPause;
        if (gCounterPause <= 0)
        {
          AfficherEcran('EcranEnregistrement');
          gCounterIndicateurEnregistrement = 0;
          gStateEnregistrement = 'EXTINCTION';
          if (gInterfaceSon) Speech("Ecran désactivé.");
        }
        break;
    }

    // Arrêt ou pas de la state machine
    if (!gRequestStopStateMachine)
      StateMachineEnregistrement();
  }, 250);
}
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
let gGeoStatusPrev;
const gSymboleEnregistrement = "🔴";


//--------------------------------------------------------------------------------------------------
// Démarrage de l'enregistrement
//--------------------------------------------------------------------------------------------------
function EnregistrementDemarrer()
{
    ActiverWakeLock();
    // openFullscreen();

    if (gVoixInterface) Speech("Enregistrement démarré.");

    // Puis change l'état de la State Machine
    AfficherEcran('EcranEnregistrement');
    gStateEnregistrement = 'EXTINCTION';
    gCounterIndicateurEnregistrement = 0;
    pid('BoutonEnregistrement').innerHTML = gSymboleEnregistrement;
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
  if (gVoixInterface) Speech(lSpeech);
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
  if (gVoixInterface) Speech("Arrêt de l'enregistrement. Le parcours est mémorisé");
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
      //--------------------------------------------------------------------------------------------
      // ARRET : Rien à faire
      case 'ARRET':
        break;

      //--------------------------------------------------------------------------------------------
      // DEMARRAGE : nouveau parcours, lance la géolocalisation
      case 'DEMARRAGE':
        gGeoStatusPrev = 0;
        GeolocalisationWatch();
        pid('TxtAttentePrecision').innerHTML = "";
        gStateEnregistrement = 'DEMARRAGE_ATTENTE';
        break;

      //--------------------------------------------------------------------------------------------
      // DEMARRAGE_ATTENTE : attente de la précision
      case 'DEMARRAGE_ATTENTE':
        let lStatus = gGeoStatus;

        // Précision inconnue
        if (lStatus == 0)
        {
          pid('TxtAttentePrecision').innerHTML = "Précision inconnue";
        }

        // Il y a eu au moins une mesure
        else
        {
          if (lStatus > gGeoStatusPrev)
          {
            pid('TxtAttentePrecision').innerHTML = "Précision " + gGeoAccuracy + "m" + "\n(" +lStatus + ")";
            gGeoStatusPrev = lStatus;
          }

          // Pas de changement sur la précision
          else
          {
            // TODO
          }
        }

        // TODO
        if (lStatus == -1)
        {
        }

        // TODO
        if (lStatus == -2)
        {
        }
        break;

      //--------------------------------------------------------------------------------------------
      // EXTINCTION : mode RUN ou seul l'écran Enregistrement est affiché
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

      //--------------------------------------------------------------------------------------------
      // ALLUMAGE : allumage de l'écran pause suite à un appui sur l'écran
      // On ne repasse en extinction de l'écran qu'au bout d'un certain temps
      case 'ALLUMAGE':
        gCounterPause--;
        pid('TxtPauseInfos').innerHTML = gCounterPause;
        if (gCounterPause <= 0)
        {
          AfficherEcran('EcranEnregistrement');
          gCounterIndicateurEnregistrement = 0;
          gStateEnregistrement = 'EXTINCTION';
          if (gVoixInterface) Speech("Ecran désactivé.");
        }
        break;

      //--------------------------------------------------------------------------------------------
      // Erreur sur le nom de l'état
      default:
        console.log("Etat inconnu :", gStateEnregistrement);
    }

    // Arrêt ou pas de la state machine
    if (!gRequestStopStateMachine)
      StateMachineEnregistrement();
  }, 250);
}
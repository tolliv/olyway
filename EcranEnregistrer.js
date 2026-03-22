//==================================================================================================
// Ecran ENREGISTRER
// Contient la machine à état pour enregistrer un parcours
//==================================================================================================

gPARAM_TempsPause      = 4*11; // DEBUG:activer , RELEASE:commenter


//----- Variables globales à cet écran -----
let gTimeoutReprendre = null;
let gRequestStopStateMachine = false;
let gStateEnregistrement = 'ARRET';
let gCounterPause = 0;
let gCounterIndicateurEnregistrement = 0;
let gGeoStatusPrev;
let gGeoCompteurPrecisionOK;
const gSymboleEnregistrement = "🔴";
let gTableauMesures = null;
let gPointPrecedent = null;
let gDistanceTotale = 0;
let gDistancePointPrecedent = 0;

//--------------------------------------------------------------------------------------------------
// Démarrage de l'enregistrement
//--------------------------------------------------------------------------------------------------
function EnregistrementDemarrer()
{
    if (gVoixInterface) Speech("Enregistrement démarré.");

    // Premier point
    gTableauMesures = [];
    gPointPrecedent = null;
    gDistancePointPrecedent = 0;
    gDistanceTotale = 0;
    MemorisationMesure();

    // Puis change l'état de la State Machine
    AfficherEcran('EcranEnregistrement');
    gCounterIndicateurEnregistrement = 0;
    gStateEnregistrement = 'EXTINCTION';
    pid('BoutonEnregistrement').innerHTML = gSymboleEnregistrement;
}

//--------------------------------------------------------------------------------------------------
// Appui sur l'écran pendant l'enregistrement
// On lit les dernières mesures
//--------------------------------------------------------------------------------------------------
function EcranEnregistrementClick()
{
  AfficheReleves(true);
  gCounterPause = gPARAM_TempsPause;
  gStateEnregistrement = 'ALLUMAGE';
  AfficherEcran('EcranPause');
}

//--------------------------------------------------------------------------------------------------
// Reinit timeout pause en cliquant sur l'écran des mesures
//--------------------------------------------------------------------------------------------------
function ButRelevesEnregistrementClick()
{
  gCounterPause = gPARAM_TempsPause;
}

//--------------------------------------------------------------------------------------------------
// State machine Enregistrement
// Réveillée toutes les 250ms
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
      // Initialise toutes les variables
      case 'DEMARRAGE':
        gRequestStopStateMachineEnregistrement = false;
        gGeoStatusPrev = 0;
        gGeoCompteurPrecisionOK = 0;
        GeolocalisationWatch();
        pid('TxtAttentePrecisionEnregistrement').innerHTML = "";
        gStateEnregistrement = 'DEMARRAGE_ATTENTE';
        break;

      //--------------------------------------------------------------------------------------------
      // DEMARRAGE_ATTENTE : attente de la précision
      case 'DEMARRAGE_ATTENTE':
        let lStatus = gGeoStatus;

        // Précision inconnue
        if (lStatus == 0)
        {
          pid('TxtAttentePrecisionEnregistrement').innerHTML = "Précision inconnue";
        }

        // Il y a eu au moins une nouvelle mesure
        else
        {
          if (lStatus > gGeoStatusPrev)
          {
            pid('TxtAttentePrecisionEnregistrement').innerHTML = "Précision " + gGeoAccuracy + "m";
            gGeoStatusPrev = lStatus;

            // Compte pour avoir n valeurs en dessous du seuil avant d'afficher le bouton
            if (gGeoAccuracy <= gPARAM_PrecisionDemarrage)
              gGeoCompteurPrecisionOK++;
            else
              gGeoCompteurPrecisionOK = 0;
          }

          // Pas de nouvelle mesure
          else
          {
            // Compte pour avoir n valeurs consécutives en dessous du seuil
            if (gGeoAccuracy <= gPARAM_PrecisionDemarrage)
              gGeoCompteurPrecisionOK++;
            else
              gGeoCompteurPrecisionOK = 0;
          }

          // Quand seuil atteint, on affiche le bouton Démarrer
          if (gGeoCompteurPrecisionOK >= gPARAM_NprecisionOK)
          {
            if (window.getComputedStyle(pid('ButNouveauParcoursDemarrer')).display == 'none')
            {
              pid('ButNouveauParcoursDemarrer').style.display = 'flex';
              if (gVoixNavigation) Speech("précision atteinte, vous pouvez démarrer");
            }
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
        // Gestion nouvelle mesure
        GestionNouvelleMesure();

        // Gestion logo
        gCounterIndicateurEnregistrement++;
        if (gCounterIndicateurEnregistrement == 8)
        {
          pid('BoutonEnregistrement').innerHTML = gSymboleEnregistrement;
        }

        if (gCounterIndicateurEnregistrement == 12)
        {
          pid('BoutonEnregistrement').innerHTML = "";
          gCounterIndicateurEnregistrement = 0;
        }
        break;

      //--------------------------------------------------------------------------------------------
      // ALLUMAGE : allumage de l'écran pause suite à un appui sur l'écran
      // On ne repasse en extinction de l'écran qu'au bout d'un certain temps
      case 'ALLUMAGE':
        // Gestion nouvelle mesure
        GestionNouvelleMesure();

        gCounterPause--;
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
    if (!gRequestStopStateMachineEnregistrement)
      StateMachineEnregistrement();
  }, 250);
}

//--------------------------------------------------------------------------------------------------
// Traitement si nouvelle mesure
// Fonction appelée si écran Eteint ou Allumé
//--------------------------------------------------------------------------------------------------
function GestionNouvelleMesure()
{
  let lStatus = gGeoStatus;
  if (lStatus > gGeoStatusPrev)
  {
    gGeoStatusPrev = lStatus;
    MemorisationMesure();

    // Mise à jour des mesures sans vocalisation car l'écran peut être masqué
    AfficheReleves(false);
  }
}

//--------------------------------------------------------------------------------------------------
// Mémorisation d'une mesure
//--------------------------------------------------------------------------------------------------
function MemorisationMesure()
{
  // Mémorise le point précédent
  if (gTableauMesures.length > 0)
    gPointPrecedent = gTableauMesures[gTableauMesures.length - 1];

  // Création du nouveau point
  let lNouveauPoint =
  {
    lat: gGeoLatitude,
    lon: gGeoLongitude,
    alt: gGeoAltitude,

    // Paramètres non utilisés :
    // acc: gGeoAccuracy,
    // time: Date.now()
  };

  // Si c'est le premier point, on le mémorise simplement
  if (gPointPrecedent == null)
  {
    gTableauMesures.push(lNouveauPoint);
  }

  // Si ce n'est pas le premier point, on calcule la distance depuis le dernier point
  // Si la distance est supérieure à 3m, on mémorise le point
  else
  {
    gDistancePointPrecedent = CalculDistance(gPointPrecedent, lNouveauPoint);
    if (gDistancePointPrecedent > 0.003)
    {
      gDistanceTotale += gDistancePointPrecedent;
      gTableauMesures.push(lNouveauPoint);
    }
  }
}

//--------------------------------------------------------------------------------------------------
// Affichage des relevés pendant l'enregistrement
// Distance
//--------------------------------------------------------------------------------------------------
function AfficheReleves(pVocalise)
{
  // Distance
  const lDistance = gDistanceTotale.toFixed(2).replace('.', ',');

  // Nombre de points enregistrés
  const lNombreDePoints = gTableauMesures.length;

  // Précision mesure
  const lPrecision = gGeoAccuracy;

  // Niveau de batterie
  NiveauBatterie();
  const lBatterie = gNiveauBatterie.toString();

  // Texte pour l'affichage
  let lAffichage = "";
  lAffichage += lDistance + " kilomètres\n";
  lAffichage += lNombreDePoints + " points\n";
  lAffichage += "Précision " + lPrecision + " mètres\n";
  lAffichage += "Batterie " + lBatterie + "%\n";
  pid('TxtReleves').innerHTML = lAffichage;

  // Texte pour le Speech
  if (pVocalise)
  {
    let lSpeech = "";
    lSpeech += lDistance + " km\n";
    lSpeech += lNombreDePoints + " points\n";
    lSpeech += "précision " + lPrecision + " mètres\n";
    lSpeech += "batterie " + lBatterie + " %\n";
    if (gVoixInterface) Speech(lSpeech);
  }
}

//--------------------------------------------------------------------------------------------------
// Arrêter l'enregistrement
//--------------------------------------------------------------------------------------------------
function ButEnregistrementArreter()
{
  // Arrêt de la machine d'état
  gStateEnregistrement = 'ARRET';
  ArretGeolocalisation();
  DesactiverWakeLock();
  AfficherEcranNom();
}


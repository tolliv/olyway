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
let gGeoCompteurPrecisionOK;
const gSymboleEnregistrement = "🔴";
const gParamPrecisionDemarrage = 10; // 10m pour commencer
const gParamNprecisionOK       = 1;  // Nombre de valeurs consécutives avec la bonne précision - DEBUG:1 RELEASE:10
let gTableauMesures = null;
let gPointPrecedent = null;
let gDistanceTotale = 0;

//--------------------------------------------------------------------------------------------------
// Démarrage de l'enregistrement
//--------------------------------------------------------------------------------------------------
function EnregistrementDemarrer()
{
    if (gVoixInterface) Speech("Enregistrement démarré.");

    // Premier point
    gTableauMesures = [];
    gPointPrecedent = null;
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
  AfficherEcran('EcranPause');
  gStateEnregistrement = 'ALLUMAGE';
  gCounterPause = gParamTempsPause;
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
  FinNouveauParcours();
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
        gGeoStatusPrev = 0;
        gGeoCompteurPrecisionOK = 0;
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

        // Il y a eu au moins une nouvelle mesure
        else
        {
          if (lStatus > gGeoStatusPrev)
          {
            pid('TxtAttentePrecision').innerHTML = "Précision " + gGeoAccuracy + "m";
            gGeoStatusPrev = lStatus;

            // Compte pour avoir n valeurs en dessous du seuil avant d'afficher le bouton
            if (gGeoAccuracy <= gParamPrecisionDemarrage)
              gGeoCompteurPrecisionOK++;
            else
              gGeoCompteurPrecisionOK = 0;
          }

          // Pas de nouvelle mesure
          else
          {
            // Compte pour avoir n valeurs en dessous du seuil
            if (gGeoAccuracy <= gParamPrecisionDemarrage)
              gGeoCompteurPrecisionOK++;
            else
              gGeoCompteurPrecisionOK = 0;
          }

          // Quand seuil atteint, on affiche le bouton Démarrer
          if (gGeoCompteurPrecisionOK >= gParamNprecisionOK)
          {
            pid('ButNouveauParcoursDemarrer').style.display = 'flex';
            if (window.getComputedStyle(pid('ButNouveauParcoursDemarrer')).display != 'none')
            {
              if (gVoixInterface) Speech("vous pouvez démarrer");
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
    if (!gRequestStopStateMachine)
      StateMachineEnregistrement();
  }, 250);
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
    acc: gGeoAccuracy,
    time: Date.now()
  };

  // Ajout au tableau
  gTableauMesures.push(lNouveauPoint);

  // Calcul de distance (si on a un point précédent)
  if (gPointPrecedent != null) {
    gDistanceTotale += CalculDistance(gPointPrecedent, lNouveauPoint);
  }
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
// Calcul de la distance entre deux points (en km)
// Formule de Haversine
//--------------------------------------------------------------------------------------------------
function CalculDistance(pPoint1, pPoint2)
{
  if (!pPoint1 || !pPoint2)
    return(0);

  const R = 6371; // Rayon de la Terre en km
  const dLat = (pPoint2.lat - pPoint1.lat) * Math.PI / 180;
  const dLon = (pPoint2.lon - pPoint1.lon) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(pPoint1.lat * Math.PI / 180) * Math.cos(pPoint2.lat * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const lDistance = R * c;

  return(lDistance);
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
  lAffichage += lPrecision + "m\n";
  lAffichage += lBatterie + "%\n";
  pid('TxtReleves').innerHTML = lAffichage;

  // Texte pour le Speech
  if (pVocalise)
  {
    let lSpeech = "";
    lSpeech += lDistance + " km\n";
    lSpeech += lNombreDePoints + " points\n";
    lSpeech += lPrecision + " mètres";
    lSpeech += lBatterie + " %\n";
    if (gVoixInterface) Speech(lSpeech);
  }
}

//==================================================================================================
// Ecran ENREGISTRER
//==================================================================================================
//----- Paramètres de configuration -----
let gParamTempsPause =      4*15;   // PARAM
const gParamPrecisionDemarrage = 10; // 10m pour commencer
const gParamNprecisionOK       = 3;  // Nombre de valeurs consécutives avec la bonne précision - DEBUG:1 , RELEASE:10


gParamTempsPause      = 4*11; // DEBUG:activer , RELEASE:commenter


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
  gCounterPause = gParamTempsPause;
  gStateEnregistrement = 'ALLUMAGE';
  AfficherEcran('EcranPause');
}

//--------------------------------------------------------------------------------------------------
// Reinit timeout pause en cliquant sur l'écran des mesures
//--------------------------------------------------------------------------------------------------
function ButRelevesEnregistrementClick()
{
  gCounterPause = gParamTempsPause;
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
    acc: gGeoAccuracy,
    time: Date.now()
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
  FinNouveauParcours();
}

//--------------------------------------------------------------------------------------------------
// Transformer le tableau en GPX
//--------------------------------------------------------------------------------------------------
function SaveGPX(lTableau, pDate)
{
  if (!lTableau || lTableau.length === 0) return;

  // En-tête du fichier GPX
  var lGpx = '<?xml version="1.0" encoding="UTF-8"?>\n' +
             '<gpx version="1.1" creator="Olyway" xmlns="http://www.topografix.com/GPX/1/1">\n' +
             '<trk>\n' +
             '<name>Parcours ' + pDate + '</name>\n' +
             '<trkseg>\n';

  // Itération sur les points du tableau
  lTableau.forEach(function(p)
  {
    // Le format GPX exige des dates en ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)
    var lTimeIso = new Date(p.time).toISOString();
    var lAlt = (p.alt !== null) ? p.alt.toFixed(1) : 0;
    var lHdop = (p.acc / 5).toFixed(1);

    lGpx += '<trkpt lat="' + p.lat + '" lon="' + p.lon + '">\n' +
            '  <ele>' + lAlt + '</ele>\n' +
            '</trkpt>\n';
  });

  // Fermeture des balises
  lGpx += '</trkseg>\n' +
          '</trk>\n' +
          '</gpx>';

  // Téléchargement
  DownloadFile(lGpx, pDate + ".gpx", "application/gpx+xml");
}

//--------------------------------------------------------------------------------------------------
// Sauvegarde du fichier GPX dans le répertoire Download
//--------------------------------------------------------------------------------------------------
function DownloadFile(pContent, pFileName, pContentType)
{
  const a = document.createElement("a");
  const file = new Blob([pContent], { type: pContentType });
  a.href = URL.createObjectURL(file);
  a.download = pFileName;
  a.click();
  URL.revokeObjectURL(a.href);
}
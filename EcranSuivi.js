//==================================================================================================
// Ecran SUIVI
// Contient la machine à état pour suivre un parcours
//==================================================================================================

//----- Variables globales à cet écran -----
let gTimeoutReprendreSuivi = null;
let gRequestStopStateMachineSuivi = false;
let gStateSuivi = 'ARRET';
let gCounterPauseSuivi = 0;
let gCounterIndicateurSuivi = 0;
let gGeoStatusPrevSuivi;
let gGeoCompteurPrecisionOKSuivi;
const gSymboleSuivi = "⏩";

//--------------------------------------------------------------------------------------------------
// Démarrage du suivi avec le bouton Démarrer
//--------------------------------------------------------------------------------------------------
function DemarrerSuivi()
{
}

//--------------------------------------------------------------------------------------------------
// Appui sur l'écran pendant le suivi
// On lit les dernières mesures
//--------------------------------------------------------------------------------------------------
function EcranSuiviClick()
{
  gCounterPause = gPARAM_TempsPause;
  gStateSuivi = 'ALLUMAGE';
  AfficherEcran('EcranPauseSuivi');
}

//--------------------------------------------------------------------------------------------------
// Reinit timeout pause en cliquant sur l'écran des mesures
//--------------------------------------------------------------------------------------------------
function ButRelevesSuiviClick()
{
  gCounterPause = gPARAM_TempsPause;
}

//--------------------------------------------------------------------------------------------------
// State machine Suivi
// Réveillée toutes les 250ms
//--------------------------------------------------------------------------------------------------
function StateMachineSuivi()
{
  setTimeout(() =>
  {
    switch(gStateSuivi)
    {
      //--------------------------------------------------------------------------------------------
      // ARRET : Rien à faire
      case 'ARRET':
        break;

      //--------------------------------------------------------------------------------------------
      // DEMARRAGE : début de suivi parcours, lance la géolocalisation
      // Initialise toutes les variables
      case 'DEMARRAGE':
        gRequestStopStateMachineSuivi = false;
        gGeoStatusPrevSuivi = 0;
        gGeoCompteurPrecisionOKSuivi = 0;
        GeolocalisationWatch();
        gStateSuivi = 'DEMARRAGE_ATTENTE';
        break;

      //--------------------------------------------------------------------------------------------
      // DEMARRAGE_ATTENTE : attente de la précision
      case 'DEMARRAGE_ATTENTE':
        {
          let lStatus = gGeoStatus;

          // Précision inconnue
          if (lStatus == 0)
          {
            pid('TxtAttentePrecisionSuivi').innerHTML = "Précision inconnue";
          }

          // Il y a eu au moins une nouvelle mesure
          else
          {
            if (lStatus > gGeoStatusPrevSuivi)
            {
              pid('TxtAttentePrecisionSuivi').innerHTML = "Précision " + gGeoAccuracy + "m";
              gGeoStatusPrevSuivi = lStatus;

              // Compte pour avoir n valeurs consécutives en dessous du seuil
              if (gGeoAccuracy <= gPARAM_PrecisionDemarrage)
                gGeoCompteurPrecisionOKSuivi++;
              else
                gGeoCompteurPrecisionOKSuivi = 0;
            }

            // Pas de nouvelle mesure TODO vérifier si indispensable
            else
            {
              // Compte pour avoir n valeurs en dessous du seuil
              if (gGeoAccuracy <= gPARAM_PrecisionDemarrage)
                gGeoCompteurPrecisionOKSuivi++;
              else
                gGeoCompteurPrecisionOKSuivi = 0;
            }

            // Quand seuil atteint, on peut rallier le début du parcours
            if (gGeoCompteurPrecisionOKSuivi >= gPARAM_NprecisionOK)
            {
              gStateSuivi = 'DEMARRAGE_RALLIEMENT';
              if (gVoixNavigation) Speech("précision atteinte, vérification de votre emplacement");
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
        }
        break;

      //--------------------------------------------------------------------------------------------
      // DEMARRAGE_RALLIEMENT: ralliement vers le début du parcours ou une autre portion
      case 'DEMARRAGE_RALLIEMENT':
        {
          let lStatus = gGeoStatus;

          // Nouveau point
          if (lStatus > gGeoStatusPrevSuivi)
          {
            const lRetour = TrouverPointLePlusProche();
            let lDistance = (lRetour.distance).toFixed(0);
            let lIndex = lRetour.index;

            pid('TxtAttentePrecisionSuivi').innerHTML = "Distance " + lDistance + "m";
            gGeoStatusPrevSuivi = lStatus;
          }
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
    if (!gRequestStopStateMachineSuivi)
      StateMachineSuivi();
  }, 250);
}


//--------------------------------------------------------------------------------------------------
// Trouve le point le plus proche dans gTableauMesures par rapport à la position actuelle
// Retourne un objet {distance: m, index: i}
//--------------------------------------------------------------------------------------------------
function TrouverPointLePlusProche()
{
  // Vérifier si le tableau existe et n'est pas vide
  if (!gTableauMesures || gTableauMesures.length === 0) {
    return { distance: Infinity, index: -1 };
  }

  let lDistanceMin = Infinity;
  let lIndexProche = -1;

  // Préparation du point actuel (format attendu par CalculDistance)
  const lPointActuel = {
    lat: gGeoLatitude,
    lon: gGeoLongitude
  };

  // Parcours du tableau pour trouver le minimum
  for (let i = 0; i < gTableauMesures.length; i++)
  {
    const lPointTableau = {
      lat: gTableauMesures[i].lat,
      lon: gTableauMesures[i].lon
    };

    const lDistance = CalculDistance(lPointActuel, lPointTableau);

    if (lDistance < lDistanceMin)
    {
      lDistanceMin = lDistance;
      lIndexProche = i;
    }
  }

  return { distance: 1000*lDistanceMin, index: lIndexProche };
}
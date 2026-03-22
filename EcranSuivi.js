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
        if (gVoixNavigation) Speech("attente localisation");
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
              {
                gGeoCompteurPrecisionOKSuivi++;
              }
              else
              {
                gGeoCompteurPrecisionOKSuivi = 0;
              }
            }

            // Pas de nouvelle mesure TODO vérifier si indispensable
/*
            else
            {
              // Compte pour avoir n valeurs en dessous du seuil
              if (gGeoAccuracy <= gPARAM_PrecisionDemarrage)
                gGeoCompteurPrecisionOKSuivi++;
              else
                gGeoCompteurPrecisionOKSuivi = 0;
            }
*/
            // Quand seuil atteint, on peut rallier le début du parcours
            if (gGeoCompteurPrecisionOKSuivi >= gPARAM_NprecisionOK)
            {
              if (gSuiviParcoursChoix == 'AU_DEPART')
                if (gVoixNavigation) Speech("précision atteinte, déplacez vous vers le point de départ");

              if (gSuiviParcoursChoix == 'AU_PLUS_PRES')
                if (gVoixNavigation) Speech("précision atteinte, déplacez vous  vers le point de parcourt");

              gStateSuivi = 'DEMARRAGE_RALLIEMENT';
            }

            // Précision non atteinte
            else
            {
              if (gVoixNavigation && !SpeechSpeaking()) Speech("Précision " + gGeoAccuracy + "m");
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
      // DEMARRAGE_RALLIEMENT: ralliement vers le départ ou au plus près
      case 'DEMARRAGE_RALLIEMENT':
        {
          let lStatus = gGeoStatus;

          // Nouveau point
          if (lStatus > gGeoStatusPrevSuivi)
          {
            gGeoStatusPrevSuivi = lStatus;

            switch(gSuiviParcoursChoix)
            {
              case 'AU_DEPART':
              {
                let lDistance = TrouverPointDepart();
                lDistance = lDistance.toFixed(0);
                pid('TxtAttentePrecisionSuivi').innerHTML = "Distance " + lDistance + "m";

                // Vérifie si on est assez près du point
                if (lDistance <= gPARAM_PrecisionDemarrage)
                {
                  if (gVoixNavigation) Speech('point de départ atteint.');
                  gStateSuivi = 'EXTINCTION';
                }

                // Point non encore atteint
                else
                {
                  if (gVoixNavigation && !SpeechSpeaking()) Speech(lDistance + "m");
                }
              }
              break;

              case 'AU_PLUS_PRES':
              {
                const lRetour = TrouverPointLePlusProche();
                let lDistance = (lRetour.distance).toFixed(0);
                pid('TxtAttentePrecisionSuivi').innerHTML = "Distance " + lDistance + "m";
              }
              break;
            }
          }
        }
        break;

      //--------------------------------------------------------------------------------------------
      // EXTINCTION : mode RUN ou seul l'écran Enregistrement est affiché
      case 'EXTINCTION':
        // Gestion nouvelle mesure
        GestionNouvelleMesure();

        // Gestion logo
        gCounterIndicateurSuivi++;
        if (gCounterIndicateurSuivi == 8)
        {
          pid('BoutonSuivi').innerHTML = gSymboleSuivi;
        }

        if (gCounterIndicateurSuivi == 12)
        {
          pid('BoutonSuivi').innerHTML = "";
          gCounterIndicateurSuivi = 0;
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
  let lDistanceMin = Infinity;
  let lIndexProche = -1;

  // Préparation du point actuel
  const lPointActuel =
  {
    lat: gGeoLatitude,
    lon: gGeoLongitude
  };

  // Parcours du tableau pour trouver le minimum
  for (let i = 0; i < gTableauMesures.length; i++)
  {
    const lPointTableau =
    {
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

//--------------------------------------------------------------------------------------------------
// Trouve le point du départ
// Retourne {distance}
//--------------------------------------------------------------------------------------------------
function TrouverPointDepart()
{
  // Préparation du point actuel
  const lPointActuel =
  {
    lat: gGeoLatitude,
    lon: gGeoLongitude
  };

  // Point de Départ
  const lPointTableau =
  {
    lat: gTableauMesures[0].lat,
    lon: gTableauMesures[0].lon
  };

  const lDistance = CalculDistance(lPointActuel, lPointTableau);
  return (lDistance*1000);
}
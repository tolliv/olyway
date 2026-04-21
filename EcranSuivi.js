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
let gVoixPrev = "";

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
        gVoixPrecisionPrev = "";
        GeolocalisationWatch();
        StartCompass();
        SpeechStop();
        if (gVoixNavigation) Speech("Localisation en cours, précision de");
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
            // La position a changé
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

            // La position n'a pas changé
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
              pid('ConteneurBoussole').style.display = 'block';
              if (gSuiviParcoursChoix == 'AU_DEPART')
                if (gVoixNavigation) Speech("Précision de " + gPARAM_PrecisionDemarrage + "m atteinte. Le point de départ se situe à");

              if (gSuiviParcoursChoix == 'AU_PLUS_PRES')
                if (gVoixNavigation) Speech("Précision de " + gPARAM_PrecisionDemarrage + "m atteinte. Le point de parcours se situe à");

              gVoixPrev = "";
              gStateSuivi = 'DEMARRAGE_RALLIEMENT';
            }

            // Précision non atteinte
            // On  vocalise si la valeur est différente
            else
            {
              // Vocalise que si la phrase précédente est finie pour ne pas empiler toutes les distances
              if (!SpeechSpeaking())
              {
                const lVoixPrecision = gGeoAccuracy + "m";
                if (gVoixPrecisionPrev != lVoixPrecision)
                {
                  gVoixPrecisionPrev = lVoixPrecision;
                  if (gVoixNavigation) Speech(lVoixPrecision);
                }
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
                let lLat = gTableauMesures[0].lat;
                let lLon = gTableauMesures[0].lon;
                let lAngle = CalculDirectionVers(lLat, lLon);

                pid('TxtAttentePrecisionSuivi').innerHTML  = "Distance " + lDistance + "m\n";
                ActualiserBoussole(lAngle.relative);

                // Vérifie si on est assez près du point de départ
                if (lDistance <= gPARAM_PrecisionDemarrage)
                {
                  if (gVoixNavigation) Speech(lDistance + 'm, point de départ atteint.');
                  gStateSuivi = 'POINT_ATTEINT';
                }

                // Point non encore atteint
                else
                {
                  if (!SpeechSpeaking())
                  {
                    const lVoixDistance = lDistance + "m";
                    if (gVoixPrev != lVoixDistance)
                    {
                      if (gVoixNavigation && !SpeechSpeaking()) Speech(lDistance + "m");
                      gVoixPrev = lVoixDistance;
                    }
                  }
                }
              }
              break;

              case 'AU_PLUS_PRES':
              {
                const lRetour = TrouverPointLePlusProche();
                let lDistance = (lRetour.distance).toFixed(0);
                let lLat = gTableauMesures[lRetour.index].lat;
                let lLon = gTableauMesures[lRetour.index].lon;
                let lDirection = CalculDirectionVers(lLat, lLon);

                pid('TxtAttentePrecisionSuivi').innerHTML = "Distance " + lDistance + "m";
                ActualiserBoussole(lAngle.relative);

                // Vérifie si on est assez près du point de parcours
                if (lDistance <= gPARAM_PrecisionDemarrage)
                {
                  if (gVoixNavigation) Speech(lDistance + 'm, point de parcours atteint.');
                  gStateSuivi = 'POINT_ATTEINT';
                }

                // Point non encore atteint
                else
                {
                  if (gVoixNavigation && !SpeechSpeaking()) Speech(lDistance + "m");
                }
              }
              break;
            }
          }
        }
        break;

      //--------------------------------------------------------------------------------------------
      // POINT_ATTEINT : point atteint, il faut se tourner vers le prochain
      case 'POINT_ATTEINT':
      {
        pid('TitreSuivreParcours').innerHTML = "Aller vers point 2";
      }
      break;

      //--------------------------------------------------------------------------------------------
      // POINT_SUIVANT : point atteint, il faut se tourner vers le prochain
      case 'POINT_ATTEINT':
      {
      }
      break;

      //--------------------------------------------------------------------------------------------
      // EXTINCTION : mode RUN ou seul l'écran Enregistrement est affiché
      case 'EXTINCTION':
      {
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
      }
      break;

      //--------------------------------------------------------------------------------------------
      // ALLUMAGE : allumage de l'écran pause suite à un appui sur l'écran
      // On ne repasse en extinction de l'écran qu'au bout d'un certain temps
      case 'ALLUMAGE':
      {
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


//--------------------------------------------------------------------------------------------------
// Met à jour l'affichage de la boussole
// @param {number} pAngle - L'angle vers la destination en degrés (0-360)
//--------------------------------------------------------------------------------------------------
function ActualiserBoussole(pAngle)
{
  if (pAngle === null || pAngle === undefined) return;

  // 1. Calcul de l'angle simplifié par pas de 30°
  const lAngleSimplifie = Math.round(pAngle / 30) * 30;

  // 2. Rotation de la flèche
  const lFleche = document.getElementById('FlecheBoussole');
  if (lFleche) {
    lFleche.setAttribute('transform', `rotate(${lAngleSimplifie}, 50, 50)`);
  }

  // 3. Gestion des indicateurs horaires
  // On calcule l'heure : 0° ou 360° = 12, 30° = 1, 60° = 2, etc.
  let lHeure = Math.round(pAngle / 30);
  if (lHeure <= 0) lHeure = 12;
  if (lHeure > 12) lHeure = lHeure % 12;
  if (lHeure === 0) lHeure = 12;

  // Sélectionner tous les textes dans le groupe d'heures
  const lGroupeHeures = document.querySelectorAll('#GroupeHeures text');

  lGroupeHeures.forEach(lText =>
  {
    if (lText.id === 'h' + lHeure)
    {
      lText.textContent = lHeure;
    }
    else
    {
      lText.textContent = "";
    }
  });

  // Pour afficher le SVG après la rotation
  pid('BoussoleSVG').style.visibility = 'visible';
}
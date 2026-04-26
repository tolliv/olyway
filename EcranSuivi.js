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
let gPointToGo = { lat: 0, lon: 0, index: 0 };
let gIndexFin = 0;
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
        gIndexFin = gTableauMesures.length - 1;
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

            // ----- SEUIL ATTEINT -----

            // Quand seuil atteint, on peut rallier le point choisi
            if (gGeoCompteurPrecisionOKSuivi >= gPARAM_NprecisionOK)
            {
              if (gVoixNavigation) Speech("Précision de " + gPARAM_PrecisionDemarrage + "m atteinte. Vous pouvez vous diriger vers le point.");
              gVoixPrev = "";

              // Si on veut aller au point de départ                                                // Mémorisation du point suivant : DEPART
              if (gSuiviParcoursChoix == 'AU_DEPART')
              {
                gPointToGo.lat = gTableauMesures[0].lat;
                gPointToGo.lon = gTableauMesures[0].lon;
                gPointToGo.index = 0;
              }

              // Si on veut aller au point le plus proche                                           // Mémorisation du point suivant : PLUS_PRES
              else if (gSuiviParcoursChoix == 'AU_PLUS_PRES')
              {
                const lRetour = TrouverPointLePlusProche();
                gPointToGo.lat = gTableauMesures[lRetour.index].lat;
                gPointToGo.lon = gTableauMesures[lRetour.index].lon;
                gPointToGo.index = lRetour.index;
                pid('TitreSuivreParcours').innerHTML = "Aller au point " + gPointToGo.index;
              }

              // Effacement texte pour le prochain affichage
              pid('TxtAttentePrecisionSuivi').innerHTML  = "";

              // State suivant
              gStateSuivi = 'RALLIEMENT';
            }


            // ----- SEUIL NON ATTEINT -----

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
      // RALLIEMENT: ralliement vers gPointToGo
      case 'RALLIEMENT':
        {
          let lStatus = gGeoStatus;

          // Nouveau point
          if (lStatus > gGeoStatusPrevSuivi)
          {
            gGeoStatusPrevSuivi = lStatus;

            // Calcul de la distance entre la position actuelle et le point de passage à atteindre
            const lPositionActuelle = { lat: gGeoLatitude, lon: gGeoLongitude };
            const lProchainPoint = { lat: gPointToGo.lat, lon: gPointToGo.lon };
            const lDistance = 1000*CalculDistance(lPositionActuelle, lProchainPoint);
            const lAngle = CalculDirectionVers(gPointToGo.lat, gPointToGo.lon);

            // Affichage
            pid('TxtAttentePrecisionSuivi').innerHTML  = "Distance " + lDistance.toFixed(0) + "m\n";
            pid('ConteneurBoussole').style.display = 'block';                                       // Affichage boussole
            ActualiserBoussole(lAngle.relative);

            // Vérifie si on est assez près du point de départ
            if (lDistance <= gPARAM_PrecisionDemarrage)
            {
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
        }
        break;

      //--------------------------------------------------------------------------------------------
      // POINT_ATTEINT : point atteint, il faut se tourner vers le prochain
      case 'POINT_ATTEINT':
      {
        const lProchainIndex = gPointToGo.index + 1;

        // Si on vient de franchir l'arrivée
        if (gPointToGo.index == gIndexFin)
        {
          if (gVoixNavigation) Speech("Vous avez fini.");
          gStateSuivi = 'ARRET';
          AfficheEcranPrincipal();
        }

        // Le prochain point est l'arrivée
        else if ( lProchainIndex == gIndexFin)
        {
          pid('TitreSuivreParcours').innerHTML = "Aller vers l'arrivée";
          gPointToGo.lat = gTableauMesures[lProchainIndex].lat;
          gPointToGo.lon = gTableauMesures[lProchainIndex].lon;
          gPointToGo.index = lProchainIndex;
          gStateSuivi = 'RALLIEMENT';
        }

        // On passe au prochain point
        else
        {
          pid('TitreSuivreParcours').innerHTML = "Aller au point " + lProchainIndex;
          gPointToGo.lat = gTableauMesures[lProchainIndex].lat;
          gPointToGo.lon = gTableauMesures[lProchainIndex].lon;
          gPointToGo.index = lProchainIndex;
          gStateSuivi = 'RALLIEMENT';
        }
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
// Retourne un objet {distance, index}
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
// TODO à supprimer
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
  pid('ConteneurBoussole').style.display = 'block';                                                 // Affichage boussole
}
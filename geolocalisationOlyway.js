//=======================================================
// CODE Géolocalisation
//=======================================================

// Valeurs de gGeoStatus
// - 3 : fini, erreur non encore atteinte
// - 2 : fini, erreur permission refusée
// - 1 : fini, erreur géolocalisation non supportée
// = 0 : arrêt
// > 0 : run,  incrémenté à chaque position
let gGeoStatus = 0;
let gGeoLatitude = 0;
let gGeoLongitude = 0;
let gGeoEmplacement = "";
let gGeoAccuracy = 0;
let gGeoAltitude = 0;
let gGeoTimeout = 0;
let gGeoWatchId = 0;
let gModeSimulation = false;
let gStopSimulation = false;

//-------------------------------------------------------
// Geolocalisation avec surveillance de la position
//-------------------------------------------------------
function GeolocalisationWatch()
{
  console.log('GeolocalisationWatch start.');

  // Lancé.
  gGeoStatus = 0;

  // Options pour la demande de géolocalisation
  const lGeoOptions =
  {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  };

  // Vérifie si l'API de géolocalisation est supportée par le navigateur
  if (!navigator.geolocation)
  {
    gGeoStatus = -1;
    return;
  }

  // Mode simulation cyclique
  if (gModeSimulation)
  {
    // Définition de la fonction de répétition
    const simulationStep = () => {
      gGeoLatitude = 43.536156;
      gGeoLongitude = 1.413939 + gGeoStatus * 0.00001;
      gGeoAccuracy = 3;
      gGeoAltitude = 123;
      gGeoStatus++;
      if (!gStopSimulation)
        setTimeout(simulationStep, 1000);
    };

    // Premier lancement
    gStopSimulation = false;
    simulationStep();
  }

  // Surveillance de la position
  if (!gModeSimulation)
  {
    gGeoWatchId = navigator.geolocation.watchPosition
    (
      //----- SUCCESS Fonction est appelée chaque fois que la position change -----
      (position) =>
      {
        gGeoLatitude = position.coords.latitude;
        gGeoLongitude = position.coords.longitude;
        gGeoAccuracy = Math.round(position.coords.accuracy);
        gGeoAltitude = Math.round(position.coords.altitude);
        gGeoStatus++;
      },

      //----- ERROR Fonction appelée en cas d'erreur -----
      (error) =>
      {
        switch (error.code)
        {
          case error.PERMISSION_DENIED:
            gGeoStatus = -2; // L'utilisateur a refusé la demande de géolocalisation, on arrête
            break;

          case error.POSITION_UNAVAILABLE:
            // Les informations de localisation ne sont pas disponibles, on continue
            break;

          case error.TIMEOUT:
            // Expiration du timeout pour 1 mesure de position, on continue
            break;

          case error.UNKNOWN_ERROR:
            // Une erreur inconnue s'est produite, on continue
            break;
        }
      },
      lGeoOptions
    );
  }
}

//-------------------------------------------------------
// Arrêt géolocalisation et simulation
//-------------------------------------------------------
function ArretGeolocalisation()
{
  console.log('GeolocalisationWatch stop.');
  if (gGeoWatchId != 0)
  {
    navigator.geolocation.clearWatch(gGeoWatchId);
    gGeoWatchId = 0;
  }
  gStopSimulation = true;
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
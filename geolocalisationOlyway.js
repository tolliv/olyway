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
let gNbSimulationGeolocalisation = 0;

//-------------------------------------------------------
// Geolocalisation avec surveillance de la position
//-------------------------------------------------------
function GeolocalisationWatch()
{
  // Lancé.
  // La prochaine valeur sera 2 à la prochaine position ou 0 si précision atteinte
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

  // Surveillance de la position
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

//-------------------------------------------------------
// Arrêt géolocalisation
//-------------------------------------------------------
function ArretGeolocalisation()
{
  if (gGeoWatchId != 0)
  {
    navigator.geolocation.clearWatch(gGeoWatchId);
    gGeoWatchId = 0;
  }
}

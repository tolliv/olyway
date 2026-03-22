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
      gGeoAccuracy = 10 - gGeoStatus;
      if (gGeoAccuracy < 4)
        gGeoAccuracy = 4;
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


//--------------------------------------------------------------------------------------------------
// Activation de la boussole
//--------------------------------------------------------------------------------------------------
async function StartCompass()
{
  // Vérifier si nous sommes sur iOS et si la permission est requise
  if (typeof DeviceOrientationEvent.requestPermission === 'function')
  {
    try
    {
      const response = await DeviceOrientationEvent.requestPermission();
      if (response === 'granted')
      {
        window.addEventListener('deviceorientation', handler, true);
      }
      console.log("Boussole ON");
    }
    catch (error)
    {
      console.error("Permission refusée ou erreur :", error);
    }
  }

  // Android ou navigateurs desktop
  else
  {
    window.addEventListener('deviceorientationabsolute', handler, true);
    console.log("Boussole ON");
  }
}

//--------------------------------------------------------------------------------------------------
// Fonction appelée à chaque changement de position
//--------------------------------------------------------------------------------------------------
let gCompass = 0;
function handler(e)
{
  gCompass = e.webkitCompassHeading || e.alpha;
  gCompass = -1.0 * gCompass;                     // Inversion de l'orientation
}

//--------------------------------------------------------------------------------------------------
// Stop de la boussole
//--------------------------------------------------------------------------------------------------
function StopCompass()
{
  // On retire l'écouteur d'événement (standard et iOS)
  window.removeEventListener('deviceorientationabsolute', handler, true);
  window.removeEventListener('deviceorientation', handler, true);
  console.log("Boussole OFF");
}

//--------------------------------------------------------------------------------------------------
// Calcule l'angle vers une destination par rapport à l'orientation actuelle du téléphone
// Retourne un objet contenant :
// - compass : l'orientation actuelle du téléphone (0-360)
// - bearing : l'azimut théorique vers la destination (0-360)
// - relative : l'angle relatif (0 ou 360 = devant, 90 = droite, etc.)
//--------------------------------------------------------------------------------------------------
function CalculDirectionVers(pDestLat, pDestLon)
{
  // Calcul de l'azimut (Bearing) entre ma position et la destination
  // Formule : θ = atan2( sin Δλ ⋅ cos φ2 , cos φ1 ⋅ sin φ2 − sin φ1 ⋅ cos φ2 ⋅ cos Δλ )
  const lat1 = gGeoLatitude * Math.PI / 180;
  const lon1 = gGeoLongitude * Math.PI / 180;
  const lat2 = pDestLat * Math.PI / 180;
  const lon2 = pDestLon * Math.PI / 180;

  const dLon = lon2 - lon1;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  let lBearing = Math.atan2(y, x);
  lBearing = (lBearing * 180 / Math.PI + 360) % 360; // Conversion en degrés 0-360

  // Calcul de l'angle relatif par rapport à la boussole
  let lDirectionRelative = (lBearing - gCompass + 360) % 360;

  return {
    compass: Math.round(gCompass),
    bearing: Math.round(lBearing),
    relative: Math.round(lDirectionRelative)
  };
}
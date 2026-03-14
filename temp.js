  //----- Localisation -----
  const lPrecision = pid('TxtPrecision').value;
  GeolocalisationWatch(lPrecision);

  // Boucle d'attente de la fin
  let lTimeout = pid('TxtTempsMaxLocalisation').value * 10; // Car tempo de 100ms

  do
  {
    // Période vérification de l'état
    await sleep(100);
    const lStatus = gGeoStatus;

    // Si nouvelle position valide, on l'affiche
    if (lStatus > 1)
    {
      const lRestant = Math.round(lTimeout/10);
      pid('TxtStep1').innerHTML = "<b>Localisation</b> (" + lRestant + "s restante" + S(lRestant) + ")<br>";
      pid('TxtStep1').innerHTML+= "précision = <b>" + gGeoAccuracy + "m</b> (seuil = " + iSeuilPrecision + "m)<br>";
      pid("Step1").style.backgroundColor = ColEnCours;
    }

    // Limitation temps
    lTimeout--;
    if (lTimeout <= 0)
    {
      gGeoStatus = -3;
      break;
    }

    // Demande d'annulation pendant la géolocalisation
    if (gDemandeAnnulation == true)
    {
      gGeoStatus = -3;
      break;
    }
  } while (gGeoStatus > 0); // Sortie si précision atteinte ou Erreur
  ArretGeolocalisation();

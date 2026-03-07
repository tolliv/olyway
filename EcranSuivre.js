//==================================================================================================
// Ecran SUIVRE
//==================================================================================================

//--------------------------------------------------------------------------------------------------
// Afficher l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranSuivre()
{
  AfficherEcran("EcranSuivre");

  // Afficher les informations de l'itinéraire
  pid('TxtSuivreParam').innerHTML  = gItinerairesListe[gItineraireIndex].nom + "\n";
  pid('TxtSuivreParam').innerHTML += gItinerairesListe[gItineraireIndex].distance + " km , D+";
  pid('TxtSuivreParam').innerHTML += gItinerairesListe[gItineraireIndex].DPlus + " m\n";
  pid('TxtSuivreParam').innerHTML += gItinerairesListe[gItineraireIndex].date;
}

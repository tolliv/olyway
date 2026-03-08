//==================================================================================================
// Ecran SUIVRE
//==================================================================================================

//--------------------------------------------------------------------------------------------------
// Afficher l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranSuivre()
{
  AfficherEcran("EcranSuivre");

  // Afficher les informations de l'parcours
  pid('TxtSuivreParam').innerHTML  = gParcoursListe[gParcoursIndex].nom + "\n";
  pid('TxtSuivreParam').innerHTML += gParcoursListe[gParcoursIndex].distance + "km ";
  pid('TxtSuivreParam').innerHTML += "D+" + gParcoursListe[gParcoursIndex].DPlus + "m\n";
  pid('TxtSuivreParam').innerHTML += "du " + gParcoursListe[gParcoursIndex].date;
}

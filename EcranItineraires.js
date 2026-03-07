//==================================================================================================
// Ecran ITINERAIRES
//==================================================================================================
const gItinerairesListe = [
{nom: "TOUR QUARTIER", distance: 4.2, date: "07.03.2026", DPlus: 123},
{nom: "LÉGENDES", distance: 8.2, date: "13.06.2025", DPlus: 823},
];

let gItineraireIndex = 0;

//--------------------------------------------------------------------------------------------------
// Afficher l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranItineraires()
{
  if (gInterfaceSon) Speech("écran itinéraires");
  AfficherEcran("EcranItineraires");
  pid('ButItinerairesNom').innerHTML = gItinerairesListe[gItineraireIndex].nom + " >";
}

//--------------------------------------------------------------------------------------------------
// Choix itinéaire suivant
//--------------------------------------------------------------------------------------------------
function ButItinerairesNomClick()
{
  gItineraireIndex = (gItineraireIndex + 1) % gItinerairesListe.length;
  pid('ButItinerairesNom').innerHTML = gItinerairesListe[gItineraireIndex].nom + " >";
}
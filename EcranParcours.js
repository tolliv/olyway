//==================================================================================================
// Ecran NOM PARCOURS
//==================================================================================================
//--------------------------------------------------------------------------------------------------
// Afficher l'écran
//--------------------------------------------------------------------------------------------------
function AfficherNomParcours()
{
  if (gInterfaceSon) Speech("valider le parcours");
  let lNomParcours = "2026 03 08";
  AfficherEcran("EcranNomParcours");
  pid('ButParcoursNom').innerHTML = "Parcours \n" + lNomParcours;
}




//==================================================================================================
// Ecran PARCOURS
//==================================================================================================
const gParcoursListe = [
{nom: "Tour quartier", distance: 4.2, date: "07.03.2026", DPlus: 123},
{nom: "Légendes", distance: 8.2, date: "13.06.2025", DPlus: 823},
];

let gParcoursIndex = 0;

//--------------------------------------------------------------------------------------------------
// Afficher l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranParcours()
{
  if (gInterfaceSon) Speech("écran parcours");
  AfficherEcran("EcranParcours");
  pid('ButParcoursNom').innerHTML = gParcoursListe[gParcoursIndex].nom + " (+)";
}

//--------------------------------------------------------------------------------------------------
// Choix parcours suivant
//--------------------------------------------------------------------------------------------------
function ButParcoursNomClick()
{
  gParcoursIndex = (gParcoursIndex + 1) % gParcoursListe.length;
  pid('ButParcoursNom').innerHTML = gParcoursListe[gParcoursIndex].nom + " (+)";
}
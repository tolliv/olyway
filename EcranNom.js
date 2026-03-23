//==================================================================================================
// Ecran Nom
//==================================================================================================
let gDateNomFichier = "";

//--------------------------------------------------------------------------------------------------
// Afficher l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranNom()
{
  // Nom unique
  gDateNomFichier = FormaterDateHeure();
  pid('TxtNomParcours').value = gDateNomFichier;

  // Conversion du tableau d'objets en chaîne JSON avec nom et distance
  const lParcours =
  {
    nom: gDateNomFichier,
    distance: gDistanceTotale,
    points: gTableauMesures
  };

  // Sauvegarde de secours
  const lParcoursJson = JSON.stringify(lParcours);
  localStorage.setItem('DernierParcours', lParcoursJson);

  if (gVoixInterface) Speech("écran nom");
  AfficherEcran("EcranNom");
}

//--------------------------------------------------------------------------------------------------
// Validation du nom
// lNom contient le nom choisi par l'utilisateur
// gDateNomFichier est l'identificateur pour :
// - le nom dans le LocalStorage
// - le nom du fichier GPX
//--------------------------------------------------------------------------------------------------
function ButNomValiderClick()
{
  lNom = pid('TxtNomParcours').value;
  if (lNom == null || lNom == "")       // Protection
    lNom = gDateNomFichier;             // Récupération du nom si vide

  // Archivage LocalStorage
  const lParcours =
  {
    nom: lNom,
    distance: gDistanceTotale,
    points: gTableauMesures
  };

  // LocalStorage avec gDateNomFichier comme clé
  const lParcoursJson = JSON.stringify(lParcours);
  localStorage.setItem(gDateNomFichier, lParcoursJson);

  AfficherEcranPrincipal();
}

//--------------------------------------------------------------------------------------------------
// Annulation, il n'y a pas de sauvegarde
//--------------------------------------------------------------------------------------------------
function ButNomAnnulerClick()
{
  AfficherEcranPrincipal();
}

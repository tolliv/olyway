//==================================================================================================
// Ecran GESTION
//==================================================================================================

//--------------------------------------------------------------------------------------------------
// Affichage de l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranGestion()
{
  if (gVoixInterface) Speech("gestion des parcours");
  AfficherEcran('EcranGestion');
}


//--------------------------------------------------------------------------------------------------
// Exportation d'un GPX
//--------------------------------------------------------------------------------------------------
//----- Fonction principale -----
function ButGestionExporterClick()
{
  CallSelectionOK = GestionParcoursSelectionne;
  CallSelectionAnnuler = AfficherEcranGestion;
  AfficherEcranSelection();
}

//----- Parcours sélectionné -----
function GestionParcoursSelectionne(pCle)
{
  // Récupération parcours et sauvegarde en GPX
  let donneesJSON = localStorage.getItem(pCle);
  if (donneesJSON != null)
  {
    let objetParcours = JSON.parse(donneesJSON);
    SaveGPX(objetParcours.points, objetParcours.nom);
  }

  // Erreur
  else
  {
    console.log("Erreur : parcours introuvable");
  }

  // Affichage
  AfficherEcranGestion();
}

//--------------------------------------------------------------------------------------------------
// Importation d'un GPX
//--------------------------------------------------------------------------------------------------
function ButGestionImporterClick()
{
}



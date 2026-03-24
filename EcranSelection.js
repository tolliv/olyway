//==================================================================================================
// Ecran SELECTION d'un parcours
//==================================================================================================
let gIndexTopListe = 0;
let gListeParcours = null;
let CallSelectionOK = null;
let CallSelectionAnnuler = null;

//--------------------------------------------------------------------------------------------------
// Affichage de l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranSelection()
{
  if (gVoixInterface) Speech("écran sélection");

  // Efface l'interface de l'écran sélection
  for (let j = 0; j <= 5; j++)
    pid('ListeElement' + j).innerHTML = "";

  // Création de la liste des clés
  gListeParcours = CreeListeParcours();

  for (let i = 0; i < 6; i++)
  {
    let lIndex = i + gIndexTopListe;
    if (gListeParcours[lIndex] != null)
    {
      let cle = gListeParcours[lIndex];

      // --- Extraction du nom depuis le localStorage ---
      let donneesJSON = localStorage.getItem(cle);
      let objetParcours = JSON.parse(donneesJSON);
      let nomAAfficher = objetParcours.nom;
      pid('ListeElement' + i).innerHTML = nomAAfficher;
    }
  }
  AfficherEcran("EcranSelection");
}

//--------------------------------------------------------------------------------------------------
// Crée la liste des parcours
//--------------------------------------------------------------------------------------------------
function CreeListeParcours()
{
  let lListeParcours = [];

  // Parcourir toutes les clés du localStorage
  for (let i = 0; i < localStorage.length; i++)
  {
    let cle = localStorage.key(i);

    // Vérifier si la clé commence par un chiffre (0-9)
    if (cle && /^\d/.test(cle)) {
      lListeParcours.push(cle);
    }
  }

  // Trier la liste, la plus récente en premier
  lListeParcours.sort().reverse();

  return(lListeParcours);
}


//--------------------------------------------------------------------------------------------------
// Un parcours a été sélectionné
//--------------------------------------------------------------------------------------------------
function Selection(pValeur)
{
  const lIndex = gIndexTopListe + pValeur;
  const lCle = gListeParcours[lIndex];
  CallSelectionOK(lCle);
}
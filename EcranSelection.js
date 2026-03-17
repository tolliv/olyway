//==================================================================================================
// Ecran SELECTION d'un parcours
//==================================================================================================
let gIndexTopListe = 0;

//--------------------------------------------------------------------------------------------------
// Affichage de l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranSelection()
{
  if (gVoixInterface) Speech("gestion des parcours");

  // Efface l'interface de l'écran sélection
  for (let j = 1; j <= 6; j++)
    pid('ListeElement' + j).innerHTML = "";

  // Création de la liste des clés
  let lListeParcours = CreeListeParcours();

  for (let i = 0; i < 6; i++)
  {
    let lIndex = i + gIndexTopListe;
    if (lListeParcours[lIndex] != null)
    {
      let cle = lListeParcours[lIndex];

      // --- Extraction du nom depuis le localStorage ---
      let donneesJSON = localStorage.getItem(cle);
      let objetParcours = JSON.parse(donneesJSON);
      let nomAAfficher = objetParcours.nom;
      pid('ListeElement' + (i + 1)).innerHTML = nomAAfficher;
    }
  }
  AfficherEcran("EcranSelection");
}

//--------------------------------------------------------------------------------------------------
// Crée la liste des parcours
//--------------------------------------------------------------------------------------------------
function CreeListeParcours()
{
  let listeParcours = [];

  // Parcourir toutes les clés du localStorage
  for (let i = 0; i < localStorage.length; i++) {
    let cle = localStorage.key(i);

    // Vérifier si la clé commence par un chiffre (0-9)
    if (cle && /^\d/.test(cle)) {
      listeParcours.push(cle);
    }
  }

  // Optionnel : Trier la liste (souvent utile pour les dates/timestamps)
  listeParcours.sort().reverse();

  return(listeParcours);
}
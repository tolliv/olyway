//==================================================================================================
// Ecran GESTION
//==================================================================================================

//--------------------------------------------------------------------------------------------------
// Affichage de l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranGestion()
{
  if (gVoixInterface) Speech("écran gestion");
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
    console.log("Exportation ERREUR");
  }

  // Affichage
  AfficherEcranGestion();
}


//--------------------------------------------------------------------------------------------------
// Transformer le tableau en GPX
//--------------------------------------------------------------------------------------------------
function SaveGPX(lTableau, pDate)
{
  if (!lTableau || lTableau.length === 0) return;

  // En-tête du fichier GPX
  var lGpx = '<?xml version="1.0" encoding="UTF-8"?>\n' +
             '<gpx version="1.1" creator="Olyway" xmlns="http://www.topografix.com/GPX/1/1">\n' +
             '<trk>\n' +
             '<name>Parcours ' + pDate + '</name>\n' +
             '<trkseg>\n';

  // Itération sur les points du tableau
  lTableau.forEach(function(p)
  {
    let lAlt = p.ele ?? 0;
    lAlt = Number(lAlt).toFixed(1);

    lGpx += '<trkpt lat="' + p.lat + '" lon="' + p.lon + '">\n' +
            '  <ele>' + lAlt + '</ele>\n' +
            '</trkpt>\n';
  });

  // Fermeture des balises
  lGpx += '</trkseg>\n' +
          '</trk>\n' +
          '</gpx>';

  // Téléchargement
  DownloadFile(lGpx, pDate + ".gpx", "application/gpx+xml");
}


//--------------------------------------------------------------------------------------------------
// Sauvegarde du fichier GPX dans le répertoire Download
//--------------------------------------------------------------------------------------------------
function DownloadFile(pContent, pFileName, pContentType)
{
  const a = document.createElement("a");
  const file = new Blob([pContent], { type: pContentType });
  a.href = URL.createObjectURL(file);
  a.download = pFileName;
  a.click();
  URL.revokeObjectURL(a.href);
}


//--------------------------------------------------------------------------------------------------
// Importation d'un GPX
//--------------------------------------------------------------------------------------------------
function ButGestionImporterClick()
{
  // Création d'un input invisible pour choisir le fichier
  let input = document.createElement('input');
  input.type = 'file';
  input.accept = '.gpx';

  input.onchange = function(event) {
    let fichier = event.target.files[0];
    if (!fichier) return;

    let reader = new FileReader();
    reader.onload = function(e) {
      let contenu = e.target.result;
      ImporterContenuGPX(contenu, fichier.name);
    };
    reader.readAsText(fichier);
  };

  input.click();
}

// Fonction de traitement du texte GPX
function ImporterContenuGPX(xmlString, nomFichier)
{
  let lDistanceTotale = 0;
  try
  {
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(xmlString, "text/xml");
    let points = [];

    // Extraction des points de trace (trkpt)
    let trackPoints = xmlDoc.getElementsByTagName("trkpt");

    for (let i = 0; i < trackPoints.length; i++)
    {
      let pt = trackPoints[i];
      let lat = parseFloat(pt.getAttribute("lat"));
      let lon = parseFloat(pt.getAttribute("lon"));

      // Extraction de l'altitude
      let ele = 0;
      let eleTag = pt.getElementsByTagName("ele")[0];
      if (eleTag) ele = parseFloat(eleTag.textContent);

      let nouveauPoint =
      {
        lat: lat,
        lon: lon,
        ele: ele
      };
      points.push(nouveauPoint);

      // Calcul de la distance cumulée
      if (i > 0)
      {
        let pointPrecedent = points[i - 1];
        lDistanceTotale += CalculDistance(pointPrecedent, nouveauPoint);
      }
    }

    if (points.length === 0)
    {
      alert("Le fichier GPX ne contient aucun point de trace valide.");
      return;
    }

    // Préparation de l'objet JSON
    let lNomParcours = nomFichier.replace(/\.[^/.]+$/, "");
    let cle = FormaterDateHeure();
    let objetParcours =
    {
      nom: lNomParcours,
      distance: lDistanceTotale,
      points: points,
    };

    // Sauvegarde dans le localStorage
    localStorage.setItem(cle, JSON.stringify(objetParcours));
    AfficherEcranGestion();
    console.error("Importation OK");
  }
  catch (erreur)
  {
    console.error("Importation ERREUR");
  }
}


//--------------------------------------------------------------------------------------------------
// Affiche les informations d'un parcours
//--------------------------------------------------------------------------------------------------
function ButGestionInfosClick()
//----- Fonction principale -----
{
  CallSelectionOK = GestionParcoursInfosSelectionne;
  CallSelectionAnnuler = AfficherEcranGestion;
  AfficherEcranSelection();
}

//----- Parcours sélectionné -----
function GestionParcoursInfosSelectionne(pCle)
{
  AfficherEcranParcoursInfos(pCle);
}
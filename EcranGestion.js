//==================================================================================================
// Ecran GESTION
//==================================================================================================

//--------------------------------------------------------------------------------------------------
// Affichage de l'écran
//--------------------------------------------------------------------------------------------------
function AfficherEcranGestion()
{
  SpeechStop();
  if (IsNotInstalled())
  {
    if (gVoixInterface) Speech("écran gestion");
    AfficherEcran('EcranGestion');
  }
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

    // Nettoyage de la trace
    NettoyageParcours(cle);

    AfficherEcranGestion();
    console.log("Importation OK");
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


//--------------------------------------------------------------------------------------------------
// Nettoyage du parcours pour supprimer les mauvais points et faire des segments plus longs
// [IN] lParcours = nom du parcours (date) en local storage
//--------------------------------------------------------------------------------------------------
function NettoyageParcours(lParcours)
{
  let lDonneesJSON = localStorage.getItem(lParcours);
  let lObjetParcours = JSON.parse(lDonneesJSON);
  const lNomParcours = lObjetParcours.nom;
  const lDistanceTotale = lObjetParcours.distance;
  const lBrutPoints = lObjetParcours.points;  // Tableau avec les positions brutes
  let lAvgPoints    = lBrutPoints;            // Tableau avec les positions moyennées
  let lNewPoints    = [];                     // Tableau avec les positions filtrées

  const lCONFIGFiltrage = 5;

  //----- Lissage par moyenne glissante sur 3 points ----------------------------------------------
  if (lCONFIGFiltrage == 3)
  {
    for (let i = 1; i < lAvgPoints.length - 1; i++)
    {
      let pPrec1 = lAvgPoints[i - 1];
      let pCurr  = lAvgPoints[i];
      let pSuiv1 = lAvgPoints[i + 1];

      // Calcul de la moyenne pour Lat et Lon (Altitude non modifiée)
      pCurr.lat = (pPrec1.lat + pCurr.lat + pSuiv1.lat) / 3;
      pCurr.lon = (pPrec1.lon + pCurr.lon + pSuiv1.lon) / 3;

      // Re-écriture du point
      lAvgPoints[i] = pCurr;
    }
  }

  //----- Lissage par moyenne glissante sur 5 points ----------------------------------------------
  if (lCONFIGFiltrage == 5)
  {
    for (let i = 2; i < lAvgPoints.length - 2; i++)
    {
      let pPrec2 = lAvgPoints[i - 2];
      let pPrec1 = lAvgPoints[i - 1];
      let pCurr  = lAvgPoints[i];
      let pSuiv1 = lAvgPoints[i + 1];
      let pSuiv2 = lAvgPoints[i + 2];

      // Calcul de la moyenne pour Lat et Lon (Altitude non modifiée)
      pCurr.lat = (pPrec2.lat + pPrec1.lat + pCurr.lat + pSuiv1.lat + pSuiv2.lat) / 5;
      pCurr.lon = (pPrec2.lon + pPrec1.lon + pCurr.lon + pSuiv1.lon + pSuiv2.lon) / 5;

      // Re-écriture du point
      lAvgPoints[i] = pCurr;
    }
  }

  // Création du GPX MOYENNE
  const lNomMoyenne = lNomParcours + "_moyenne";
  SaveGPX(lAvgPoints, lNomMoyenne);


  //----- Création du nouveau tableau filtré -------------------------------------------------------
  // Ajout systématique du premier point
  lNewPoints.push(
  {
    lat: lAvgPoints[0].lat,
    lon: lAvgPoints[0].lon,
    ele: lAvgPoints[0].ele
  });

  // Index du  point de référence qui est le premier point pour commencer
  let lPointReference = lAvgPoints[0];

  //-- Parcourt tous les points filtrés --
  let lCompteurPoint = 0;
  const lLimite = lAvgPoints.length;
  for (let i = 1; i < lLimite - 1; i++)
  {
    // Calcul de la distance approximative avec le point de référence
    let lDistLat = (lAvgPoints[i].lat - lPointReference.lat) * 111111;
    let lDistLon = (lAvgPoints[i].lon - lPointReference.lon) * 111111 * Math.cos(lAvgPoints[i].lat * Math.PI / 180);
    let lDistanceReference = Math.sqrt(lDistLat * lDistLat + lDistLon * lDistLon);

    // Direction par rapport au point de référence
    let dy0 = lAvgPoints[i].lat - lPointReference.lat;
    let dx0 = lAvgPoints[i].lon - lPointReference.lon;
    let angleDeg0 = Math.atan2(dx0, dy0) * (180 / Math.PI);
    if (angleDeg0 < 0)
      angleDeg0 += 360;

    // Direction du point suivant (i -> i+1)
    let dyS = lAvgPoints[i + 1].lat - lAvgPoints[i].lat;
    let dxS = lAvgPoints[i + 1].lon - lAvgPoints[i].lon;
    let angleDegS = Math.atan2(dxS, dyS) * (180 / Math.PI);
    if (angleDegS < 0)
      angleDegS += 360;

    // Vérifie si changement de direction >= 30°
    let lDifference = Math.abs(angleDegS - angleDeg0);
    if (lDifference > 180)
      lDifference = 360 - lDifference;

    // Détection du changement de direction
    // Il faut au moins 1 point d'écart pour se rapprocher d'une vraie trace qui tourne à 90°
    if ( (lDifference >= 20) && (lCompteurPoint > 1) )
    {
      lNewPoints.push(
      {
        lat: lAvgPoints[i].lat,
        lon: lAvgPoints[i].lon,
        ele: lAvgPoints[i].ele
      });
      lPointReference = lAvgPoints[i];
      lCompteurPoint = 0;
    }

    // Point intermédiaire, même si c'est une ligne droite (~30m maximum entre 2 points)
    else if (lDistanceReference >= 30)
    {
      lNewPoints.push(
      {
        lat: lAvgPoints[i].lat,
        lon: lAvgPoints[i].lon,
        ele: lAvgPoints[i].ele
      });
      lPointReference = lAvgPoints[i];
      lCompteurPoint = 0;
    }

    // Incrémentation du compteur de points qui sert à ne pas avoir de points trop rapprochés
    lCompteurPoint++;
  }

  // Sortie de la boucle, on ajoute le dernier point systématiquement
  lNewPoints.push(
  {
    lat: lAvgPoints[lLimite - 1].lat,
    lon: lAvgPoints[lLimite - 1].lon,
    ele: lAvgPoints[lLimite - 1].ele
  });


  // Remplacement du tableau brut par le nouveau tableau filtré
  objetParcours =
  {
   nom: lNomParcours,
   distance: lDistanceTotale,
   points: lNewPoints
  };

  // Sauvegarde dans le localStorage avec la clé (lParcours)
  localStorage.setItem(lParcours, JSON.stringify(objetParcours));

  // Création du GPX CLEAN
  const lNomNClean = lNomParcours + "_clean";
  SaveGPX(lNewPoints, lNomNClean);
  console.log("Nettoyage terminé : " + lBrutPoints.length + " points réduits à " + lNewPoints.length);
}
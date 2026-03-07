//--------------------------------------------------------------------------------------------------
// Fetch en mode CORS pour récuperer le contenu d'une URL
// Si < 50, alors erreur et on arrête
//--------------------------------------------------------------------------------------------------
async function FetchCors(url)
{
  gStatusRequete = 99;
  try {
    const response = await fetch(url, { method: 'GET', mode: 'cors' });

    if (!response.ok)
    {
      gStatusRequete = 1;
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    gStatusRequete = 98;
    gHtmlText = await response.text(); // Attend que le texte soit lu
    gStatusRequete = 0;
  }
  catch (error)
  {
    gStatusRequete = 2;
  }
}


//--------------------------------------------------------------------------------------------------
// DownloadFetch
// ex: pAdresse = https://www.visugpx.com/download.php?id=8swWJhz0Hs
//--------------------------------------------------------------------------------------------------
let gStatusRequete=100;
async function DownloadFetch(pAdresse)
{
  console.log("Start");
  FetchCors(pAdresse);

  // Boucle d'attente
  for (let lCount = 0; lCount < 50; lCount++)
  {
    await sleep(200);
    if (gStatusRequete < 50)
      break;
  }

  console.log("gStatusRequete = ", gStatusRequete);
  console.log(gHtmlText);

  // Si OK
  if (gStatusRequete == 0)
  {
    // TODO
  }
}
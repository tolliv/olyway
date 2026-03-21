//==================================================================================================
// Ecran NOUVEAU PARCOURS
//==================================================================================================

//--------------------------------------------------------------------------------------------------
// Afficher écran de démarrage pour demander confirmation ou non
//--------------------------------------------------------------------------------------------------
function AfficherEcranNouveauParcours()
{
  if (gVoixInterface) Speech("nouveau parcours", false);

  // Reinit l'affichage avant d'afficher la fenêtre
  pid('ButNouveauParcoursDemarrer').style.display = 'none';
  pid('TxtAttentePrecision').innerHTML = "";
  AfficherEcran('EcranNouveauParcours');

  // La machine d'état est démarrée et le restera jusqu'à la fermeture de l'application
  ActiverWakeLock();
  gStateEnregistrement = 'DEMARRAGE';
  StateMachineEnregistrement();
}

//--------------------------------------------------------------------------------------------------
// Démarrer un nouveau parcours
//--------------------------------------------------------------------------------------------------
function ButNouveauParcoursDemarrerClick()
{
  EnregistrementDemarrer();
}

//--------------------------------------------------------------------------------------------------
// Finalement on ne veut pas créer un nouveau parcours
//--------------------------------------------------------------------------------------------------
function ButNouveauParcoursAnnulerClick()
{
  // Arrêt de la machine d'état
  gStateEnregistrement = 'ARRET';
  ArretGeolocalisation();
  DesactiverWakeLock();
  AfficherEcranPrincipal();
}

//--------------------------------------------------------------------------------------------------
// Crée une chaine : YYMM.DD-HHMMSS (ex: 2403.14-203407)
//--------------------------------------------------------------------------------------------------
function FormaterDateHeure()
{
  const maintenent = new Date();
  const annee   = maintenent.getFullYear().toString().slice(-2);
  const mois    = (maintenent.getMonth() + 1).toString().padStart(2, '0');
  const jour    = maintenent.getDate().toString().padStart(2, '0');
  const heures  = maintenent.getHours().toString().padStart(2, '0');
  const minutes = maintenent.getMinutes().toString().padStart(2, '0');
  const secondes = maintenent.getSeconds().toString().padStart(2, '0');
  return(annee + mois + "." + jour + "-" + heures + minutes + secondes);
}
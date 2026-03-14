//==================================================================================================
// Ecran NOUVEAU PARCOURS
//==================================================================================================

//--------------------------------------------------------------------------------------------------
// Afficher écran de démarrage pour demander confirmation ou non
//--------------------------------------------------------------------------------------------------
function AfficherEcranEnregistrement()
{
  if (gVoixInterface) Speech("nouveau parcours");
  AfficherEcran('EcranNouveauParcours');

  // La machine d'état est démarrée et le restera jusqu'à la fermeture de l'application
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
  // Arrêt de la machine d'état et retour au menu principal
  gStateEnregistrement = 'ARRET';
  AfficherEcranPrincipal();
}
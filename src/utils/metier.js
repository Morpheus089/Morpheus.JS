const Metier = require('../database/models/metierModel');
const MetierUtilisateur = require('../database/models/metierUtilisateurModel');

async function checkMetierAccess(userId, recette) {
  const metierAssocie = await Metier.findOne({ "recettes.recetteId": recette._id });
  if (!metierAssocie) {
    return { ok: false, message: "Aucun métier n'est associé à cette recette." };
  }

  const metierUtilisateurData = await MetierUtilisateur.findOne({ userId });
  if (!metierUtilisateurData) {
    return { ok: false, message: "Vous n'avez aucun métier enregistré." };
  }

  const metierUtilisateurInfo = metierUtilisateurData.metiers.find(m => m.metierId.toString() === metierAssocie._id.toString());
  const niveauRequis = metierAssocie.recettes.find(r => r.recetteId.toString() === recette._id.toString()).niveauRequis;

  if (!metierUtilisateurInfo || metierUtilisateurInfo.niveau < niveauRequis) {
    return { ok: false, message: "Niveau insuffisant pour crafter cet objet." };
  }

  return { ok: true };
}

module.exports = {
  checkMetierAccess
};
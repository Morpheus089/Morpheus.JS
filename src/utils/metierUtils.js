const Recette = require('../database/models/recetteModel');
const MetierUtilisateur = require('../database/models/metierUtilisateurModel');

async function parseRecettesString(recettesStr) {
  return recettesStr.split(',').map(entry => {
    const [id, niveau] = entry.split(':');
    return { recetteId: id.trim(), niveauRequis: parseInt(niveau.trim(), 10) };
  });
}

async function validateRecettesExist(ids) {
  const recettes = await Recette.find({ _id: { $in: ids } });
  return recettes;
}

async function getUserMetierData(userId, metierId) {
  const userDoc = await MetierUtilisateur.findOne({ userId });
  if (!userDoc) return null;
  const metier = userDoc.metiers.find(m => m.metierId.equals(metierId));
  return metier || null;
}

module.exports = {
  parseRecettesString,
  validateRecettesExist,
  getUserMetierData
};
const Niveau = require('../database/models/niveauModel');
const Stats = require('../database/models/statsModel');
const calculerXpPourNiveau = require('./xpCalcul');

async function ajouterNiveau(userId, niveauCible) {
  let niveau = await Niveau.findOne({ userId });
  if (!niveau) {
    niveau = new Niveau({ userId, niveau: 0, experience: 0, experienceRequise: calculerXpPourNiveau(1) });
    await niveau.save();
  }

  if (niveauCible <= niveau.niveau) {
    throw new Error('Le niveau cible doit être supérieur au niveau actuel.');
  }

  const xpNecessaire = calculerXpPourNiveau(niveauCible);
  const xpActuel = calculerXpPourNiveau(niveau.niveau);
  
  niveau.experience += xpNecessaire - xpActuel;
  niveau.niveau = niveauCible;
  niveau.updatedAt = Date.now();
  niveau.experienceRequise = calculerXpPourNiveau(niveauCible + 1);

  await niveau.save();
  return niveau;
}

async function retirerNiveaux(userId, niveauxARetirer) {
  let niveau = await Niveau.findOne({ userId });
  if (!niveau) {
    throw new Error('Utilisateur introuvable.');
  }

  if (niveauxARetirer >= niveau.niveau) {
    throw new Error('Le nombre de niveaux à retirer doit être inférieur au niveau actuel.');
  }

  const nouveauNiveau = niveau.niveau - niveauxARetirer;
  const xpNouveauNiveau = calculerXpPourNiveau(nouveauNiveau);

  niveau.niveau = nouveauNiveau;
  niveau.experience = xpNouveauNiveau;
  niveau.experienceRequise = calculerXpPourNiveau(nouveauNiveau + 1);

  await niveau.save();
  return niveau;
}

module.exports = { ajouterNiveau, retirerNiveaux };
const mongoose = require('mongoose');

const metierUtilisateurSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // ID Discord de l'utilisateur
  metiers: [{
    metierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Metier' }, // Métier possédé
    niveau: { type: Number, default: 1 }, // Niveau du métier
    xp: { type: Number, default: 0 } // XP actuel du métier
  }]
});

const MetierUtilisateur = mongoose.model('MetierUtilisateur', metierUtilisateurSchema);
module.exports = MetierUtilisateur;
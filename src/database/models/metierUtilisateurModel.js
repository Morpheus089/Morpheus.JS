const mongoose = require('mongoose');

const metierUtilisateurSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  metiers: [{
    metierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Metier' },
    niveau: { type: Number, default: 1 }, 
    xp: { type: Number, default: 0 }
  }]
});

const MetierUtilisateur = mongoose.model('MetierUtilisateur', metierUtilisateurSchema);
module.exports = MetierUtilisateur;
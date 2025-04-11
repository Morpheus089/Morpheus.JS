const mongoose = require('mongoose');

const ressourceSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, default: 'Aucune description fournie' },
  valeurMarchande: { type: Number, required: true },
  rarete: { type: String, required: true, enum: ['Commun', 'Rare', 'Épique', 'Légendaire'] },
});

module.exports = mongoose.model('Ressource', ressourceSchema);
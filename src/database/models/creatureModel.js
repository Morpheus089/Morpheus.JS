const mongoose = require('mongoose');

const CreatureSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  rarete: {
    type: String,
    enum: ['Commun', 'Rare', 'Épique', 'Légendaire'],
    required: true
  },
  niveau: {
    type: Number,
    required: true,
    min: 1
  },
  stats: {
    force: { type: Number, required: true, min: 0 },
    vitalite: { type: Number, required: true, min: 0 },
    vitesse: { type: Number, required: true, min: 0 },
    chance: { type: Number, required: true, min: 0 }
  },
  attaques: [{
    nom: { type: String, required: true },
    degats: { type: Number, required: true, min: 0 },
    precision: { type: Number, required: true, min: 0, max: 1 },
    type: { type: String, required: true }
  }],
  drops: {
    ressources: [{
      ressourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ressource', required: true }, // Référence à la ressource
      quantite_min: { type: Number, required: true, min: 0 },
      quantite_max: { type: Number, required: true, min: 0 },
      probabilite: { type: Number, required: true, min: 0, max: 1 }
    }],
    honneur: { type: Number, required: true, min: 0 },
    xp: { type: Number, required: true, min: 0 }
  },
  image: {
    type: String,
    required: false
  }
});

module.exports = mongoose.model('Creature', CreatureSchema);
const mongoose = require('mongoose');

// Schéma du Boss
const BossSchema = new mongoose.Schema({
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
    enum: ['Rare', 'Épique', 'Légendaire', 'Mythique'],
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
      ressourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ressource', required: true }, // Référence à Ressource
      quantite_min: { type: Number, required: true, min: 0 },
      quantite_max: { type: Number, required: true, min: 0 },
      probabilite: { type: Number, required: true, min: 0, max: 1 }
    }],
    honneur: { type: Number, required: true, min: 0 },
    xp: { type: Number, required: true, min: 0 },
    items: [{
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true }, // Référence à Item
      probabilite: { type: Number, required: true, min: 0, max: 1 }
    }]
  },
  image: {
    type: String,
    required: false
  }
});

module.exports = mongoose.model('Boss', BossSchema);
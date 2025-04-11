const mongoose = require('mongoose');

// Schéma pour les articles de la boutique
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Nom de l'article
  description: { type: String, required: true }, // Description de l'article
  price: { type: Number, required: true }, // Prix de l'article
  devise: {
    type: String,
    enum: ['ecus', 'cristaux', 'points'],
    required: true
  }, // Devise choisie pour l'achat
  rarete: { type: String, enum: ['Commun', 'Rare', 'Épique', 'Légendaire'], required: true }, // Rareté de l'article
  equipable: { type: Boolean, default: false }, // L'article est-il équipable ?
  stock: { type: Number, default: 0 }, // Stock disponible
  categorie: { 
    type: String, 
    enum: ['casque', 'cuirasse', 'gantelet', 'greve', 'solerets', 'epaulettes', 'cape', 'manchettes', 'anneaux', 'pendentifs', 'arme D', 'arme G'], 
    required: true 
  }, // Catégorie de l'article
  boutique: {
    type: String,
    enum: ['boutique', 'dark_boutique', 'boutique_vip'],
    required: true
  }, // Type de boutique
  image: { 
    type: String, 
    required: function() { return this.boutique === 'boutique_vip'; } 
  }, // Image obligatoire pour la boutique VIP
  stats: {
    force: { bonus: { type: Number, default: 0 }, malus: { type: Number, default: 0 } },
    agilite: { bonus: { type: Number, default: 0 }, malus: { type: Number, default: 0 } },
    vitesse: { bonus: { type: Number, default: 0 }, malus: { type: Number, default: 0 } },
    intelligence: { bonus: { type: Number, default: 0 }, malus: { type: Number, default: 0 } },
    dexterite: { bonus: { type: Number, default: 0 }, malus: { type: Number, default: 0 } },
    vitalite: { bonus: { type: Number, default: 0 }, malus: { type: Number, default: 0 } },
    charisme: { bonus: { type: Number, default: 0 }, malus: { type: Number, default: 0 } },
    chance: { bonus: { type: Number, default: 0 }, malus: { type: Number, default: 0 } }
  } // Statistiques avec bonus et malus combinés
});

// Créer un modèle à partir du schéma
const Item = mongoose.model('Item', itemSchema);

// Exporter le modèle
module.exports = Item;
const mongoose = require('mongoose');


const recetteSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  description: { type: String, required: true }, 
  prix: { type: Number, required: true }, 
  devise: {
    type: String,
    enum: ['ecus', 'cristaux', 'points'],
    required: true
  }, 
  rarete: { type: String, enum: ['Commun', 'Rare', 'Épique', 'Légendaire'], required: true },
  equipable: { type: Boolean, default: false },
  stock: { type: Number, default: 0 },
  categorie: { 
    type: String, 
    enum: ['casque', 'cuirasse', 'gantelet', 'greve', 'solerets', 'epaulettes', 'cape', 'manchettes', 'anneaux', 'pendentifs', 'arme D', 'arme G'],
    required: true
  }, 
  boutique: {
    type: String,
    enum: ['boutique', 'dark_boutique', 'boutique_vip'],
    required: true
  },
  image: { 
    type: String, 
    required: function() { return this.boutique === 'boutique_vip'; } 
  },
  stats: {
    force: { bonus: { type: Number, default: 0 }, malus: { type: Number, default: 0 } },
    agilite: { bonus: { type: Number, default: 0 }, malus: { type: Number, default: 0 } },
    vitesse: { bonus: { type: Number, default: 0 }, malus: { type: Number, default: 0 } },
    intelligence: { bonus: { type: Number, default: 0 }, malus: { type: Number, default: 0 } },
    dexterite: { bonus: { type: Number, default: 0 }, malus: { type: Number, default: 0 } },
    vitalite: { bonus: { type: Number, default: 0 }, malus: { type: Number, default: 0 } },
    charisme: { bonus: { type: Number, default: 0 }, malus: { type: Number, default: 0 } },
    chance: { bonus: { type: Number, default: 0 }, malus: { type: Number, default: 0 } }
  },
  niveauMin: { type: Number, required: true },
  ingredients: [
    {
      ressource: { type: mongoose.Schema.Types.ObjectId, ref: 'Ressource', required: true },
      quantity: { type: Number, required: true }
    }
  ], 
  produit: { type: mongoose.Schema.Types.ObjectId, ref: 'Ressource', required: true }
});


const Recette = mongoose.model('Recette', recetteSchema);


module.exports = Recette;
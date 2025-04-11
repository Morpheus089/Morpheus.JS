const mongoose = require('mongoose');

// Schéma pour les recettes de craft
const recetteSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Nom de la recette
  description: { type: String, required: true }, // Description de la recette
  prix: { type: Number, required: true }, // Prix de la recette
  devise: {
    type: String,
    enum: ['ecus', 'cristaux', 'points'],
    required: true
  }, // Devise utilisée pour acheter la recette
  rarete: { type: String, enum: ['Commun', 'Rare', 'Épique', 'Légendaire'], required: true }, // Rareté de l'objet produit
  equipable: { type: Boolean, default: false }, // L'objet produit est-il équipable ?
  stock: { type: Number, default: 0 }, // Stock disponible pour cette recette
  categorie: { 
    type: String, 
    enum: ['casque', 'cuirasse', 'gantelet', 'greve', 'solerets', 'epaulettes', 'cape', 'manchettes', 'anneaux', 'pendentifs', 'arme D', 'arme G'],
    required: true
  }, // Catégorie de l'objet produit par la recette
  boutique: {
    type: String,
    enum: ['boutique', 'dark_boutique', 'boutique_vip'],
    required: true
  }, // Type de boutique où la recette est disponible
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
  }, // Statistiques de l'objet produit par la recette
  niveauMin: { type: Number, required: true }, // Niveau minimum requis dans le métier pour créer cet objet
  ingredients: [
    {
      ressource: { type: mongoose.Schema.Types.ObjectId, ref: 'Ressource', required: true }, // Référence à la ressource nécessaire pour la recette
      quantity: { type: Number, required: true } // Quantité nécessaire de la ressource
    }
  ], // Liste des ressources nécessaires pour la recette
  produit: { type: mongoose.Schema.Types.ObjectId, ref: 'Ressource', required: true } // La ressource produite par la recette
});

// Créer un modèle à partir du schéma
const Recette = mongoose.model('Recette', recetteSchema);

// Exporter le modèle
module.exports = Recette;
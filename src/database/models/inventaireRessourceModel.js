const mongoose = require('mongoose');

// Schéma pour l'inventaire des ressources d'un utilisateur
const inventaireRessourceSchema = new mongoose.Schema({
  utilisateurId: { type: String, required: true }, // Stocke l'ID Discord directement en tant que String
  ressources: [
    {
      ressourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ressource', required: true }, // Référence à la ressource
      quantite: { type: Number, required: true }, // Quantité de la ressource détenue par l'utilisateur
    }
  ],
});

module.exports = mongoose.model('InventaireRessource', inventaireRessourceSchema);
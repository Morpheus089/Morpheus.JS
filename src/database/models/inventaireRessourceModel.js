const mongoose = require('mongoose');


const inventaireRessourceSchema = new mongoose.Schema({
  utilisateurId: { type: String, required: true },
  ressources: [
    {
      ressourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ressource', required: true },
      quantite: { type: Number, required: true },
    
    }
  ],
});

module.exports = mongoose.model('InventaireRessource', inventaireRessourceSchema);
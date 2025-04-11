const mongoose = require('mongoose');

// Schéma corrigé avec le nom en français
const inventaireSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, // Identifiant du joueur
    items: [
        {
            itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' }, // Référence à un item
            quantity: { type: Number, default: 1 } // Quantité possédée
        }
    ]
});

const Inventaire = mongoose.model('Inventaire', inventaireSchema);
module.exports = Inventaire;
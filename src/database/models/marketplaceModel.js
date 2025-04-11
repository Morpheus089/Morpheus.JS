const mongoose = require('mongoose');

// Schéma pour un item mis en vente sur le Marketplace
const marketplaceSchema = new mongoose.Schema({
    sellerId: { type: String, required: true }, // ID de l'utilisateur qui vend l'item
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true }, // Référence à l'item original
    quantity: { type: Number, required: true, min: 1 }, // Nombre d'items mis en vente
    price: { type: Number, required: true, min: 1 }, // Prix défini par le vendeur
    devise: { 
        type: String, 
        enum: ['ecus', 'cristaux', 'points'], 
        required: true 
    }, // Devise choisie pour la vente
    createdAt: { type: Date, default: Date.now } // Date de mise en vente
});

// Créer un modèle à partir du schéma
const Marketplace = mongoose.model('Marketplace', marketplaceSchema);

// Exporter le modèle
module.exports = Marketplace;
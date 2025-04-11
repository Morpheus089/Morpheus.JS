const mongoose = require('mongoose');

// Schéma pour stocker les informations économiques d'un utilisateur
const economieSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, // L'ID de l'utilisateur Discord
    ecus: { type: Number, default: 0 }, // Monnaie des écus
    cristauxNoirs: { type: Number, default: 0 }, // Monnaie des cristaux noirs
    pointsFidelite: { type: Number, default: 0 }, // Monnaie des points de fidélité
    lastUpdated: { type: Date, default: Date.now } // Date de la dernière mise à jour des informations
});

// Créer un modèle à partir du schéma
const Economie = mongoose.model('Economie', economieSchema);

// Exporter le modèle
module.exports = Economie;
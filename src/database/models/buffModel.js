const mongoose = require('mongoose');

const buffSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Nom du buff
    description: { type: String }, // Description du buff
    duration: { type: Number, required: true }, // Durée en secondes
    cooldown: { type: Number, default: 0 }, // Temps de recharge en secondes
    
    // Effets du buff sur les statistiques
    effects: {
        force: { type: Number, default: 0 },
        agilite: { type: Number, default: 0 },
        vitesse: { type: Number, default: 0 },
        intelligence: { type: Number, default: 0 },
        dexterite: { type: Number, default: 0 },
        vitalite: { type: Number, default: 0 },
        charisme: { type: Number, default: 0 },
        chance: { type: Number, default: 0 }
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Middleware pour mettre à jour `updatedAt` à chaque modification
buffSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Buff', buffSchema);
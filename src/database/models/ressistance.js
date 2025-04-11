const mongoose = require('mongoose');

const protectionSkillSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Nom de la compétence
    description: { type: String, required: true }, // Description de la compétence
    duration: { type: Number, required: true }, // Durée de protection en secondes
    cooldown: { type: Number, default: 0 }, // Temps de recharge en secondes
    
    // Effets contre lesquels cette compétence protège
    protectedEffects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Effect' }],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Middleware pour mettre à jour `updatedAt` à chaque modification
protectionSkillSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('ProtectionSkill', protectionSkillSchema);
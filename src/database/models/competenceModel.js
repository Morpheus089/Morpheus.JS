const mongoose = require('mongoose');
const { Effect } = require('./effetModel'); // Importation du modèle Effect

// Définition du schéma pour une compétence d'attaque
const AttackSkillSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    rarity: { type: String, enum: ['Commun', 'Rare', 'Épique', 'Légendaire'], required: true },
    type: { type: String, enum: ['Physique', 'Magique'], required: true },
    energyCost: { type: Number, required: true },
    damage: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    cooldown: { type: Number, default: 0 }, // Temps de recharge en secondes
    
    // Référence aux effets appliqués par cette attaque
    effects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Effect' }]
});

// Création du modèle AttackSkill
const AttackSkill = mongoose.model('AttackSkill', AttackSkillSchema);

module.exports = AttackSkill; // Exportation du modèle AttackSkill
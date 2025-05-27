const mongoose = require('mongoose');
const { Effect } = require('./effetModel');


const AttackSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    rarity: { type: String, enum: ['Commun', 'Rare', 'Épique', 'Légendaire'], required: true },
    type: { type: String, enum: ['Physique', 'Magique'], required: true },
    energyCost: { type: Number, required: true },
    damage: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    effects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Effect' }]
});


const Attack = mongoose.model('Attack', AttackSchema);

module.exports = Attack;
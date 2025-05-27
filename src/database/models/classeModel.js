
const mongoose = require('mongoose');

const classeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    niveau: { type: Number, default: 1 },
    bonusStats: {
        force:        { type: Number, default: 0 },
        agilite:      { type: Number, default: 0 },
        vitesse:      { type: Number, default: 0 },
        intelligence: { type: Number, default: 0 },
        dexterite:    { type: Number, default: 0 },
        vitalite:     { type: Number, default: 0 },
        charisme:     { type: Number, default: 0 },
        chance:       { type: Number, default: 0 }
    },
    
    pointsADistribuer: { type: Number, default: 0 },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

classeSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Classe', classeSchema);
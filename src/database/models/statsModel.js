const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },

    
    statsBase: {
        force: { type: Number, default: 10 },
        agilite: { type: Number, default: 10 },
        vitesse: { type: Number, default: 10 },
        intelligence: { type: Number, default: 10 },
        dexterite: { type: Number, default: 10 },
        vitalite: { type: Number, default: 10 },
        charisme: { type: Number, default: 10 },
        chance: { type: Number, default: 10 }
    },

    
    pointsADistribuer: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});


statsSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Stats', statsSchema);
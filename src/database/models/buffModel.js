const mongoose = require('mongoose');

const buffSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    duration: { type: Number, required: true },
    cooldown: { type: Number, default: 0 },
    
    
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


buffSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Buff', buffSchema);
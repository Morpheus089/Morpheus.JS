const mongoose = require('mongoose');

const niveauSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    niveau: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    experienceRequise: { type: Number, default: 2000 },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Middleware pour mettre à jour `updatedAt` à chaque modification
niveauSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Niveau', niveauSchema);
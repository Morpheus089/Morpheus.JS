const mongoose = require('mongoose');

const GuildSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Référence à l'utilisateur qui a créé la guilde
        required: true
    },
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        enum: ['Assassin', 'Mage', 'Chevalier', 'Mage Épéiste', 'Tout Type'],
        required: true
    },
    level: {
        type: Number,
        default: 1, // Niveau de la guilde commence à 1
        min: 1
    },
    buildingLevel: {
        type: Number,
        default: 0, // Niveau du bâtiment de la guilde commence à 0
        min: 0
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rank: {
            type: String,
            enum: ['Chef', 'Sous-Chef', 'Commandant', 'Membre', 'Recrue'],
            default: 'Recrue'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    subGuilds: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guild' // Liste des guildes qui font partie de cette guilde
    }],
    image: {
        type: String, // URL ou chemin de l'image de la guilde
        default: ''
    },
    activities: {
        type: [String], // Liste des activités demandées dans la guilde
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('Guild', GuildSchema);
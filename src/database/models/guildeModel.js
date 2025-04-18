const mongoose = require('mongoose');

const GuildSchema = new mongoose.Schema({
    creator: {
        type: String, // Stocke l'ID Discord en tant que chaîne
        ref: 'User', // Référence à l'utilisateur qui a créé la guilde (si vous avez un modèle User qui utilise également des chaînes)
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
        type: String, // Classe de la guilde, libre d'accepter n'importe quelle valeur
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
            type: String, // Stocke l'ID Discord en tant que chaîne
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
        },
        position: {
            type: String, // Poste spécifique dans la guilde
            default: ''
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
const mongoose = require('mongoose');

const GuildSchema = new mongoose.Schema({
    creator: {
        type: String,
        ref: 'User',
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
        required: true
    },
    level: {
        type: Number,
        default: 1,
        min: 1
    },
    buildingLevel: {
        type: Number,
        default: 0,
        min: 0
    },
    members: [{
        user: {
            type: String,
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
            type: String,
            default: ''
        }
    }],
    subGuilds: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guild'
    }],
    image: {
        type: String,
        default: ''
    },
    activities: {
        type: [String],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('Guild', GuildSchema);
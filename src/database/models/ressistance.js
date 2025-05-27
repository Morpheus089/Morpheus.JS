const mongoose = require('mongoose');

const protectionSkillSchema = new mongoose.Schema({
    name: { type: String, required: true }, 
    description: { type: String, required: true }, 
    duration: { type: Number, required: true }, 
    cooldown: { type: Number, default: 0 },
    
    
    protectedEffects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Effect' }],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});


protectionSkillSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('ProtectionSkill', protectionSkillSchema);
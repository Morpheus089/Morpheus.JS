const mongoose = require('mongoose');


const economieSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    ecus: { type: Number, default: 0 }, 
    cristauxNoirs: { type: Number, default: 0 },
    pointsFidelite: { type: Number, default: 0 }, 
    lastUpdated: { type: Date, default: Date.now }
});


const Economie = mongoose.model('Economie', economieSchema);


module.exports = Economie;
const mongoose = require('mongoose');

const effectSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    potency: { type: Number, default: 0 }
});

module.exports = mongoose.model('Effect', effectSchema);
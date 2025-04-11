const mongoose = require('mongoose');

const tupperSchema = new mongoose.Schema({
    userId: String,
    name: String,
    avatar: String
});

module.exports = mongoose.model('Tupper', tupperSchema);
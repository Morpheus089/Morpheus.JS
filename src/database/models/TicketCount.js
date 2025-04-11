const mongoose = require('mongoose');

const ticketCountSchema = new mongoose.Schema({
    guildId: String,
    count: Number
});

module.exports = mongoose.model('TicketCount', ticketCountSchema);
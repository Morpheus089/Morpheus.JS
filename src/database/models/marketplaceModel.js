const mongoose = require('mongoose');


const marketplaceSchema = new mongoose.Schema({
    sellerId: { type: String, required: true }, 
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true }, 
    quantity: { type: Number, required: true, min: 1 }, 
    price: { type: Number, required: true, min: 1 }, 
    devise: { 
        type: String, 
        enum: ['ecus', 'cristaux', 'points'], 
        required: true 
    }, 
    createdAt: { type: Date, default: Date.now } 
});


const Marketplace = mongoose.model('Marketplace', marketplaceSchema);


module.exports = Marketplace;
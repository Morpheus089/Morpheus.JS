const mongoose = require('mongoose');


const inventaireSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    items: [
        {
            itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' }, 
            quantity: { type: Number, default: 1 } 
        }
    ]
});

const Inventaire = mongoose.model('Inventaire', inventaireSchema);
module.exports = Inventaire;
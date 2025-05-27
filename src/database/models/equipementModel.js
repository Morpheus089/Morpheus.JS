const mongoose = require('mongoose');

const equipementSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  equipement: {
    casque: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
    cuirasse: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
    gantelet: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
    greve: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
    solerets: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
    epaulettes: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
    cape: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
    manchettes: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
    anneaux: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
    pendentifs: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
    "arme D": { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
    "arme G": { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null }
  },
  dateModification: { type: Date, default: Date.now }
});


const Equipement = mongoose.model('Equipement', equipementSchema);

module.exports = Equipement;
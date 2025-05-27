const mongoose = require('mongoose');

const joueurClasseSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  classe: { type: mongoose.Schema.Types.ObjectId, ref: 'Classe', required: true },

  niveau: { type: Number, default: 1 }, 
  experience: { type: Number, default: 0 }, 
  dateAttribution: { type: Date, default: Date.now },

  actif: { type: Boolean, default: true },
  historique: [
    {
      action: String,
      date: { type: Date, default: Date.now },
      details: String
    }
  ]
});

module.exports = mongoose.model('JoueurClasse', joueurClasseSchema);
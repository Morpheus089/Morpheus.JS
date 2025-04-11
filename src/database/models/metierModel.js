const mongoose = require('mongoose');

const metierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  niveauDeBase: { type: Number, default: 1 },
  niveauMax: { type: Number, default: 100 },
  xpParNiveau: { type: Number, default: 100 },
  recettes: [{
    recetteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recette', required: true },
    niveauRequis: { type: Number, required: true }
  }]
});

const Metier = mongoose.model('Metier', metierSchema);
module.exports = Metier;
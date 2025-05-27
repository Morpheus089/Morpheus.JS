const mongoose = require('mongoose');
const Ressource = require('../database/models/ressourceModel');

async function findRessource(idOrName) {
  if (mongoose.Types.ObjectId.isValid(idOrName)) {
    const byId = await Ressource.findById(idOrName);
    if (byId) return byId;
  }
  return await Ressource.findOne({ nom: idOrName });
}

module.exports = {
  findRessource
};
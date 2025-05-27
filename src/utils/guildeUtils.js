const Guilde = require('../database/models/guildeModel');

async function getGuildeByOwner(userId) {
  return await Guilde.findOne({ ownerId: userId });
}

async function getGuildeByName(nom) {
  return await Guilde.findOne({ nom: { $regex: new RegExp(`^${nom}$`, 'i') } });
}

async function userHasGuilde(userId) {
  const existing = await Guilde.findOne({ ownerId: userId });
  return !!existing;
}

async function createNewGuilde(userId, nom) {
  const newGuilde = new Guilde({
    nom,
    ownerId: userId,
    membres: [userId],
    niveau: 1
  });
  await newGuilde.save();
  return newGuilde;
}

function isMember(guilde, userId) {
  return guilde.membres.includes(userId);
}

function isOwner(guilde, userId) {
  return guilde.ownerId === userId;
}

function hasMemberSlot(guilde) {
  return guilde.membres.length < guilde.niveau * 5;
}

module.exports = {
  getGuildeByOwner,
  getGuildeByName,
  userHasGuilde,
  createNewGuilde,
  isMember,
  isOwner,
  hasMemberSlot
};
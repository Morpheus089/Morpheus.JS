const { createSuccessEmbed } = require('./embeds');

function createGuildeEmbed(guilde, ownerTag = null) {
  const desc = [
    `👑 Propriétaire : ${ownerTag || `<@${guilde.ownerId}>`}`,
    `📈 Niveau : ${guilde.niveau}`,
    `👥 Membres (${guilde.membres.length})`
  ].join('\n');

  return createSuccessEmbed(`🏰 Guilde : ${guilde.nom}`, desc);
}

module.exports = {
  createGuildeEmbed
};
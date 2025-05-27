const { EmbedBuilder } = require('discord.js');

function createSuccessEmbed(title, description, fields = []) {
  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();

  if (fields.length > 0) embed.addFields(...fields);
  return embed;
}

function createErrorEmbed(title, description) {
  return new EmbedBuilder()
    .setColor('Red')
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

function createBalanceEmbed(username, economie) {
  return new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(`${username}, voici ton solde économique ! 💳`)
    .addFields(
      { name: 'Écus 💰', value: `${economie.ecus}`, inline: true },
      { name: 'Cristaux Noirs 🔮', value: `${economie.cristauxNoirs}`, inline: true },
      { name: 'Points de Fidélité ⭐', value: `${economie.pointsFidelite}`, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: 'Système économique du bot' });
}

module.exports = {
  createSuccessEmbed,
  createErrorEmbed,
  createBalanceEmbed
};
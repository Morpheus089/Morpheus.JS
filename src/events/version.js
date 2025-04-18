const { WebhookClient, EmbedBuilder, Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    // === PARAMÈTRES À PERSONNALISER CI-DESSOUS ===
    const version = 'v0.0.0.1';
    const changements = [
      '✨ Premiere verssion de Morpheus.'];

    const webhook = new WebhookClient({
      url: 'https://discord.com/api/webhooks/1352192700153200662/M_zLSHelBkiV8QcT9QT6sDGA0Gu282ebFuMGhSREui9ckX_u04hU5CfIX_CzG19hMQsA'
    });

    const embed = new EmbedBuilder()
      .setTitle(`🛠️ Nouvelle mise à jour - Echoes Of Avalone`)
      .setColor('#a84cb8')
      .setThumbnail('https://zupimages.net/up/25/16/56ra.jpg')
      .setDescription(
        `**📦 Version : \`${version}\`**\n\n📜 **Journal des modifications :**\n\n${changements.map(c => `• ${c}`).join('\n')}`
      )
      .setFooter({ text: 'Echoes Of Avalone - Serveur RP MMORPG', iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    await webhook.send({
      username: '📢 Patchnote Avalonien',
      avatarURL: 'https://zupimages.net/up/25/16/56ra.jpg',
      embeds: [embed],
    });

    console.log(`📢 Annonce de mise à jour (${version}) envoyée !`);
  }
};
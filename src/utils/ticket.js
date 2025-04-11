const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const mongoose = require('mongoose');
const fetch = require('node-fetch');

// Compteur temporaire (remis à 0 au redémarrage)
let ticketCounter = 0;

module.exports = {
  commands: [
    {
      data: new SlashCommandBuilder()
  .setName('installer-ticket')
  .setDescription('Installe le système de ticket')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

async execute(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('📩 Bienvenue dans le Centre de Support')
    .setColor(0x1F8B4C)
    .setThumbnail('https://cdn-icons-png.flaticon.com/512/561/561127.png') // Tu peux changer l'URL pour un logo adapté à ton serveur
    .setDescription(
      `✨ Tu rencontres un souci ? Tu veux contribuer ou signaler un problème ?\n\n` +
      `Utilise le menu ci-dessous pour ouvrir un ticket correspondant à ton besoin. Notre équipe sera ravie de t’aider 💬\n\n` +
      `📌 **Catégories disponibles :**\n\n` +
      `🎭 **RP** — Besoin d'aide pour une fiche ou pour ton RP ? C’est ici !\n` +
      `🚨 **Triche** — Tu as repéré un comportement suspect ? Aide-nous à garder le serveur clean !\n` +
      `💰 **Don** — Tu veux soutenir le serveur et participer à son évolution ? Merci à toi ❤️\n\n` +
      `🛠️ Clique sur le bouton correspondant pour créer ton ticket.`
    )
    .setFooter({ text: 'Système de ticket - Assistance rapide et efficace ✨', iconURL: interaction.client.user.displayAvatarURL() })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_rp')
      .setLabel('🎭 RP')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('ticket_triche')
      .setLabel('🚨 Triche')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('ticket_don')
      .setLabel('💰 Don')
      .setStyle(ButtonStyle.Success)
  );

  await interaction.reply({ embeds: [embed], components: [row] });
}
    },
    {
      data: new SlashCommandBuilder()
        .setName('fermer-ticket')
        .setDescription('Ferme le ticket actuel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

      async execute(interaction) {
        const channel = interaction.channel;
        if (!channel.name.startsWith('ticket-')) {
          return interaction.reply({ content: '❌ Ce salon n’est pas un ticket.', ephemeral: true });
        }

        await interaction.reply('🔒 Fermeture du ticket...');
        setTimeout(() => {
          channel.delete().catch(console.error);
        }, 3000);
      }
    }
  ],

  // Export ticketCounter functions
  getTicketCounter: () => ticketCounter,
  incrementTicketCounter: () => ++ticketCounter,
};
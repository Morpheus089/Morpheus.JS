const { ChannelType, PermissionFlagsBits, Events, EmbedBuilder } = require('discord.js');
const ticket = require('../utils/ticket');

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction) {
    if (!interaction.isButton()) return;

    // Ignore tout bouton qui ne commence pas par "ticket_"
    if (!interaction.customId.startsWith('ticket_')) return;

    const user = interaction.user;
    const ticketType = interaction.customId.split('_')[1];

    const label = {
      rp: '🎭 RP',
      triche: '🚨 Triche',
      don: '💰 Don'
    }[ticketType] || '❓ Inconnu';

    const ticketNumber = ticketSystem.incrementTicketCounter();
    const channelName = `ticket-${user.username.toLowerCase()}-${ticketNumber}`;

    const categoryId = '1358497887725551697';

    const channel = await interaction.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: categoryId,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
        },
        {
          id: interaction.client.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
        },
      ],
    });

    const ticketEmbed = new EmbedBuilder()
      .setTitle(`${label} - Ticket Ouvert`)
      .setDescription(
        `👋 Bonjour <@${user.id}>, bienvenue dans ton ticket !\n\n` +
        `Merci d’avoir ouvert un ticket concernant **${label.replace(/^[^\w\s]/, '')}**.\n` +
        `Un membre de l’équipe va te répondre dans les plus brefs délais.\n\n` +
        `🔒 Tape \`/fermer-ticket\` quand ton problème est résolu.`
      )
      .setColor(0x1F8B4C)
      .setFooter({ text: `ID du ticket : ${ticketNumber}`, iconURL: user.displayAvatarURL() })
      .setTimestamp();

    await channel.send({ content: `🎫 **Ticket ouvert par <@${user.id}>**`, embeds: [ticketEmbed] });
    await interaction.reply({ content: `✅ Ton ticket a été ouvert ici : ${channel}`, ephemeral: true });

    console.log(`🎟️ Ticket créé : ${channelName} pour ${user.tag}`);
  }
};
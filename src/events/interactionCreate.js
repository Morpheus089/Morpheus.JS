const { ChannelType, PermissionFlagsBits, Events, EmbedBuilder } = require('discord.js');
const ticketSystem = require('../utils/ticket'); // Assure-toi que `ticketSystem.incrementTicketCounter()` existe bien

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;

    // --- Gestion des rôles réactifs ---
    const roleButtons = {
      role_farm: '1351324470484140103',
      role_craft: '1351324670258839573',
      role_rp: '1351325144743804968',
      role_annonce: '1351325493433204807',
      role_giveaway: '1351325612283003030',
      role_update: '1351325967435563068',
    };

    if (roleButtons[interaction.customId]) {
      const roleId = roleButtons[interaction.customId];
      const role = interaction.guild.roles.cache.get(roleId);
      const member = interaction.member;

      if (!role) return;

      if (member.roles.cache.has(roleId)) {
        await member.roles.remove(role);
        await interaction.reply({ content: `❌ Rôle retiré : ${role.name}`, ephemeral: true });
      } else {
        await member.roles.add(role);
        await interaction.reply({ content: `✅ Rôle ajouté : ${role.name}`, ephemeral: true });
      }
      return;
    }

    // --- Gestion des tickets ---
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
    const categoryId = '1358497887725551697'; // remplace avec l’ID de ta catégorie

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
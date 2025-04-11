const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const mongoose = require('mongoose');
const fetch = require('node-fetch');


module.exports = {
    commands: [
      {
        data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bannir un utilisateur du serveur.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option => 
            option.setName('user')
                .setDescription('Utilisateur à bannir')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Raison du bannissement')
                .setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'Aucune raison spécifiée';

        await interaction.guild.members.ban(user, { reason });

        const embed = new EmbedBuilder()
            .setTitle('🚫 Utilisateur Banni')
            .setColor('Red')
            .addFields(
                { name: '👤 Utilisateur', value: `${user.tag}`, inline: true },
                { name: '📝 Raison', value: reason, inline: true }
            )
            .setFooter({ text: `Banni par ${interaction.user.tag}` });

        await interaction.reply({ embeds: [embed] });
    }
},

{
  data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulser un utilisateur du serveur.')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option => 
            option.setName('user')
                .setDescription('Utilisateur à expulser')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Raison de l\'expulsion')
                .setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'Aucune raison spécifiée';
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return interaction.reply({ content: '❌ Utilisateur introuvable.', ephemeral: true });
        }

        await member.kick(reason);

        const embed = new EmbedBuilder()
            .setTitle('🚪 Utilisateur Expulsé')
            .setColor('Orange')
            .addFields(
                { name: '👤 Utilisateur', value: `${user.tag}`, inline: true },
                { name: '📝 Raison', value: reason, inline: true }
            )
            .setFooter({ text: `Expulsé par ${interaction.user.tag}` });

        await interaction.reply({ embeds: [embed] });
    }
},

{
  data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute un utilisateur pour une durée donnée.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => 
            option.setName('user')
                .setDescription('Utilisateur à mute')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('duration')
                .setDescription('Durée en minutes')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Raison du mute')
                .setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') || 'Aucune raison spécifiée';
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return interaction.reply({ content: '❌ Utilisateur introuvable.', ephemeral: true });
        }

        await member.timeout(duration * 60 * 1000, reason);

        const embed = new EmbedBuilder()
            .setTitle('🔇 Utilisateur Muté')
            .setColor('Yellow')
            .addFields(
                { name: '👤 Utilisateur', value: `${user.tag}`, inline: true },
                { name: '⏳ Durée', value: `${duration} minutes`, inline: true },
                { name: '📝 Raison', value: reason, inline: true }
            )
            .setFooter({ text: `Muté par ${interaction.user.tag}` });

        await interaction.reply({ embeds: [embed] });
    }
},

{
  data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmute un utilisateur.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => 
            option.setName('user')
                .setDescription('Utilisateur à unmute')
                .setRequired(true)),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return interaction.reply({ content: '❌ Utilisateur introuvable.', ephemeral: true });
        }

        await member.timeout(null);

        const embed = new EmbedBuilder()
            .setTitle('🔊 Utilisateur Unmuté')
            .setColor('Green')
            .addFields(
                { name: '👤 Utilisateur', value: `${user.tag}`, inline: true }
            )
            .setFooter({ text: `Unmuté par ${interaction.user.tag}` });

        await interaction.reply({ embeds: [embed] });
    }
},

{
    data: new SlashCommandBuilder()
    .setName('wiki')
    .setDescription('Cherche une information sur Wikipédia')
    .addStringOption(option =>
        option.setName('sujet')
            .setDescription('Sujet de la recherche')
            .setRequired(true)),

async execute(interaction) {
    const sujet = interaction.options.getString('sujet');
    const url = `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(sujet)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.type === 'standard') {  // Vérifie que l'API renvoie une page valide
            const embed = new EmbedBuilder()
                .setTitle(`📖 **${data.title}**`)
                .setDescription(data.extract) // Description courte
                .setColor('Blue')
                .setURL(data.content_urls ? data.content_urls.desktop.page : null) // Lien vers la page Wikipedia
                .setFooter({ text: `Recherché par ${interaction.user.tag}` });

            // Ajout d'une image si disponible (extrait d'image de la page Wikipedia)
            if (data.thumbnail) {
                embed.setThumbnail(data.thumbnail.source);
            }

            await interaction.reply({ embeds: [embed] });
        } else {
            await interaction.reply({ content: "❌ Aucune information trouvée sur Wikipédia pour ce sujet.", ephemeral: true });
        }
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: "❌ Erreur lors de la récupération des informations.", ephemeral: true });
    }
}
}

  ]
}
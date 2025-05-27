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
    .setDescription("Cherche n'importe quelle information sur Wikipédia")
    .addStringOption(option =>
      option
        .setName('requête')
        .setDescription('Pose ta question ou donne un sujet (phrase entière)')
        .setRequired(true)
    )
    .addBooleanOption(option =>
      option
        .setName('afficher_complet')
        .setDescription("Affiche l'intégralité de l'article (optionnel)")
        .setRequired(false)
    ),

  async execute(interaction) {
    const phrase = interaction.options.getString('requête');
    const afficherComplet = interaction.options.getBoolean('afficher_complet');

    await interaction.deferReply();

    // 1) Recherche des résultats de recherche
    const searchRes = await fetch(
      `https://fr.wikipedia.org/w/rest.php/v1/search/title?q=${encodeURIComponent(phrase)}&limit=5`
    );
    const { pages } = await searchRes.json();

    if (!pages || pages.length === 0) {
      return interaction.editReply({
        content: `❌ Aucun résultat pour « ${phrase} ».`,
        ephemeral: true
      });
    }

    // 2) Si plusieurs résultats, proposer un menu de sélection
    if (pages.length > 1) {
      const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('wiki_select')
          .setPlaceholder('Choisis un article')
          .addOptions(
            pages.map(p => ({
              label: p.title.slice(0, 100),
              value: p.title
            }))
          )
      );

      await interaction.editReply({
        content: 'Plusieurs résultats trouvés, choisis le bon :',
        components: [menu]
      });

      const filter = i =>
        i.user.id === interaction.user.id && i.customId === 'wiki_select';

      const sel = await interaction.channel
        .awaitMessageComponent({ filter, time: 60000 })
        .catch(() => null);

      if (!sel) {
        return interaction.editReply({
          content: '⌛ Temps écoulé.',
          components: []
        });
      }

      return handlePage(sel, sel.values[0], afficherComplet);
    }

    // 3) Sinon, un seul résultat → directement afficher
    return handlePage(interaction, pages[0].title, afficherComplet);
  }
},

// Gestion de l'affichage de la page Wikipédia
async function handlePage(interaction, title, afficherComplet = false) {
  // Récupérer le résumé
  const res = await fetch(
    `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
  );
  const data = await res.json();

  if (data.type !== 'standard') {
    return interaction.editReply({
      content: '❌ Impossible de charger la page.',
      components: []
    });
  }

  // Tronquer à 600 caractères max
  let extrait = data.extract;
  if (extrait.length > 600) extrait = extrait.slice(0, 600) + '…';

  const embed = new EmbedBuilder()
    .setTitle(`📖 ${data.title}`)
    .setURL(data.content_urls.desktop.page)
    .setDescription(extrait)
    .setFooter({ text: `Demandé par ${interaction.user.tag}` })
    .setColor('Blue')
    .setTimestamp();

  if (data.thumbnail) embed.setThumbnail(data.thumbnail.source);
  if (data.originalimage) embed.setImage(data.originalimage.source);

  // Option contenu complet
  if (afficherComplet) {
    const fullRes = await fetch(
      `https://fr.wikipedia.org/api/rest_v1/page/contents/${encodeURIComponent(title)}`
    );
    const fullData = await fullRes.json();
    if (fullData && fullData.content) {
      embed.setDescription(fullData.content.slice(0, 1500));
    }
  }

  if (interaction.deferred || interaction.replied) {
    return interaction.editReply({ embeds: [embed], components: [] });
  } else {
    return interaction.reply({ embeds: [embed] });
  }
},
{
    data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Supprime 100% des messages dans le canal actuel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.channel;

    if (!channel.manageable) {
      return interaction.reply({
        content: '❌ Je n’ai pas la permission de gérer ce salon.',
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      
      const cloned = await channel.clone({
        name: channel.name,
        reason: `Clear total demandé par ${interaction.user.tag}`
      });

      
      if (channel.parent) {
        await cloned.setParent(channel.parentId, { lockPermissions: false });
      }

      
      await cloned.setPosition(channel.position);

      
      await channel.delete(`Clear total demandé par ${interaction.user.tag}`);

      
      await cloned.send(`✅ Ce salon a été vidé à 100% par ${interaction.user}.`);

      
      return interaction.editReply({
        content: '✅ Le salon a été recréé, tous les anciens messages ont été supprimés.',
      });
    } catch (err) {
      console.error('Erreur durant le clear total :', err);
      return interaction.editReply({
        content: '❌ Une erreur est survenue lors de la suppression totale.',
      });
    }
  }
}

  ]
}
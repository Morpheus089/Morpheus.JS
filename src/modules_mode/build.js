const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle,  } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
    commands: [
        {
            data: new SlashCommandBuilder()
                        .setName('channel_count')
                        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
                        .setDescription("Affiche le nombre total de salons et combien il en reste avant la limite."),
                    
                    async execute(interaction) {
                        const totalChannels = interaction.guild.channels.cache.size;
                        const maxChannels = 500;
                        const remainingChannels = maxChannels - totalChannels;
        
                        const embed = new EmbedBuilder()
                            .setTitle("📊 Statistiques des salons")
                            .setColor("Blue")
                            .addFields(
                                { name: "📌 Nombre total de salons", value: `${totalChannels}`, inline: true },
                                { name: "🚀 Salons restants avant la limite", value: `${remainingChannels}`, inline: true }
                            )
                            .setFooter({ text: `Commande exécutée par ${interaction.user.tag}` });
                        
                        await interaction.reply({ embeds: [embed] });
                    }
                },
        {
            data: new SlashCommandBuilder()
        .setName('cree_salon')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription("Crée plusieurs salons dans une catégorie spécifiée.")
        .addStringOption(option => 
            option.setName('categorie')
                .setDescription("Nom de la catégorie où créer les salons")
                .setRequired(true))
        .addStringOption(option => 
            option.setName('salons')
                .setDescription("Noms des salons à créer, séparés par des virgules")
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();

        const categoryName = interaction.options.getString('categorie');
        const channelsInput = interaction.options.getString('salons');
        const channelNames = channelsInput.split(',').map(name => name.trim());
        
        const category = interaction.guild.channels.cache.find(c => c.name === categoryName && c.type === 4);
        
        if (!category) {
            return interaction.editReply({ content: `❌ La catégorie \`${categoryName}\` n'existe pas.`, ephemeral: true });
        }
        
        const createdChannels = [];
        for (const name of channelNames) {
            const channel = await interaction.guild.channels.create({
                name,
                type: 0,
                parent: category.id
            });
            createdChannels.push(channel);
        }

        const embed = new EmbedBuilder()
            .setTitle("✅ Salons créés avec succès !")
            .setColor("Green")
            .addFields(
                { name: "📂 Catégorie", value: categoryName, inline: true },
                { name: "📌 Salons créés", value: createdChannels.map(c => c.name).join(', '), inline: true }
            )
            .setFooter({ text: `Commande exécutée par ${interaction.user.tag}` });
        
        await interaction.editReply({ embeds: [embed] });
    }
},

        {
            data: new SlashCommandBuilder()
                .setName('cree_categorie')
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
                .setDescription("Crée une nouvelle catégorie en copiant les permissions d'une autre.")
                .addStringOption(option => 
                    option.setName('source_id')
                        .setDescription("ID de la catégorie source")
                        .setRequired(true))
                .addStringOption(option => 
                    option.setName('nouveau_nom')
                        .setDescription("Nom de la nouvelle catégorie")
                        .setRequired(true)),

            async execute(interaction) {
                const sourceCategoryId = interaction.options.getString('source_id');
                const newCategoryName = interaction.options.getString('nouveau_nom');
                
                const sourceCategory = interaction.guild.channels.cache.get(sourceCategoryId);
                
                if (!sourceCategory || sourceCategory.type !== 4) {
                    return interaction.reply({ content: `❌ La catégorie source avec l'ID \`${sourceCategoryId}\` n'existe pas ou n'est pas une catégorie.`, ephemeral: true });
                }
                
                const newCategory = await interaction.guild.channels.create({
                    name: newCategoryName,
                    type: 4,
                    permissionOverwrites: sourceCategory.permissionOverwrites.cache.map(overwrite => ({
                        id: overwrite.id,
                        allow: overwrite.allow.toArray(),
                        deny: overwrite.deny.toArray()
                    }))
                });
                
                const embed = new EmbedBuilder()
                    .setTitle("✅ Catégorie créée avec succès !")
                    .setColor("Green")
                    .addFields(
                        { name: "📂 Nouvelle catégorie", value: newCategory.name, inline: true },
                        { name: "🔄 Permissions copiées depuis", value: sourceCategory.name, inline: true }
                    )
                    .setFooter({ text: `Commande exécutée par ${interaction.user.tag}` });
                
                await interaction.reply({ embeds: [embed] });
            }
        },

        {
            data: new SlashCommandBuilder()
        .setName('serveur_info')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription("Affiche un ensemble complet d'informations sur le serveur."),

    async execute(interaction) {
        const guild = interaction.guild;

        const serverName = guild.name || 'Aucun nom disponible';
        const serverId = guild.id || 'Aucun ID disponible';
        const serverOwner = await guild.fetchOwner();
        const memberCount = guild.memberCount || 'Aucun membre disponible';
        const humanCount = guild.members.cache.filter(member => !member.user.bot).size || 0;
        const botCount = guild.members.cache.filter(member => member.user.bot).size || 0;
        const creationDate = guild.createdAt ? guild.createdAt.toDateString() : 'Date de création inconnue';
        const region = guild.preferredLocale || 'Aucune région définie';
        const verificationLevel = guild.verificationLevel !== null ? guild.verificationLevel.toString() : 'Niveau de vérification inconnu';
        const premiumTier = guild.premiumTier || 'Aucun niveau de boost';
        const premiumSubscriptionCount = guild.premiumSubscriptionCount || 0;
        const iconUrl = guild.iconURL() || 'Aucune icône disponible';
        const bannerUrl = guild.bannerURL() || 'Aucune bannière disponible';
        const splashUrl = guild.splashURL() || 'Aucun splash disponible';
        const description = guild.description || 'Aucune description disponible';
        const vanityURL = guild.vanityURLCode || 'Pas de vanity URL';
        const afkChannel = guild.afkChannel || 'Aucun salon AFK';
        const afkTimeout = guild.afkTimeout ? guild.afkTimeout / 60 : 0;
        const systemChannel = guild.systemChannel ? guild.systemChannel.name : 'Aucun canal système';
        const isWidgetEnabled = guild.widgetEnabled;

        let widgetUrl = 'Aucun widget disponible';
        try {
            const widget = await guild.fetchWidget();
            widgetUrl = widget.url || 'Aucun widget disponible';
        } catch (error) {
            console.error("Erreur lors de la récupération de l'URL du widget : ", error);
            widgetUrl = 'Widget désactivé';
        }


        const embed1 = new EmbedBuilder()
            .setTitle(`📊 Informations détaillées du serveur ${serverName}`)
            .setColor("Blue");


        embed1.addFields(
            { name: "🏷 Nom du serveur", value: `${serverName}`, inline: true },
            { name: "🆔 ID du serveur", value: `${serverId}`, inline: true },
            { name: "👑 Propriétaire", value: `${serverOwner.user.tag} (ID: ${serverOwner.id})`, inline: true },
            { name: "👥 Membres", value: `${humanCount} humains / ${botCount} bots`, inline: true },
            { name: "📅 Date de création", value: `${creationDate}`, inline: true },
            { name: "🌍 Région", value: `${region}`, inline: true },
            { name: "🔐 Niveau de vérification", value: `${verificationLevel}`, inline: true },
            { name: "🔗 Niveau de boost", value: `Niveau ${premiumTier} avec ${premiumSubscriptionCount} boosts`, inline: true }
        );


        const embed2 = new EmbedBuilder()
            .setColor("Blue");


        embed2.addFields(
            { name: "🖼 Icône du serveur", value: iconUrl, inline: false },
            { name: "🖼 Bannière du serveur", value: bannerUrl, inline: false },
            { name: "💥 Splash du serveur", value: splashUrl, inline: false },
            { name: "📝 Description", value: description, inline: false },
            { name: "🔗 Vanity URL", value: vanityURL, inline: true },
            { name: "💼 Salon AFK", value: afkChannel, inline: true },
            { name: "⏳ Timeout AFK", value: `${afkTimeout} minutes`, inline: true },
            { name: "🔔 Canal système", value: systemChannel, inline: true },
            { name: "📊 URL du widget", value: widgetUrl, inline: true }
        );


        await interaction.reply({ embeds: [embed1, embed2] });
    }
},

{
    data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('📨 Crée un embed personnalisé')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(option =>
      option.setName('titre')
        .setDescription('Titre de l\'embed')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Description principale')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('couleur')
        .setDescription('Couleur HEX ex: #00ffcc')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('image')
        .setDescription('URL d’une image (facultatif)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('thumbnail')
        .setDescription('URL du thumbnail (facultatif)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('footer')
        .setDescription('Texte du pied de page')
        .setRequired(false))
    .addChannelOption(option =>
      option.setName('salon')
        .setDescription('Salon dans lequel envoyer l’embed')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)),

  async execute(interaction) {
    const titre = interaction.options.getString('titre');
    const description = interaction.options.getString('description');
    const couleur = interaction.options.getString('couleur') || '#5b84ea';
    const image = interaction.options.getString('image');
    const thumbnail = interaction.options.getString('thumbnail');
    const footer = interaction.options.getString('footer') || `Embed généré par ${interaction.user.username}`;
    const salon = interaction.options.getChannel('salon');

    const embed = new EmbedBuilder()
      .setTitle(titre)
      .setDescription(description)
      .setColor(couleur.replace('#', ''))
      .setFooter({ text: footer, iconURL: interaction.client.user.displayAvatarURL() })
      .setTimestamp();

    if (image) embed.setImage(image);
    if (thumbnail) embed.setThumbnail(thumbnail);

    if (salon) {
      await salon.send({ embeds: [embed] });
      await interaction.reply({ content: `✅ Embed envoyé dans ${salon}`, ephemeral: true });
    } else {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
},

{
  data: new SlashCommandBuilder()
  .setName('installer_role')
  .setDescription('Installe le système de rôles personnalisés')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

async execute(interaction) {

  await interaction.deferReply({ ephemeral: true });

  const embed = new EmbedBuilder()
    .setColor('#8e44ad')
    .setTitle('📜 𝑹𝒐̂𝒍𝒆𝒔 𝒑𝒆𝒓𝒔𝒐𝒏𝒏𝒂𝒍𝒊𝒔𝒂𝒃𝒍𝒆𝒔')
    .setDescription(`
Choisis les rôles qui t'intéressent pour recevoir les notifications ou proposer des interactions :

> ⚒️ **Demande de Farm** : Pour aller récolter des ressources ou combattre.
> 🔨 **Demande de Craft** : Besoin d’aide pour fabriquer un objet.
> ✍️ **Demande RP** : Propose une session de RP.
> ❗ **Mention Annonce** : Sois notifié lors des annonces importantes.
> 🎊 **Mention Giveaway** : Reste informé des giveaways.
> ⁉️ **Mention Mise à Jour** : Sois au courant des dernières mises à jour.

_Utilise les boutons ci-dessous pour ajouter ou retirer les rôles._
    `)
    .setFooter({ text: 'Echoes Of Avalone • Choisis ton rôle ✨' })
    .setThumbnail(interaction.client.user.displayAvatarURL());

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('role_farm')
      .setLabel('⚒️ Farm')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('role_craft')
      .setLabel('🔨 Craft')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('role_rp')
      .setLabel('✍️ RP')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('role_annonce')
      .setLabel('❗ Annonce')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('role_giveaway')
      .setLabel('🎊 Giveaway')
      .setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('role_update')
      .setLabel('⁉️ Mise à jour')
      .setStyle(ButtonStyle.Secondary)
  );


  await interaction.channel.send({
    embeds: [embed],
    components: [row, row2],
  });


  await interaction.deleteReply();
}
}

    ]
}
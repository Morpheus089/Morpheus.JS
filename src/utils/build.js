const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
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
                        const maxChannels = 500; // Limite imposée par Discord
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
        await interaction.deferReply(); // ⚠️ Indique que le bot répondra plus tard

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
        
        await interaction.editReply({ embeds: [embed] }); // ⚠️ On utilise editReply ici
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

        // Informations de base sur le serveur
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
        const afkTimeout = guild.afkTimeout ? guild.afkTimeout / 60 : 0; // En minutes
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

        // Partie 1 de l'embed
        const embed1 = new EmbedBuilder()
            .setTitle(`📊 Informations détaillées du serveur ${serverName}`)
            .setColor("Blue");

        // Ajout des champs dans embed1
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

        // Partie 2 de l'embed
        const embed2 = new EmbedBuilder()
            .setColor("Blue");

        // Ajout des champs dans embed2
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

        // Envoi des deux embeds
        await interaction.reply({ embeds: [embed1, embed2] });
    }
}

    ]
}
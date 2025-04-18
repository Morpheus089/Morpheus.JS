const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Stats = require('../database/models/guildeModel'); // Votre modèle pour les Guildes
const mongoose = require('mongoose');

module.exports = {
    commands: [
        {
            data: new SlashCommandBuilder()
                .setName('creer_guilde')
                .setDescription('Crée une nouvelle guilde')
                .addStringOption(option =>
                    option
                        .setName('nom')
                        .setDescription('Nom unique de la guilde')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('type')
                        .setDescription('Type (classe) de la guilde (valeur libre)')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('description')
                        .setDescription('Description de la guilde')
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option
                        .setName('image')
                        .setDescription("URL ou chemin de l'image de la guilde")
                        .setRequired(false)
                ),
            async execute(interaction) {
                const nom = interaction.options.getString('nom').trim();
                const type = interaction.options.getString('type').trim();
                const description = interaction.options.getString('description') || '';
                const image = interaction.options.getString('image') || '';

                try {
                    // Vérifier si une guilde avec ce nom existe déjà
                    const guildeExistante = await Stats.findOne({ name: nom });
                    if (guildeExistante) {
                        const embedErreur = new EmbedBuilder()
                            .setTitle("❌ Erreur")
                            .setDescription(`⚠️ Une guilde portant le nom **${nom}** existe déjà.`)
                            .setColor(0xFF0000)
                            .setTimestamp();
                        return interaction.reply({ embeds: [embedErreur], ephemeral: true });
                    }

                    // Utiliser l'ID de l'utilisateur (chaîne)
                    const creatorId = interaction.user.id;

                    // Créer la guilde en respectant entièrement le modèle
                    const nouvelleGuilde = new Stats({
                        creator: creatorId,
                        name: nom,
                        type: type,
                        description: description,
                        level: 1,
                        buildingLevel: 0,
                        members: [
                            {
                                user: creatorId,
                                rank: "Chef",
                                joinedAt: Date.now(),
                                position: "Chef"
                            }
                        ],
                        subGuilds: [],
                        image: image,
                        activities: []
                    });

                    await nouvelleGuilde.save();

                    const embedSucces = new EmbedBuilder()
                        .setTitle("✅ Guilde créée")
                        .setDescription(`🎉 La guilde **${nom}** a été créée avec succès !`)
                        .setColor(0x00FF00)
                        .setTimestamp();
                    return interaction.reply({ embeds: [embedSucces] });
                } catch (error) {
                    console.error("Erreur lors de la création de la guilde :", error);
                    const embedErreur = new EmbedBuilder()
                        .setTitle("❌ Erreur")
                        .setDescription("🚫 Une erreur est survenue lors de la création de la guilde.")
                        .setColor(0xFF0000)
                        .setTimestamp();
                    return interaction.reply({ embeds: [embedErreur], ephemeral: true });
                }
            }
        },
        {
            data: new SlashCommandBuilder()
                .setName('guilde_invite')
                .setDescription('Invite un joueur à rejoindre votre guilde')
                .addUserOption(option =>
                    option
                        .setName('utilisateur')
                        .setDescription('Le joueur à inviter')
                        .setRequired(true)
                ),
            async execute(interaction) {
                const utilisateurCible = interaction.options.getUser('utilisateur');

                // Empêcher l'utilisateur de s'inviter lui-même
                if (utilisateurCible.id === interaction.user.id) {
                    const embedErreur = new EmbedBuilder()
                        .setTitle("❌ Erreur")
                        .setDescription("🚫 Vous ne pouvez pas vous inviter vous-même.")
                        .setColor(0xFF0000)
                        .setTimestamp();
                    return interaction.reply({ embeds: [embedErreur], ephemeral: true });
                }

                try {
                    const inviterId = interaction.user.id;
                    const cibleId = utilisateurCible.id;

                    // Vérifier que l'invocateur fait partie d'une guilde et a le bon rôle
                    const guilde = await Stats.findOne({ "members.user": inviterId });
                    if (!guilde) {
                        const embedErreur = new EmbedBuilder()
                            .setTitle("❌ Erreur")
                            .setDescription("⚠️ Vous n'êtes dans aucune guilde. Créez-en une avec `/creer_guilde`.")
                            .setColor(0xFF0000)
                            .setTimestamp();
                        return interaction.reply({ embeds: [embedErreur], ephemeral: true });
                    }

                    const membreInvitant = guilde.members.find(
                        membre => membre.user === inviterId
                    );
                    if (!membreInvitant || (membreInvitant.rank !== "Chef" && membreInvitant.rank !== "Sous-Chef")) {
                        const embedErreur = new EmbedBuilder()
                            .setTitle("❌ Erreur")
                            .setDescription("🚫 Vous n'avez pas la permission d'inviter de nouveaux membres.")
                            .setColor(0xFF0000)
                            .setTimestamp();
                        return interaction.reply({ embeds: [embedErreur], ephemeral: true });
                    }

                    // Vérifier que l'utilisateur ciblé n'appartient pas déjà à une guilde
                    const guildeCible = await Stats.findOne({ "members.user": cibleId });
                    if (guildeCible) {
                        const embedErreur = new EmbedBuilder()
                            .setTitle("❌ Erreur")
                            .setDescription(`⚠️ ${utilisateurCible.username} est déjà membre d'une guilde.`)
                            .setColor(0xFF0000)
                            .setTimestamp();
                        return interaction.reply({ embeds: [embedErreur], ephemeral: true });
                    }

                    // Créer l'embed d'invitation pour le message privé (MP)
                    const dmEmbed = new EmbedBuilder()
                        .setTitle("💌 Invitation à rejoindre une Guilde")
                        .setDescription(`🎉 Salut ${utilisateurCible.username},\n\nTu as été invité(e) par **${interaction.user.tag}** à rejoindre la guilde **${guilde.name}**.\n\nClique sur **Accepter** pour rejoindre cette aventure !`)
                        .setColor(0x00FF00)
                        .setTimestamp();

                    // Créer le bouton d'acceptation
                    const acceptButton = new ButtonBuilder()
                        .setCustomId('accept_invite')
                        .setLabel('Accepter')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('✅');

                    const row = new ActionRowBuilder().addComponents(acceptButton);

                    // Envoyer le MP à l'utilisateur ciblé
                    let dmMessage;
                    try {
                        dmMessage = await utilisateurCible.send({ embeds: [dmEmbed], components: [row] });
                    } catch (dmError) {
                        const embedErreurDM = new EmbedBuilder()
                            .setTitle("❌ Erreur")
                            .setDescription("🚫 Impossible d'envoyer un MP à cet utilisateur. Il doit autoriser les messages privés.")
                            .setColor(0xFF0000)
                            .setTimestamp();
                        return interaction.reply({ embeds: [embedErreurDM], ephemeral: true });
                    }

                    // Informer l'invocateur que l'invitation a été envoyée
                    const embedInviteEnvoyee = new EmbedBuilder()
                        .setTitle("📩 Invitation envoyée")
                        .setDescription(`L'invitation a été envoyée à **${utilisateurCible.tag}**. En attente d'acceptation...`)
                        .setColor(0x00FF00)
                        .setTimestamp();
                    await interaction.reply({ embeds: [embedInviteEnvoyee], ephemeral: true });

                    // Attendre que l'utilisateur invité clique sur le bouton dans le MP
                    const filter = i => i.customId === 'accept_invite' && i.user.id === cibleId;
                    const collector = await dmMessage.awaitMessageComponent({ filter, time: 60000 }).catch(() => null);

                    if (!collector) {
                        // Si aucune réponse dans le délai imparti
                        const embedTimeout = new EmbedBuilder()
                            .setTitle("⏰ Temps écoulé")
                            .setDescription("🚫 Tu n'as pas répondu à l'invitation à temps.")
                            .setColor(0xFF0000)
                            .setTimestamp();
                        // Mettre à jour le MP pour indiquer le délai dépassé
                        if (dmMessage.edit) await dmMessage.edit({ embeds: [embedTimeout], components: [] });
                        return;
                    }

                    // Une fois que l'utilisateur accepte via le bouton, on l'ajoute à la guilde
                    guilde.members.push({
                        user: cibleId,
                        rank: "Recrue",
                        joinedAt: Date.now(),
                        position: ""
                    });
                    await guilde.save();

                    const acceptedEmbed = new EmbedBuilder()
                        .setTitle("✅ Invitation acceptée")
                        .setDescription(`🎉 Tu as rejoint la guilde **${guilde.name}** avec succès !`)
                        .setColor(0x00FF00)
                        .setTimestamp();
                    // Mettre à jour le MP en retirant le bouton
                    await collector.update({ embeds: [acceptedEmbed], components: [] });

                    // Notifier l'invocateur en MP ou en réponse éphémère
                    const embedConfirmation = new EmbedBuilder()
                        .setTitle("🎉 Invitation confirmée")
                        .setDescription(`**${utilisateurCible.tag}** a accepté l'invitation et a rejoint la guilde **${guilde.name}** !`)
                        .setColor(0x00FF00)
                        .setTimestamp();
                    await interaction.followUp({ embeds: [embedConfirmation], ephemeral: true });

                } catch (error) {
                    console.error("Erreur lors de l'invitation :", error);
                    const embedErreur = new EmbedBuilder()
                        .setTitle("❌ Erreur")
                        .setDescription("🚫 Une erreur est survenue lors de l'invitation.")
                        .setColor(0xFF0000)
                        .setTimestamp();
                    return interaction.reply({ embeds: [embedErreur], ephemeral: true });
                }
            }
        },

{
    data: new SlashCommandBuilder()
                .setName('ma_guilde')
                .setDescription('Affiche toutes les informations de votre guilde'),

            async execute(interaction) {
                const userId = interaction.user.id;

                try {
                    // Cherche la guilde de l'utilisateur et "populate" les sous-guildes
                    const guilde = await Stats.findOne({ "members.user": userId }).populate('subGuilds');

                    if (!guilde) {
                        const embedErreur = new EmbedBuilder()
                            .setTitle("❌ Aucune guilde trouvée")
                            .setDescription("🚫 Vous n'appartenez à aucune guilde. Créez-en une avec `/creer_guilde`.")
                            .setColor(0xFF0000)
                            .setTimestamp();
                        return interaction.reply({ embeds: [embedErreur], ephemeral: true });
                    }

                    const membre = guilde.members.find(m => m.user === userId);
                    const membresListe = guilde.members
                        .map(m => `• <@${m.user}> - **${m.rank}**${m.position ? ` (${m.position})` : ''}`)
                        .join('\n');

                    const sousGuildesListe = guilde.subGuilds.length > 0
                        ? guilde.subGuilds.map(sg =>
                            `🏰 **${sg.name}** — *${sg.type}*\n📝 ${sg.description || "Pas de description"}`
                        ).join('\n\n')
                        : "Aucune sous-guilde affiliée.";

                    const embedGuilde = new EmbedBuilder()
                        .setTitle(`🏰 Guilde : ${guilde.name}`)
                        .setDescription(guilde.description || "*Aucune description*")
                        .setColor(0x0099FF)
                        .setThumbnail(guilde.image || 'https://i.imgur.com/yW2W9SC.png')
                        .addFields(
                            { name: "👑 Créateur", value: `<@${guilde.creator}>`, inline: true },
                            { name: "📜 Type", value: guilde.type, inline: true },
                            { name: "🏆 Niveau", value: `${guilde.level}`, inline: true },
                            { name: "🏗️ Bâtiment", value: `${guilde.buildingLevel}`, inline: true },
                            { name: "📅 Création", value: `<t:${Math.floor(guilde.createdAt.getTime() / 1000)}:F>`, inline: true },
                            { name: "🎭 Votre rôle", value: `${membre.rank}${membre.position ? ` (${membre.position})` : ''}`, inline: true },
                            { name: "👥 Membres", value: `${guilde.members.length} membres`, inline: true },
                            { name: "📌 Activités", value: guilde.activities.length > 0 ? guilde.activities.join(', ') : "Aucune activité", inline: false },
                            { name: "📚 Membres", value: membresListe.substring(0, 1024), inline: false },
                            { name: "🔗 Sous-Guildes affiliées", value: sousGuildesListe.substring(0, 1024), inline: false }
                        )
                        .setTimestamp();

                    return interaction.reply({ embeds: [embedGuilde] });

                } catch (error) {
                    console.error("Erreur lors de la récupération de la guilde :", error);
                    const embedErreur = new EmbedBuilder()
                        .setTitle("❌ Erreur")
                        .setDescription("🚫 Une erreur est survenue lors de la récupération des informations de la guilde.")
                        .setColor(0xFF0000)
                        .setTimestamp();
                    return interaction.reply({ embeds: [embedErreur], ephemeral: true });
                }
            }
        },

{
    data: new SlashCommandBuilder()
        .setName('quitter_guilde')
        .setDescription('Permet de quitter votre guilde actuelle'),

    async execute(interaction) {
        const userId = interaction.user.id;

        try {
            const guilde = await Stats.findOne({ "members.user": userId });

            if (!guilde) {
                const embedErreur = new EmbedBuilder()
                    .setTitle("❌ Aucune guilde trouvée")
                    .setDescription("🚫 Vous n'appartenez à aucune guilde.")
                    .setColor(0xFF0000)
                    .setTimestamp();
                return interaction.reply({ embeds: [embedErreur], ephemeral: true });
            }

            // Empêcher le créateur de quitter sa propre guilde
            if (guilde.creator === userId) {
                const embedErreur = new EmbedBuilder()
                    .setTitle("⚠️ Impossible de quitter")
                    .setDescription("👑 Vous êtes le créateur de cette guilde. Supprimez-la ou transférez la propriété pour pouvoir la quitter.")
                    .setColor(0xFFAA00)
                    .setTimestamp();
                return interaction.reply({ embeds: [embedErreur], ephemeral: true });
            }

            // Retirer l'utilisateur des membres
            const membreAvant = guilde.members.length;
            guilde.members = guilde.members.filter(m => m.user !== userId);

            if (guilde.members.length === membreAvant) {
                const embedErreur = new EmbedBuilder()
                    .setTitle("❌ Erreur")
                    .setDescription("🚫 Vous n'avez pas pu être retiré de la guilde. Contactez un administrateur.")
                    .setColor(0xFF0000)
                    .setTimestamp();
                return interaction.reply({ embeds: [embedErreur], ephemeral: true });
            }

            await guilde.save();

            const embedSuccess = new EmbedBuilder()
                .setTitle("👋 Vous avez quitté la guilde")
                .setDescription(`✅ Vous avez quitté la guilde **${guilde.name}** avec succès.`)
                .setColor(0x00AAFF)
                .setTimestamp();

            return interaction.reply({ embeds: [embedSuccess], ephemeral: true });

        } catch (error) {
            console.error("Erreur lors de la tentative de quitter la guilde :", error);
            const embedErreur = new EmbedBuilder()
                .setTitle("❌ Erreur")
                .setDescription("🚫 Une erreur est survenue en quittant la guilde.")
                .setColor(0xFF0000)
                .setTimestamp();
            return interaction.reply({ embeds: [embedErreur], ephemeral: true });
        }
    }
},

{
    data: new SlashCommandBuilder()
        .setName('affilier_guilde')
        .setDescription('Demande d’affiliation de votre guilde à une autre guilde.')
        .addUserOption(option =>
            option.setName('chef_cible')
                .setDescription('Chef de la guilde que vous voulez rejoindre')
                .setRequired(true)
        ),

    async execute(interaction) {
        const demandeurId = interaction.user.id;
        const cibleUser = interaction.options.getUser('chef_cible');
        const cibleId = cibleUser.id;

        if (demandeurId === cibleId) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTitle("❌ Erreur")
                    .setDescription("🚫 Vous ne pouvez pas vous affilier à votre propre guilde.")
                    .setColor(0xFF0000)],
                ephemeral: true
            });
        }

        try {
            const guildeDemandeur = await Stats.findOne({ "members.user": demandeurId });
            const guildeCible = await Stats.findOne({ "creator": cibleId });

            if (!guildeDemandeur || !guildeCible) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setTitle("❌ Erreur")
                        .setDescription("🚫 Soit vous, soit la personne ciblée n'est pas chef de guilde.")
                        .setColor(0xFF0000)],
                    ephemeral: true
                });
            }

            const membreDemandeur = guildeDemandeur.members.find(m => m.user === demandeurId);
            if (membreDemandeur.rank !== "Chef") {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setTitle("❌ Permission refusée")
                        .setDescription("🚫 Seul le chef de guilde peut demander une affiliation.")
                        .setColor(0xFF0000)],
                    ephemeral: true
                });
            }

            // Vérifier que la guilde n’est pas déjà affiliée
            if (guildeCible.subGuilds.includes(guildeDemandeur._id)) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setTitle("⚠️ Déjà affiliée")
                        .setDescription("✅ Votre guilde est déjà affiliée à cette guilde.")
                        .setColor(0x00AAFF)],
                    ephemeral: true
                });
            }

            // Embed de demande
            const embedDemande = new EmbedBuilder()
                .setTitle("🤝 Demande d'affiliation de guilde")
                .setDescription(`🔗 **${interaction.user.tag}** (Chef de **${guildeDemandeur.name}**) souhaite affilier sa guilde à la vôtre (**${guildeCible.name}**).\n\nCliquez sur **Accepter** pour confirmer cette alliance.`)
                .setColor(0x00BFFF)
                .setTimestamp();

            const boutonAccepter = new ButtonBuilder()
                .setCustomId('accepter_affiliation')
                .setLabel('Accepter l’affiliation')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅');

            const row = new ActionRowBuilder().addComponents(boutonAccepter);

            let dmMessage;
            try {
                dmMessage = await cibleUser.send({
                    embeds: [embedDemande],
                    components: [row]
                });
            } catch {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setTitle("📪 Échec de l'envoi")
                        .setDescription("❌ Impossible d’envoyer une demande par MP à cet utilisateur.")
                        .setColor(0xFF0000)],
                    ephemeral: true
                });
            }

            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTitle("📨 Demande envoyée")
                    .setDescription(`Votre demande d'affiliation à **${guildeCible.name}** a été envoyée à **${cibleUser.tag}**.`)
                    .setColor(0x00FF00)],
                ephemeral: true
            });

            // Attente du clic
            const filter = i => i.customId === 'accepter_affiliation' && i.user.id === cibleId;
            const collector = await dmMessage.awaitMessageComponent({ filter, time: 60000 }).catch(() => null);

            if (!collector) {
                const expiredEmbed = new EmbedBuilder()
                    .setTitle("⏰ Temps écoulé")
                    .setDescription("🔕 La demande d'affiliation a expiré.")
                    .setColor(0xFFAA00);
                return dmMessage.edit({ embeds: [expiredEmbed], components: [] });
            }

            // Ajouter l'affiliation
            guildeCible.subGuilds.push(guildeDemandeur._id);
            await guildeCible.save();

            const successEmbed = new EmbedBuilder()
                .setTitle("✅ Affiliation acceptée")
                .setDescription(`🎉 Votre guilde est désormais affiliée à **${guildeCible.name}** !`)
                .setColor(0x00FF00);
            await collector.update({ embeds: [successEmbed], components: [] });

            // Informer le demandeur
            await interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setTitle("🤝 Affiliation confirmée")
                    .setDescription(`🎉 **${guildeDemandeur.name}** est maintenant affiliée à **${guildeCible.name}**.`)
                    .setColor(0x00FF00)],
                ephemeral: true
            });

        } catch (error) {
            console.error("Erreur d'affiliation :", error);
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTitle("❌ Erreur")
                    .setDescription("🚫 Une erreur est survenue pendant la demande d’affiliation.")
                    .setColor(0xFF0000)],
                ephemeral: true
            });
        }
    }
},

{
    data: new SlashCommandBuilder()
        .setName('desaffilier_guilde')
        .setDescription('Met fin à l’affiliation entre votre guilde et une autre')
        .addUserOption(option =>
            option.setName('chef_cible')
                .setDescription("Chef de la guilde à laquelle vous êtes affilié")
                .setRequired(true)
        ),

    async execute(interaction) {
        const userId = interaction.user.id;
        const cibleUser = interaction.options.getUser('chef_cible');
        const cibleId = cibleUser.id;

        try {
            const guildeSource = await Stats.findOne({ "members.user": userId });
            const guildeCible = await Stats.findOne({ creator: cibleId });

            if (!guildeSource || !guildeCible) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setTitle("❌ Erreur")
                        .setDescription("🚫 Impossible de trouver la guilde ou celle du chef ciblé.")
                        .setColor(0xFF0000)],
                    ephemeral: true
                });
            }

            const membre = guildeSource.members.find(m => m.user === userId);
            if (membre.rank !== "Chef") {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setTitle("❌ Permission refusée")
                        .setDescription("🚫 Seul le Chef peut désaffilier sa guilde.")
                        .setColor(0xFF0000)],
                    ephemeral: true
                });
            }

            // Vérifie si la guilde est bien affiliée
            if (!guildeCible.subGuilds.includes(guildeSource._id)) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setTitle("⚠️ Aucune affiliation trouvée")
                        .setDescription(`🚫 Votre guilde n'est pas affiliée à **${guildeCible.name}**.`)
                        .setColor(0xFFA500)],
                    ephemeral: true
                });
            }

            // Supprime l'ID de la guilde source
            guildeCible.subGuilds = guildeCible.subGuilds.filter(id => !id.equals(guildeSource._id));
            await guildeCible.save();

            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTitle("🔓 Désaffiliation réussie")
                    .setDescription(`❌ Votre guilde **${guildeSource.name}** n'est plus affiliée à **${guildeCible.name}**.`)
                    .setColor(0x00AAFF)
                    .setTimestamp()],
                ephemeral: true
            });

        } catch (error) {
            console.error("Erreur de désaffiliation :", error);
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTitle("❌ Erreur")
                    .setDescription("🚫 Une erreur est survenue lors de la désaffiliation.")
                    .setColor(0xFF0000)],
                ephemeral: true
            });
        }
    }
},

{
    data: new SlashCommandBuilder()
        .setName('supprimer_guilde')
        .setDescription('Supprime définitivement votre guilde (Chef uniquement)'),

    async execute(interaction) {
        const userId = interaction.user.id;

        try {
            const guilde = await Stats.findOne({ creator: userId });

            if (!guilde) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setTitle("❌ Aucune guilde trouvée")
                        .setDescription("🚫 Vous n'êtes pas le créateur d'une guilde ou celle-ci n'existe pas.")
                        .setColor(0xFF0000)],
                    ephemeral: true
                });
            }

            const nom = guilde.name;

            // Supprimer la guilde
            await Stats.deleteOne({ _id: guilde._id });

            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTitle("🗑️ Guilde supprimée")
                    .setDescription(`❌ La guilde **${nom}** a été définitivement supprimée.`)
                    .setColor(0xFF5555)
                    .setTimestamp()],
                ephemeral: false
            });

        } catch (error) {
            console.error("Erreur lors de la suppression de la guilde :", error);
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTitle("❌ Erreur")
                    .setDescription("🚫 Une erreur est survenue lors de la suppression de la guilde.")
                    .setColor(0xFF0000)],
                ephemeral: true
            });
        }
    }
},

{
    data: new SlashCommandBuilder()
        .setName('promouvoir_membre')
        .setDescription('Promouvoir un membre de votre guilde à un rang supérieur.')
        .addUserOption(option =>
            option.setName('membre')
                .setDescription("Membre de votre guilde à promouvoir")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('nouveau_grade')
                .setDescription('Nouveau grade à attribuer')
                .setRequired(true)
                .addChoices(
                    { name: 'Sous-Chef', value: 'Sous-Chef' },
                    { name: 'Commandant', value: 'Commandant' },
                    { name: 'Membre', value: 'Membre' },
                    { name: 'Recrue', value: 'Recrue' }
                )
        ),

    async execute(interaction) {
        const auteurId = interaction.user.id;
        const membreCible = interaction.options.getUser('membre');
        const nouveauGrade = interaction.options.getString('nouveau_grade');

        try {
            const guilde = await Stats.findOne({ "members.user": auteurId });

            if (!guilde) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setTitle("❌ Aucune guilde trouvée")
                        .setDescription("🚫 Vous n'appartenez à aucune guilde.")
                        .setColor(0xFF0000)],
                    ephemeral: true
                });
            }

            const auteur = guilde.members.find(m => m.user === auteurId);
            if (!["Chef", "Sous-Chef"].includes(auteur.rank)) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setTitle("❌ Permission refusée")
                        .setDescription("🚫 Seuls le Chef ou un Sous-Chef peuvent promouvoir un membre.")
                        .setColor(0xFF0000)],
                    ephemeral: true
                });
            }

            const cible = guilde.members.find(m => m.user === membreCible.id);
            if (!cible) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setTitle("❌ Membre introuvable")
                        .setDescription("🚫 Ce membre ne fait pas partie de votre guilde.")
                        .setColor(0xFF0000)],
                    ephemeral: true
                });
            }

            if (cible.rank === "Chef") {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setTitle("⚠️ Action interdite")
                        .setDescription("👑 Vous ne pouvez pas modifier le rang du Chef de guilde.")
                        .setColor(0xFFAA00)],
                    ephemeral: true
                });
            }

            // Met à jour le grade
            cible.rank = nouveauGrade;
            await guilde.save();

            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTitle("📈 Promotion effectuée")
                    .setDescription(`✅ <@${membreCible.id}> a été promu au grade de **${nouveauGrade}** dans la guilde **${guilde.name}**.`)
                    .setColor(0x00FF00)
                    .setTimestamp()],
                ephemeral: false
            });

        } catch (error) {
            console.error("Erreur lors de la promotion :", error);
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTitle("❌ Erreur")
                    .setDescription("🚫 Une erreur est survenue lors de la promotion.")
                    .setColor(0xFF0000)],
                ephemeral: true
            });
        }
    }
},

{
    data: new SlashCommandBuilder()
        .setName('retrograder_membre')
        .setDescription('Rétrograde un membre de votre guilde à un rang inférieur.')
        .addUserOption(option =>
            option.setName('membre')
                .setDescription("Membre à rétrograder")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('nouveau_grade')
                .setDescription('Nouveau grade (inférieur) à attribuer')
                .setRequired(true)
                .addChoices(
                    { name: 'Commandant', value: 'Commandant' },
                    { name: 'Membre', value: 'Membre' },
                    { name: 'Recrue', value: 'Recrue' }
                )
        ),

    async execute(interaction) {
        const auteurId = interaction.user.id;
        const membreCible = interaction.options.getUser('membre');
        const nouveauGrade = interaction.options.getString('nouveau_grade');

        try {
            const guilde = await Stats.findOne({ "members.user": auteurId });

            if (!guilde) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setTitle("❌ Aucune guilde trouvée")
                        .setDescription("🚫 Vous n'appartenez à aucune guilde.")
                        .setColor(0xFF0000)],
                    ephemeral: true
                });
            }

            const auteur = guilde.members.find(m => m.user === auteurId);
            if (!["Chef", "Sous-Chef"].includes(auteur.rank)) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setTitle("❌ Permission refusée")
                        .setDescription("🚫 Seuls le Chef ou un Sous-Chef peuvent rétrograder un membre.")
                        .setColor(0xFF0000)],
                    ephemeral: true
                });
            }

            const cible = guilde.members.find(m => m.user === membreCible.id);
            if (!cible) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setTitle("❌ Membre introuvable")
                        .setDescription("🚫 Ce membre ne fait pas partie de votre guilde.")
                        .setColor(0xFF0000)],
                    ephemeral: true
                });
            }

            if (cible.user === auteurId) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setTitle("🚫 Action non autorisée")
                        .setDescription("⚠️ Vous ne pouvez pas modifier votre propre rang.")
                        .setColor(0xFFA500)],
                    ephemeral: true
                });
            }

            if (cible.rank === "Chef") {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setTitle("❌ Interdit")
                        .setDescription("👑 Vous ne pouvez pas rétrograder le Chef de guilde.")
                        .setColor(0xFF0000)],
                    ephemeral: true
                });
            }

            // Mise à jour du grade
            cible.rank = nouveauGrade;
            await guilde.save();

            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTitle("⬇️ Rétrogradation effectuée")
                    .setDescription(`📉 <@${membreCible.id}> a été rétrogradé au rang de **${nouveauGrade}** dans la guilde **${guilde.name}**.`)
                    .setColor(0xFFAA00)
                    .setTimestamp()],
                ephemeral: false
            });

        } catch (error) {
            console.error("Erreur de rétrogradation :", error);
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTitle("❌ Erreur")
                    .setDescription("🚫 Une erreur est survenue lors de la rétrogradation.")
                    .setColor(0xFF0000)],
                ephemeral: true
            });
        }
    }
}

    ]
}
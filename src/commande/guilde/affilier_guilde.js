const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const mongoose = require('mongoose');
const Guilde = require('../../database/models/guildeModel');


const { createSuccessEmbed, createErrorEmbed } = require('../../utils/embeds');
const { createGuildeEmbed } = require('../../utils/guildeEmbeds');

const {
    getGuildeByOwner,
    getGuildeByName,
    createNewGuilde,
    userHasGuilde,
    isMember,
    isOwner,
    hasMemberSlot
} = require('../../utils/guildeUtils');

const {
    canJoinGuilde,
    canLeaveGuilde,
    canKickMember
} = require('../../utils/guildeChecks');

const { isAdmin } = require('../../utils/permissions');

module.exports = {
    commands: [
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
                const demandeur = interaction.user;
                const cibleUser = interaction.options.getUser('chef_cible');

                if (demandeur.id === cibleUser.id) {
                    return interaction.reply({
                        embeds: [createErrorEmbed("❌ Erreur", "🚫 Vous ne pouvez pas vous affilier à votre propre guilde.")],
                        ephemeral: true
                    });
                }

                try {
                    const guildeDemandeur = await Guilde.findOne({ownerId: demandeur.id});
                    const guildeCible = await Guilde.findOne({ownerId: cibleUser.id});

                    if (!guildeDemandeur || !guildeCible) {
                        return interaction.reply({
                            embeds: [createErrorEmbed("❌ Erreur", "🚫 L’un de vous n’est pas chef de guilde.")],
                            ephemeral: true
                        });
                    }

                    if (guildeCible.subGuilds.includes(guildeDemandeur._id)) {
                        return interaction.reply({
                            embeds: [createSuccessEmbed("⚠️ Déjà affiliée", "✅ Votre guilde est déjà affiliée à cette guilde.")],
                            ephemeral: true
                        });
                    }

                    // 💌 Envoi d’une invitation par MP
                    const embedDemande = createSuccessEmbed(
                        "🤝 Demande d'affiliation de guilde",
                        `🔗 **${demandeur.tag}** (Chef de **${guildeDemandeur.nom}**) souhaite affilier sa guilde à la vôtre (**${guildeCible.nom}**).\n\nCliquez sur Accepter pour confirmer cette alliance.`
                    );

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
                            embeds: [createErrorEmbed("📪 Échec", "❌ Impossible d’envoyer un MP à cet utilisateur.")],
                            ephemeral: true
                        });
                    }

                    await interaction.reply({
                        embeds: [createSuccessEmbed("📨 Demande envoyée", `Votre demande d'affiliation à **${guildeCible.nom}** a été envoyée à **${cibleUser.tag}**.`)],
                        ephemeral: true
                    });

                    // ⏳ Attente de validation
                    const filter = i => i.customId === 'accepter_affiliation' && i.user.id === cibleUser.id;
                    const collector = await dmMessage.awaitMessageComponent({filter, time: 60000}).catch(() => null);

                    if (!collector) {
                        const expiredEmbed = createErrorEmbed("⏰ Temps écoulé", "🔕 La demande d'affiliation a expiré.");
                        return dmMessage.edit({embeds: [expiredEmbed], components: []});
                    }

                    // ✅ Mise à jour de la guilde cible
                    guildeCible.subGuilds.push(guildeDemandeur._id);
                    await guildeCible.save();

                    const acceptedEmbed = createSuccessEmbed(
                        "✅ Affiliation acceptée",
                        `🎉 Votre guilde est désormais affiliée à **${guildeCible.nom}** !`
                    );

                    await collector.update({embeds: [acceptedEmbed], components: []});

                    await interaction.followUp({
                        embeds: [createSuccessEmbed("🤝 Affiliation confirmée", `🎉 **${guildeDemandeur.nom}** est maintenant affiliée à **${guildeCible.nom}**.`)],
                        ephemeral: true
                    });

                } catch (error) {
                    console.error("❌ Erreur d'affiliation :", error);
                    return interaction.reply({
                        embeds: [createErrorEmbed("❌ Erreur", "🚫 Une erreur est survenue pendant la demande d’affiliation.")],
                        ephemeral: true
                    });
                }
            }
        }

    ]
}
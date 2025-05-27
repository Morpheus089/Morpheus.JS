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
                .setName('guilde_invite')
                .setDescription('Invite un joueur à rejoindre votre guilde')
                .addUserOption(option =>
                    option.setName('utilisateur')
                        .setDescription('Le joueur à inviter')
                        .setRequired(true)
                ),

            async execute(interaction) {
                const inviter = interaction.user;
                const invitedUser = interaction.options.getUser('utilisateur');

                if (invitedUser.id === inviter.id) {
                    return interaction.reply({
                        embeds: [createErrorEmbed("❌ Erreur", "🚫 Vous ne pouvez pas vous inviter vous-même.")],
                        ephemeral: true
                    });
                }

                try {
                    const guilde = await Guilde.findOne({ownerId: inviter.id});
                    if (!guilde) {
                        return interaction.reply({
                            embeds: [createErrorEmbed("❌ Pas de guilde", "Vous ne dirigez aucune guilde. Créez-en une avec /creer_guilde.")],
                            ephemeral: true
                        });
                    }

                    const dejaDansUneGuilde = await Guilde.findOne({membres: invitedUser.id});
                    if (dejaDansUneGuilde) {
                        return interaction.reply({
                            embeds: [createErrorEmbed("❌ Déjà membre", `${invitedUser.username} fait déjà partie d'une guilde.`)],
                            ephemeral: true
                        });
                    }

                    if (!canJoinGuilde(guilde, invitedUser.id)) {
                        return interaction.reply({
                            embeds: [createErrorEmbed("❌ Guilde pleine", "Il n’y a plus de place dans la guilde.")],
                            ephemeral: true
                        });
                    }

                    const dmEmbed = createSuccessEmbed(
                        "💌 Invitation à rejoindre une Guilde",
                        `🎉 Tu as été invité(e) par **${inviter.tag}** à rejoindre la guilde **${guilde.nom}**.\n\nClique sur Accepter pour rejoindre cette aventure !`
                    );

                    const acceptButton = new ButtonBuilder()
                        .setCustomId('accept_invite')
                        .setLabel('Accepter')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('✅');

                    const row = new ActionRowBuilder().addComponents(acceptButton);

                    let dmMessage;
                    try {
                        dmMessage = await invitedUser.send({embeds: [dmEmbed], components: [row]});
                    } catch {
                        return interaction.reply({
                            embeds: [createErrorEmbed("❌ Impossible d'inviter", "L'utilisateur n'autorise pas les messages privés.")],
                            ephemeral: true
                        });
                    }

                    await interaction.reply({
                        embeds: [createSuccessEmbed("📩 Invitation envoyée", `Invitation envoyée à ${invitedUser.tag}, en attente de réponse...`)],
                        ephemeral: true
                    });

                    const filter = i => i.customId === 'accept_invite' && i.user.id === invitedUser.id;
                    const collector = await dmMessage.awaitMessageComponent({filter, time: 60000}).catch(() => null);

                    if (!collector) {
                        if (dmMessage.edit) {
                            const timeoutEmbed = createErrorEmbed("⏰ Temps écoulé", "Tu n'as pas répondu à temps à l'invitation.");
                            await dmMessage.edit({embeds: [timeoutEmbed], components: []});
                        }
                        return;
                    }

                    guilde.membres.push(invitedUser.id);
                    await guilde.save();

                    await collector.update({
                        embeds: [createSuccessEmbed("✅ Invitation acceptée", `🎉 Tu as rejoint la guilde ${guilde.nom} avec succès !`)],
                        components: []
                    });

                    await interaction.followUp({
                        embeds: [createSuccessEmbed("🎉 Invitation confirmée", `${invitedUser.tag} a rejoint la guilde ${guilde.nom}.`)],
                        ephemeral: true
                    });

                } catch (err) {
                    console.error("❌ Erreur lors de l'invitation :", err);
                    return interaction.reply({
                        embeds: [createErrorEmbed("❌ Erreur", "Une erreur est survenue lors de l'invitation.")],
                        ephemeral: true
                    });
                }
            }
        }

    ]
}
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

                try {
                    const guildeSource = await Guilde.findOne({ownerId: userId});
                    const guildeCible = await Guilde.findOne({ownerId: cibleUser.id});

                    if (!guildeSource || !guildeCible) {
                        return interaction.reply({
                            embeds: [createErrorEmbed("❌ Introuvable", "🚫 Impossible de trouver l’une des deux guildes.")],
                            ephemeral: true
                        });
                    }

                    if (!guildeCible.subGuilds.includes(guildeSource._id)) {
                        return interaction.reply({
                            embeds: [createErrorEmbed("⚠️ Non affiliée", `🚫 Votre guilde n'est pas affiliée à ${guildeCible.nom}.`)],
                            ephemeral: true
                        });
                    }

                    guildeCible.subGuilds = guildeCible.subGuilds.filter(id => !id.equals(guildeSource._id));
                    await guildeCible.save();

                    return interaction.reply({
                        embeds: [
                            createSuccessEmbed(
                                "🔓 Désaffiliation réussie",
                                `❌ Votre guilde ${guildeSource.nom} n'est plus affiliée à ${guildeCible.nom}.`
                            )
                        ],
                        ephemeral: true
                    });

                } catch (error) {
                    console.error("❌ Erreur de désaffiliation :", error);
                    return interaction.reply({
                        embeds: [createErrorEmbed("❌ Erreur", "🚫 Une erreur est survenue lors de la désaffiliation.")],
                        ephemeral: true
                    });
                }
            }
        }

    ]
}
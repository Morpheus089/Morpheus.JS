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
                .setName('supprimer_guilde')
                .setDescription('Supprime définitivement votre guilde (Chef uniquement)'),

            async execute(interaction) {
                const userId = interaction.user.id;

                try {
                    const guilde = await Guilde.findOne({creator: userId});

                    if (!guilde) {
                        return interaction.reply({
                            embeds: [
                                createErrorEmbed(
                                    "❌ Aucune guilde trouvée",
                                    "🚫 Vous n’êtes pas le créateur d’une guilde ou elle n'existe pas."
                                )
                            ],
                            ephemeral: true
                        });
                    }

                    const nom = guilde.name;
                    await Guilde.deleteOne({_id: guilde._id});

                    return interaction.reply({
                        embeds: [
                            createSuccessEmbed(
                                "🗑️ Guilde supprimée",
                                `❌ La guilde ${nom} a été définitivement supprimée.`
                            )
                        ],
                        ephemeral: false
                    });

                } catch (error) {
                    console.error("❌ Erreur lors de la suppression de la guilde :", error);
                    return interaction.reply({
                        embeds: [
                            createErrorEmbed(
                                "❌ Erreur",
                                "🚫 Une erreur est survenue lors de la suppression de la guilde."
                            )
                        ],
                        ephemeral: true
                    });
                }
            }
        }

    ]
}
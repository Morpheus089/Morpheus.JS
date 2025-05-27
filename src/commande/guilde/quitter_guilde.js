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
                .setName('quitter_guilde')
                .setDescription('Permet de quitter votre guilde actuelle'),

            async execute(interaction) {
                const userId = interaction.user.id;

                try {
                    const guilde = await Guilde.findOne({membres: userId});

                    if (!guilde) {
                        return interaction.reply({
                            embeds: [createErrorEmbed("❌ Aucune guilde trouvée", "🚫 Vous n'appartenez à aucune guilde.")],
                            ephemeral: true
                        });
                    }

                    if (!canLeaveGuilde(guilde, userId)) {
                        return interaction.reply({
                            embeds: [createErrorEmbed("⚠️ Impossible de quitter", "👑 Vous êtes le chef de cette guilde. Supprimez-la ou transférez la propriété pour pouvoir la quitter.")],
                            ephemeral: true
                        });
                    }

                    const membresAvant = guilde.membres.length;
                    guilde.membres = guilde.membres.filter(m => m !== userId);

                    if (guilde.membres.length === membresAvant) {
                        return interaction.reply({
                            embeds: [createErrorEmbed("❌ Erreur", "🚫 Vous n'avez pas pu être retiré de la guilde. Contactez un administrateur.")],
                            ephemeral: true
                        });
                    }

                    await guilde.save();

                    return interaction.reply({
                        embeds: [createSuccessEmbed("👋 Vous avez quitté la guilde", `✅ Vous avez quitté **${guilde.nom}** avec succès.`)],
                        ephemeral: true
                    });

                } catch (error) {
                    console.error("❌ Erreur lors de la tentative de quitter la guilde :", error);
                    return interaction.reply({
                        embeds: [createErrorEmbed("❌ Erreur", "🚫 Une erreur est survenue en quittant la guilde.")],
                        ephemeral: true
                    });
                }
            }
        }

    ]
}
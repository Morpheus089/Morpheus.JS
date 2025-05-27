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
                .setName('creer_guilde')
                .setDescription('Crée une nouvelle guilde')
                .addStringOption(option =>
                    option.setName('nom')
                        .setDescription('Nom unique de la guilde')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Type (classe) de la guilde (valeur libre)')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Description de la guilde')
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option.setName('image')
                        .setDescription("URL ou chemin de l'image de la guilde")
                        .setRequired(false)
                ),

            async execute(interaction) {
                const nom = interaction.options.getString('nom').trim();
                const type = interaction.options.getString('type').trim();
                const description = interaction.options.getString('description') || '';
                const image = interaction.options.getString('image') || '';
                const creatorId = interaction.user.id;

                try {
                    const alreadyExists = await getGuildeByName(nom);
                    if (alreadyExists) {
                        return interaction.reply({
                            embeds: [createErrorEmbed("❌ Erreur", `⚠️ Une guilde portant le nom ${nom} existe déjà.`)],
                            ephemeral: true
                        });
                    }

                    const dejaChef = await userHasGuilde(creatorId);
                    if (dejaChef) {
                        return interaction.reply({
                            embeds: [createErrorEmbed("❌ Déjà chef", "Tu diriges déjà une guilde.")],
                            ephemeral: true
                        });
                    }

                    const nouvelleGuilde = new Guilde({
                        nom,
                        type,
                        description,
                        niveau: 1,
                        image,
                        ownerId: creatorId,
                        membres: [creatorId],
                        subGuilds: [],
                        activities: []
                    });

                    await nouvelleGuilde.save();

                    return interaction.reply({
                        embeds: [createSuccessEmbed("✅ Guilde créée", `🎉 La guilde ${nom} a été créée avec succès !`)]
                    });

                } catch (error) {
                    console.error("Erreur lors de la création de la guilde :", error);
                    return interaction.reply({
                        embeds: [createErrorEmbed("❌ Erreur", "Une erreur est survenue lors de la création de la guilde.")],
                        ephemeral: true
                    });
                }
            }
        }

    ]
}
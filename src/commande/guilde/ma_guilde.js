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
                .setName('ma_guilde')
                .setDescription('Affiche toutes les informations de votre guilde'),

            async execute(interaction) {
                const userId = interaction.user.id;

                try {

                    const guilde = await Stats.findOne({"members.user": userId}).populate('subGuilds');

                    if (!guilde) {
                        const embedErreur = new EmbedBuilder()
                            .setTitle("❌ Aucune guilde trouvée")
                            .setDescription("🚫 Vous n'appartenez à aucune guilde. Créez-en une avec `/creer_guilde`.")
                            .setColor(0xFF0000)
                            .setTimestamp();
                        return interaction.reply({embeds: [embedErreur], ephemeral: true});
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
                            {name: "👑 Créateur", value: `<@${guilde.creator}>`, inline: true},
                            {name: "📜 Type", value: guilde.type, inline: true},
                            {name: "🏆 Niveau", value: `${guilde.level}`, inline: true},
                            {name: "🏗️ Bâtiment", value: `${guilde.buildingLevel}`, inline: true},
                            {
                                name: "📅 Création",
                                value: `<t:${Math.floor(guilde.createdAt.getTime() / 1000)}:F>`,
                                inline: true
                            },
                            {
                                name: "🎭 Votre rôle",
                                value: `${membre.rank}${membre.position ? ` (${membre.position})` : ''}`,
                                inline: true
                            },
                            {name: "👥 Membres", value: `${guilde.members.length} membres`, inline: true},
                            {
                                name: "📌 Activités",
                                value: guilde.activities.length > 0 ? guilde.activities.join(', ') : "Aucune activité",
                                inline: false
                            },
                            {name: "📚 Membres", value: membresListe.substring(0, 1024), inline: false},
                            {
                                name: "🔗 Sous-Guildes affiliées",
                                value: sousGuildesListe.substring(0, 1024),
                                inline: false
                            }
                        )
                        .setTimestamp();

                    return interaction.reply({embeds: [embedGuilde]});

                } catch (error) {
                    console.error("Erreur lors de la récupération de la guilde :", error);
                    const embedErreur = new EmbedBuilder()
                        .setTitle("❌ Erreur")
                        .setDescription("🚫 Une erreur est survenue lors de la récupération des informations de la guilde.")
                        .setColor(0xFF0000)
                        .setTimestamp();
                    return interaction.reply({embeds: [embedErreur], ephemeral: true});
                }
            }
        }

    ]
}
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
                            {name: 'Sous-Chef', value: 'Sous-Chef'},
                            {name: 'Commandant', value: 'Commandant'},
                            {name: 'Membre', value: 'Membre'},
                            {name: 'Recrue', value: 'Recrue'}
                        )
                ),

            async execute(interaction) {
                const auteurId = interaction.user.id;
                const membreCible = interaction.options.getUser('membre');
                const nouveauGrade = interaction.options.getString('nouveau_grade');

                try {
                    const guilde = await Guilde.findOne({"members.user": auteurId});
                    if (!guilde) {
                        return interaction.reply({
                            embeds: [createErrorEmbed("❌ Aucune guilde trouvée", "🚫 Vous n'appartenez à aucune guilde.")],
                            ephemeral: true
                        });
                    }

                    const auteur = guilde.members.find(m => m.user === auteurId);
                    if (!["Chef", "Sous-Chef"].includes(auteur.rank)) {
                        return interaction.reply({
                            embeds: [createErrorEmbed("❌ Permission refusée", "🚫 Seuls le Chef ou un Sous-Chef peuvent promouvoir un membre.")],
                            ephemeral: true
                        });
                    }

                    const cible = guilde.members.find(m => m.user === membreCible.id);
                    if (!cible) {
                        return interaction.reply({
                            embeds: [createErrorEmbed("❌ Membre introuvable", "🚫 Ce membre ne fait pas partie de votre guilde.")],
                            ephemeral: true
                        });
                    }

                    if (cible.rank === "Chef") {
                        return interaction.reply({
                            embeds: [createErrorEmbed("⚠️ Action interdite", "👑 Vous ne pouvez pas modifier le rang du Chef de guilde.")],
                            ephemeral: true
                        });
                    }

                    cible.rank = nouveauGrade;
                    await guilde.save();

                    return interaction.reply({
                        embeds: [
                            createSuccessEmbed(
                                "📈 Promotion effectuée",
                                `✅ <@${membreCible.id}> a été promu **${nouveauGrade}** dans la guilde **${guilde.name}**.`
                            )
                        ],
                        ephemeral: false
                    });

                } catch (error) {
                    console.error("Erreur lors de la promotion :", error);
                    return interaction.reply({
                        embeds: [createErrorEmbed("❌ Erreur", "🚫 Une erreur est survenue lors de la promotion.")],
                        ephemeral: true
                    });
                }
            }
        }

    ]
}
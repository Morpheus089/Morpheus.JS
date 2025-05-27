const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const mongoose = require('mongoose');
const Recette = require('../../database/models/recetteModel');
const Metier = require('../../database/models/metierModel.js');
const MetierUtilisateur = require('../../database/models/metierUtilisateurModel')

const { createSuccessEmbed, createErrorEmbed } = require('../../utils/embeds');
const { parseRecettesString, validateRecettesExist, getUserMetierData } = require('../../utils/metierUtils');

module.exports = {
    commands: [
        {
            data: new SlashCommandBuilder()
                .setName('mon_metier')
                .setDescription("Affiche ton niveau et ton XP dans un métier.")
                .addStringOption(option =>
                    option.setName('metier')
                        .setDescription("Nom du métier à consulter")
                        .setRequired(true)
                ),

            async execute(interaction) {
                const userId = interaction.user.id;
                const metierNom = interaction.options.getString('metier');

                try {
                    const metier = await Metier.findOne({name: metierNom});
                    if (!metier) {
                        return interaction.reply({
                            embeds: [createErrorEmbed("❌ Métier introuvable", `Le métier "${metierNom}" n'existe pas.`)],
                            ephemeral: true
                        });
                    }

                    const metierData = await getUserMetierData(userId, metier._id);
                    if (!metierData) {
                        return interaction.reply({
                            embeds: [createErrorEmbed("❌ Non débloqué", `Tu n'as pas encore progressé dans "${metierNom}".`)],
                            ephemeral: true
                        });
                    }

                    const xpMax = 100 * metierData.niveau;
                    const progression = Math.round((metierData.xp / xpMax) * 10);
                    const barre = '🟧'.repeat(progression) + '⬜'.repeat(10 - progression);

                    const embed = {
                        color: 0xFFA500,
                        title: `📜 Métier : ${metier.name}`,
                        description: `**Niveau :** ${metierData.niveau}\n**XP :** ${metierData.xp} / ${xpMax}\n\n${barre}`,
                        timestamp: new Date()
                    };

                    return interaction.reply({embeds: [embed]});

                } catch (error) {
                    console.error("Erreur lors de la consultation du métier :", error);
                    return interaction.reply({
                        embeds: [createErrorEmbed("❌ Erreur", "Une erreur est survenue en consultant ton métier.")],
                        ephemeral: true
                    });
                }
            }
        }

    ]
}
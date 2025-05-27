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
                .setName('attribuer_metier')
                .setDescription("Attribue un métier à un utilisateur.")
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
                .addUserOption(option =>
                    option.setName('utilisateur')
                        .setDescription("Utilisateur à qui attribuer le métier")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('metier')
                        .setDescription("Nom du métier à attribuer")
                        .setRequired(true)
                ),

            async execute(interaction) {
                const user = interaction.options.getUser('utilisateur');
                const metierNom = interaction.options.getString('metier');

                try {
                    const metier = await Metier.findOne({name: metierNom});
                    if (!metier) {
                        return interaction.reply({
                            embeds: [createErrorEmbed("❌ Métier introuvable", `Aucun métier nommé "${metierNom}" n’a été trouvé.`)],
                            ephemeral: true
                        });
                    }

                    let userMetier = await MetierUtilisateur.findOne({userId: user.id});
                    if (!userMetier) {
                        userMetier = new MetierUtilisateur({userId: user.id, metiers: []});
                    }

                    const dejaAttribue = userMetier.metiers.some(m => m.metierId.equals(metier._id));
                    if (dejaAttribue) {
                        return interaction.reply({
                            embeds: [createErrorEmbed("⛔ Métier déjà attribué", `${user.username} possède déjà le métier "${metierNom}".`)],
                            ephemeral: true
                        });
                    }

                    userMetier.metiers.push({
                        metierId: metier._id,
                        niveau: 1,
                        xp: 0
                    });

                    await userMetier.save();

                    return interaction.reply({
                        embeds: [createSuccessEmbed(
                            "✅ Métier attribué",
                            `Le métier ${metier.name} a été attribué à ${user.username} (niveau de départ : 1).`
                        )]
                    });

                } catch (err) {
                    console.error("Erreur attribution métier :", err);
                    return interaction.reply({
                        embeds: [createErrorEmbed("❌ Erreur", "Une erreur est survenue lors de l’attribution du métier.")],
                        ephemeral: true
                    });
                }
            }
        }

    ]
}
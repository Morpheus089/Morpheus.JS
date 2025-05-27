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
                .setName('creer_metier')
                .setDescription('Crée un nouveau métier avec un niveau de base de 1.')
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
                .addStringOption(option =>
                    option.setName('nom')
                        .setDescription('Le nom du métier')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Description du métier')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('recettes')
                        .setDescription("IDs des recettes à associer avec niveaux requis (ex: id1:10,id2:20)")
                        .setRequired(true)
                ),

            async execute(interaction) {
                const nom = interaction.options.getString('nom');
                const description = interaction.options.getString('description');
                const recettesStr = interaction.options.getString('recettes');

                try {
                    const recettes = await parseRecettesString(recettesStr);
                    const recettesIds = recettes.map(r => r.recetteId);

                    const recettesValides = await validateRecettesExist(recettesIds);
                    if (recettesValides.length !== recettesIds.length) {
                        return interaction.reply({
                            embeds: [createErrorEmbed("❌ Recettes invalides", "Une ou plusieurs recettes spécifiées sont introuvables.")],
                            ephemeral: true
                        });
                    }

                    const existe = await Metier.findOne({name: nom});
                    if (existe) {
                        return interaction.reply({
                            embeds: [createErrorEmbed("❌ Métier existant", `Le métier nommé ${nom} existe déjà.`)],
                            ephemeral: true
                        });
                    }

                    const nouveauMetier = new Metier({
                        name: nom,
                        description,
                        niveauDeBase: 1,
                        niveauMax: 100,
                        xpParNiveau: 100,
                        recettes
                    });

                    await nouveauMetier.save();

                    const embed = createSuccessEmbed(
                        "🛠️ Nouveau Métier Créé",
                        `Le métier ${nom} a été créé avec un niveau de base de 1.`
                    );

                    embed.addFields(
                        {name: '📄 Description', value: description},
                        {name: '📈 Niveau de Base', value: '1', inline: true},
                        {name: '🔝 Niveau Maximum', value: '100', inline: true},
                        {
                            name: '🧪 Recettes liées',
                            value: recettesValides.map(r => `• ${r.name}`).join('\n') || 'Aucune',
                            inline: false
                        }
                    );

                    return interaction.reply({embeds: [embed]});

                } catch (err) {
                    console.error("Erreur création métier :", err);
                    return interaction.reply({
                        embeds: [createErrorEmbed("❌ Erreur serveur", "Une erreur est survenue lors de la création du métier.")],
                        ephemeral: true
                    });
                }
            }
        }

    ]
}
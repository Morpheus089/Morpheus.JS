const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const mongoose = require('mongoose');
const Recette = require('../database/models/recetteModel'); // Importer le modèle de la recette
const Metier = require('../database/models/metierModel.js'); // Importer le modèle des métiers
const MetierUtilisateur = require('../database/models/metierUtilisateurModel') // Importer le modèle des métiers pour les utilisateurs

module.exports = {
    commands: [
        {
            data: new SlashCommandBuilder()
                .setName('creer_metier')
                .setDescription('Crée un nouveau métier avec un niveau de base de 1.')
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Limite aux administrateurs
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
                const recettesInput = interaction.options.getString('recettes');

                // Vérification des IDs des recettes avec niveaux requis
                const recettes = recettesInput.split(',').map(item => {
                    const [id, niveau] = item.split(':');
                    return { recetteId: id, niveauRequis: parseInt(niveau) };
                });

                // Vérification des recettes dans la base de données
                const recettesIds = recettes.map(r => r.recetteId);
                const recettesValides = await Recette.find({ '_id': { $in: recettesIds } });
                if (recettesValides.length !== recettesIds.length) {
                    return interaction.reply({ content: 'Une ou plusieurs recettes sont introuvables.', ephemeral: true });
                }

                // Vérifier si le métier existe déjà
                const existe = await Metier.findOne({ name: nom });
                if (existe) {
                    const embedErreur = new EmbedBuilder()
                        .setTitle('Erreur')
                        .setDescription(`Le métier **${nom}** existe déjà.`)
                        .setColor('Red');
                    return interaction.reply({ embeds: [embedErreur] });
                }

                // Création du nouveau métier
                const nouveauMetier = new Metier({
                    name: nom,
                    description,
                    niveauDeBase: 1,
                    niveauMax: 100,
                    xpParNiveau: 100,
                    recettes
                });
                await nouveauMetier.save();

                // Embed de confirmation
                const embed = new EmbedBuilder()
                    .setTitle('Nouveau Métier Créé')
                    .setDescription(`Le métier **${nom}** a été créé avec un niveau de base de 1.`)
                    .addFields(
                        { name: 'Description', value: description },
                        { name: 'Niveau de Base', value: '1', inline: true },
                        { name: 'Niveau Maximum', value: '100', inline: true },
                        { name: 'Recettes', value: recettesValides.map(r => r.name).join(', ') || 'Aucune', inline: false }
                    )
                    .setColor('Green');

                await interaction.reply({ embeds: [embed] });
            }
        },

{
    data: new SlashCommandBuilder()
                .setName('attribuer_metier')
                .setDescription("Attribue un métier à un utilisateur.")
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Limite aux administrateurs
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

                // Vérifier si le métier existe
                const metier = await Metier.findOne({ name: metierNom });
                if (!metier) {
                    return interaction.reply({ content: `❌ Le métier **${metierNom}** n'existe pas.`, ephemeral: true });
                }

                // Vérifier si l'utilisateur a déjà un enregistrement
                let userMetier = await MetierUtilisateur.findOne({ userId: user.id });
                if (!userMetier) {
                    userMetier = new MetierUtilisateur({ userId: user.id, metiers: [] });
                }

                // Vérifier si l'utilisateur a déjà ce métier
                if (userMetier.metiers.some(m => m.metierId.equals(metier._id))) {
                    return interaction.reply({ content: `❌ ${user.username} a déjà le métier **${metierNom}**.`, ephemeral: true });
                }

                // Ajouter le métier avec XP et niveau par défaut
                userMetier.metiers.push({ metierId: metier._id, niveau: 1, xp: 0 });
                await userMetier.save();

                return interaction.reply({ content: `✅ Le métier **${metierNom}** a été attribué à ${user.username} avec un niveau de 1 !` });
            }
        },

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

                // Vérifier si le métier existe
                const metier = await Metier.findOne({ name: metierNom });
                if (!metier) {
                    return interaction.reply({ content: `❌ Le métier **${metierNom}** n'existe pas.`, ephemeral: true });
                }

                // Récupérer les informations de l'utilisateur
                let userMetier = await MetierUtilisateur.findOne({ userId });
                if (!userMetier) {
                    return interaction.reply({ content: `❌ Tu n'as pas encore progressé dans ce métier.`, ephemeral: true });
                }

                // Trouver les données du métier
                const metierData = userMetier.metiers.find(m => m.metierId.equals(metier._id));
                if (!metierData) {
                    return interaction.reply({ content: `❌ Tu n'as pas encore progressé dans **${metierNom}**.`, ephemeral: true });
                }

                // Générer la barre d'XP
                const xpMax = 100 * metierData.niveau; // XP nécessaire pour passer au niveau suivant
                const progression = Math.round((metierData.xp / xpMax) * 10);
                const bar = '🟧'.repeat(progression) + '⬜'.repeat(10 - progression);

                // Créer l'embed
                const embed = new EmbedBuilder()
                    .setTitle(`📜 Métier : ${metierNom}`)
                    .setDescription(`**Niveau :** ${metierData.niveau}\n**XP :** ${metierData.xp} / ${xpMax}\n\n${bar}`)
                    .setColor('Orange');

                await interaction.reply({ embeds: [embed] });
            }
        }

    ]
}
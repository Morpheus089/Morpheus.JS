const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const backup = require('discord-backup');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');


const Recette = require('../database/models/recetteModel');
const Ressource = require('../database/models/ressourceModel');
const InventaireRessource = require('../database/models/inventaireRessourceModel');
const Inventaire = require('../database/models/inventaireModel');
const MetierUtilisateur = require('../database/models/metierUtilisateurModel');
const Metier = require('../database/models/metierModel');
const Item = require('../database/models/itemModel');
const Equipement = require('../database/models/equipementModel');
const Classe = require('../database/models/classeModel');
const Stats = require('../database/models/statsModel');
const UserClasse = require('../database/models/joueurClasseModel');
const Creature = require('../database/models/creatureModel');
const Boss = require('../database/models/bossModel');
const Effect = require('../database/models/effetModel');
const Attack = require('../database/models/attaqueModel');
const Economie = require('../database/models/economieModel');
const Marketplace = require('../database/models/marketplaceModel');
const Guilde = require('../database/models/guildeModel');
const Niveau = require('../database/models/niveauModel');


const models = {
    Recette,
    Ressource,
    InventaireRessource,
    Inventaire,
    MetierUtilisateur,
    Metier,
    Item,
    Equipement,
    Classe,
    Stats,
    UserClasse,
    Creature,
    Boss,
    Effect,
    Attack,
    Economie,
    Marketplace,
    Guilde,
    Niveau
};

const backupFolderPath = path.join(__dirname, '..', 'data', 'backups');
const backupClassePath = path.join(__dirname, '..', 'data', 'classeDB');


if (!fs.existsSync(backupFolderPath)) {
    fs.mkdirSync(backupFolderPath, { recursive: true });
    console.log(`[Sauvegarde] Dossier créé : ${backupFolderPath}`);
}

backup.setStorageFolder(backupFolderPath);

console.log('Chargement du module de sauvegarde...');

module.exports = {
    commands: [
        {
            data: new SlashCommandBuilder()
                .setName('creer_backup')
                .setDescription('Crée une sauvegarde du serveur')
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

            async execute(interaction) {
                await interaction.deferReply({ ephemeral: true });

                backup.create(interaction.guild, {
                    jsonBeautify: true,
                    saveImages: 'base64'
                }).then((backupData) => {
                    const embed = new EmbedBuilder()
                        .setTitle('✅ Sauvegarde créée avec succès !')
                        .setDescription(`🆔 ID : \`${backupData.id}\``)
                        .setColor('Green')
                        .setTimestamp();

                    interaction.editReply({ embeds: [embed] });
                }).catch((err) => {
                    console.error(err);
                    const errorEmbed = new EmbedBuilder()
                        .setTitle('❌ Erreur')
                        .setDescription('Une erreur est survenue pendant la création de la sauvegarde.')
                        .setColor('Red');

                    interaction.editReply({ embeds: [errorEmbed] });
                });
            }
        },

        {
            data: new SlashCommandBuilder()
                .setName('charger_backup')
                .setDescription('Charge une sauvegarde sur le serveur')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('ID de la sauvegarde à charger')
                        .setRequired(true))
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

            async execute(interaction) {
                const backupID = interaction.options.getString('id');
                await interaction.deferReply({ ephemeral: true });

                backup.fetch(backupID).then(() => {
                    backup.load(backupID, interaction.guild).then(() => {
                        const embed = new EmbedBuilder()
                            .setTitle('✅ Sauvegarde chargée avec succès !')
                            .setColor('Green')
                            .setTimestamp();

                        interaction.editReply({ embeds: [embed] });
                    }).catch((err) => {
                        console.error(err);
                        const errorEmbed = new EmbedBuilder()
                            .setTitle('❌ Erreur')
                            .setDescription('Impossible de charger la sauvegarde.')
                            .setColor('Red');

                        interaction.editReply({ embeds: [errorEmbed] });
                    });
                }).catch(() => {
                    const errorEmbed = new EmbedBuilder()
                        .setTitle('❌ Sauvegarde introuvable')
                        .setDescription('ID de sauvegarde invalide ou introuvable.')
                        .setColor('Red');

                    interaction.editReply({ embeds: [errorEmbed] });
                });
            }
        },

        {
            data: new SlashCommandBuilder()
                .setName('info_backup')
                .setDescription('Affiche les infos d\'une sauvegarde')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('ID de la sauvegarde à inspecter')
                        .setRequired(true))
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

            async execute(interaction) {
                const backupID = interaction.options.getString('id');
                await interaction.deferReply({ ephemeral: true });

                backup.fetch(backupID).then((backupInfos) => {
                    const embed = new EmbedBuilder()
                        .setTitle('📦 Infos sur la sauvegarde')
                        .addFields(
                            { name: 'Nom du serveur', value: backupInfos.data.name, inline: true },
                            { name: 'Taille', value: `${backupInfos.size} éléments`, inline: true },
                            { name: 'Créée le', value: new Date(backupInfos.data.createdTimestamp).toLocaleString(), inline: false },
                        )
                        .setColor('Blue')
                        .setTimestamp();

                    interaction.editReply({ embeds: [embed] });
                }).catch(() => {
                    const errorEmbed = new EmbedBuilder()
                        .setTitle('❌ Erreur')
                        .setDescription('Sauvegarde introuvable.')
                        .setColor('Red');

                    interaction.editReply({ embeds: [errorEmbed] });
                });
            }
        },

{
    data: new SlashCommandBuilder()
        .setName('backup')
        .setDescription('📦 Sauvegarde la base de données.'),
    
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        let successCount = 0;

        
        if (!fs.existsSync(backupClassePath)) {
            fs.mkdirSync(backupClassePath, { recursive: true });
        }

        
        for (const [modelName, model] of Object.entries(models)) {
            try {
                const data = await model.find().lean();
                const filePath = path.join(backupClassePath, `${modelName}.json`);
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
                successCount++;
            } catch (error) {
                console.error(`❌ Erreur lors de la sauvegarde de ${modelName}:`, error);
            }
        }

        await interaction.editReply(`✅ Sauvegarde terminée : **${successCount}** fichiers JSON créés dans \`/data/classeDB\` !`);
    },
},

{
    data: new SlashCommandBuilder()
        .setName('restore')
        .setDescription('📥 Restaure la base de données.'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        let restoreCount = 0;

        for (const [modelName, model] of Object.entries(models)) {
            try {
                const filePath = path.join(backupClassePath, `${modelName}.json`);

                
                if (fs.existsSync(filePath)) {
                    const fileData = fs.readFileSync(filePath, 'utf-8');
                    const jsonData = JSON.parse(fileData);

                    
                    await model.deleteMany({});
                    await model.insertMany(jsonData);

                    console.log(`✅ Restauré : ${modelName} (${jsonData.length} documents)`);
                    restoreCount++;
                } else {
                    console.warn(`⚠️ Fichier non trouvé pour ${modelName}, ignoré.`);
                }
            } catch (error) {
                console.error(`❌ Erreur de restauration pour ${modelName}:`, error);
            }
        }

        await interaction.editReply(`✅ Restauration terminée : **${restoreCount}** collections restaurées depuis \`/data/classeDB\` !`);
    },
}
    ]
};
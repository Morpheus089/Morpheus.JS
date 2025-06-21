const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const backup = require('discord-backup');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');


const Recette = require('../../database/models/recetteModel');
const Ressource = require('../../database/models/ressourceModel');
const InventaireRessource = require('../../database/models/inventaireRessourceModel');
const Inventaire = require('../../database/models/inventaireModel');
const MetierUtilisateur = require('../../database/models/metierUtilisateurModel');
const Metier = require('../../database/models/metierModel');
const Item = require('../../database/models/itemModel');
const Equipement = require('../../database/models/equipementModel');
const Classe = require('../../database/models/classeModel');
const Stats = require('../../database/models/statsModel');
const UserClasse = require('../../database/models/joueurClasseModel');
const Creature = require('../../database/models/creatureModel');
const Boss = require('../../database/models/bossModel');
const Effect = require('../../database/models/effetModel');
const Attack = require('../../database/models/attaqueModel');
const Economie = require('../../database/models/economieModel');
const Marketplace = require('../../database/models/marketplaceModel');
const Guilde = require('../../database/models/guildeModel');
const Niveau = require('../../database/models/niveauModel');


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

const backupFolderPath = path.join(__dirname, '..', '..', 'data', 'backups');
const backupClassePath = path.join(__dirname, '..', '..', 'data', 'classeDB');


if (!fs.existsSync(backupFolderPath)) {
    fs.mkdirSync(backupFolderPath, { recursive: true });
    console.log(`[Sauvegarde] Dossier créé : ${backupFolderPath}`);
}

backup.setStorageFolder(backupFolderPath);

module.exports = {
    commands: [
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
                await interaction.deferReply({ephemeral: true});

                backup.fetch(backupID).then(() => {
                    backup.load(backupID, interaction.guild).then(() => {
                        const embed = new EmbedBuilder()
                            .setTitle('✅ Sauvegarde chargée avec succès !')
                            .setColor('Green')
                            .setTimestamp();

                        interaction.editReply({embeds: [embed]});
                    }).catch((err) => {
                        console.error(err);
                        const errorEmbed = new EmbedBuilder()
                            .setTitle('❌ Erreur')
                            .setDescription('Impossible de charger la sauvegarde.')
                            .setColor('Red');

                        interaction.editReply({embeds: [errorEmbed]});
                    });
                }).catch(() => {
                    const errorEmbed = new EmbedBuilder()
                        .setTitle('❌ Sauvegarde introuvable')
                        .setDescription('ID de sauvegarde invalide ou introuvable.')
                        .setColor('Red');

                    interaction.editReply({embeds: [errorEmbed]});
                });
            }
        }

    ]
}
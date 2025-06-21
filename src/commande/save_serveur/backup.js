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
                .setName('backup')
                .setDescription('📦 Sauvegarde la base de données.'),

            async execute(interaction) {
                await interaction.deferReply({ephemeral: true});

                let successCount = 0;


                if (!fs.existsSync(backupClassePath)) {
                    fs.mkdirSync(backupClassePath, {recursive: true});
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
        }

    ]
}
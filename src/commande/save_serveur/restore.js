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
                .setName('restore')
                .setDescription('📥 Restaure la base de données.'),

            async execute(interaction) {
                await interaction.deferReply({ephemeral: true});

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
}
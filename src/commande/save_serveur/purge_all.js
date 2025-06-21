const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
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
                .setName('purge_all')
                .setDescription('🧹 Supprime tous les messages dans tous les salons sauf ceux exclus.')
                .addStringOption(option =>
                    option.setName('exclude')
                        .setDescription("Liste des IDs de salons à exclure, séparés par des virgules")
                        .setRequired(false)
                )
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

            async execute(interaction) {
                await interaction.deferReply({ ephemeral: true });

                const excludeInput = interaction.options.getString('exclude');
                const excludedChannelIDs = excludeInput
                    ? excludeInput.split(',').map(id => id.trim())
                    : [];

                let totalDeleted = 0;

                const textChannels = interaction.guild.channels.cache.filter(
                    (channel) =>
                        channel.type === ChannelType.GuildText &&
                        !excludedChannelIDs.includes(channel.id)
                );

                for (const [id, channel] of textChannels) {
                    try {
                        let messages;
                        do {
                            messages = await channel.messages.fetch({ limit: 100 });
                            const deletable = messages.filter(m => m.deletable);
                            if (deletable.size > 0) {
                                const deleted = await channel.bulkDelete(deletable, true);
                                totalDeleted += deleted.size;
                                await new Promise((r) => setTimeout(r, 1500)); // éviter le rate-limit
                            }
                        } while (messages.size >= 2);
                    } catch (err) {
                        console.error(`Erreur dans le salon ${channel.name}: ${err.message}`);
                    }
                }

                await interaction.editReply(`✅ Purge terminée. **${totalDeleted} messages supprimés** (hors salons exclus).`);
            }
        }
    ]
}
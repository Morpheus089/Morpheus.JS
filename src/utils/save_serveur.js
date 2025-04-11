const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const backup = require('discord-backup');
const fs = require('fs');
const path = require('path');

// Définir le chemin du dossier de sauvegardes
const backupFolderPath = path.join(__dirname, '..', 'data', 'backups');

// Créer le dossier s'il n'existe pas
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
        }
    ]
};
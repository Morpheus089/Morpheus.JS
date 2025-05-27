const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Niveau = require('../../database/models/niveauModel');

const generateProgressBar = require('../../utils/progressBar');
const calculerXpPourNiveau = require('../../utils/xpCalcul');
const { ajouterNiveaux, retirerNiveaux } = require('../../utils/xpHandler');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');

module.exports = {
    commands: [

{
    data: new SlashCommandBuilder()
        .setName('retirer_niveaux')
        .setDescription("Retire des niveaux à un utilisateur (en calculant l'XP correspondante)")
        .addUserOption(option =>
            option
                .setName('utilisateur')
                .setDescription("L'utilisateur à qui retirer des niveaux")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('niveaux')
                .setDescription("Nombre de niveaux à retirer")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const utilisateur = interaction.options.getUser('utilisateur');
        const niveauxARetirer = interaction.options.getInteger('niveaux');

        try {

            const niveau = await retirerNiveaux(utilisateur.id, niveauxARetirer);


            const fields = [
                { name: 'Niveau actuel', value: `${niveau.niveau}`, inline: true },
                { name: 'XP actuelle', value: `${niveau.experience} / ${niveau.experienceRequise} XP`, inline: true }
            ];
            const embed = createSuccessEmbed(
                '📉 Niveaux retirés !',
                `${niveauxARetirer} niveau(s) ont été retiré(s) à **${utilisateur.username}**.`,
                fields
            );

            return interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.error('Erreur lors du retrait de niveaux :', err);
            return interaction.reply({
                embeds: [createErrorEmbed('❌ Impossible de retirer les niveaux', err.message)],
                ephemeral: true
            });
        }
    }
}

    ]
}
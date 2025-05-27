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
    .setName('ajouter_niveau')
    .setDescription('Ajouter des niveaux à un utilisateur')
    .addUserOption(option =>
      option
        .setName('utilisateur')
        .setDescription("L'utilisateur à qui ajouter des niveaux")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('niveau')
        .setDescription('Le niveau à atteindre')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const utilisateur = interaction.options.getUser('utilisateur');
    const niveauxAAjouter = interaction.options.getInteger('niveau');

    try {
      
      const niveauDoc = await ajouterNiveaux(utilisateur.id, niveauxAAjouter);

      const embed = createSuccessEmbed(
        '🎉 Niveau mis à jour !',
        `${utilisateur.username} passe maintenant au niveau **${niveauDoc.niveau}** (XP actuelle : ${niveauDoc.experience} / ${niveauDoc.experienceRequise}).`
      );

      return interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error('Erreur lors de l\'ajout de niveaux :', err);
      return interaction.reply({
        embeds: [createErrorEmbed('❌ Impossible d’ajouter des niveaux', err.message)],
        ephemeral: true
      });
    }
  }
}

    ]
}
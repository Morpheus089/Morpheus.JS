const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Niveau = require('../src/database/models/niveauModel');

const generateProgressBar = require('../src/utils/progressBar');
const calculerXpPourNiveau = require('../src/utils/xpCalcul');
const { ajouterNiveaux, retirerNiveaux } = require('../src/utils/xpHandler');
const { createErrorEmbed, createSuccessEmbed } = require('../src/utils/embeds');

module.exports = {
    commands: [
        {
            data: new SlashCommandBuilder()
        .setName('niveau')
        .setDescription('Affiche ton niveau et ton expérience actuelle'),

    async execute(interaction) {
        const userId = interaction.user.id;

        try {
            let niveau = await Niveau.findOne({ userId });

            if (!niveau) {
                niveau = new Niveau({ userId });
                await niveau.save();
                return interaction.reply({ 
                    embeds: [createSuccessEmbed('📈 Compte Niveau créé', '✅ Ton système de niveaux vient d\'être initialisé ! Utilise `/niveau` à nouveau.')], 
                    ephemeral: true 
                });
            }

            const pourcentageXP = Math.floor((niveau.experience / niveau.experienceRequise) * 100);
            const progressionBar = generateProgressBar(pourcentageXP);

            const embed = new EmbedBuilder()
                .setColor('#32CD32')
                .setTitle(`📊 Niveau de ${interaction.user.username}`)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: 'Niveau', value: `🎯 **${niveau.niveau}**`, inline: true },
                    { name: 'XP', value: `🟢 **${niveau.experience}** / **${niveau.experienceRequise}** XP`, inline: true },
                    { name: 'Progression', value: `${progressionBar} ${pourcentageXP}%` }
                )
                .setFooter({ text: 'Continue de participer pour monter en niveau !' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error('Erreur lors de l\'affichage du niveau :', err);
            await interaction.reply({ embeds: [createErrorEmbed('Erreur', '❌ Une erreur est survenue lors de l\'affichage de ton niveau.')], ephemeral: true });
        }
    }
},

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
},
        
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
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord-api-types/v10');
const mongoose = require('mongoose');
const Stats = require('../../database/models/statsModel');
const Equipement = require('../../database/models/equipementModel');
const Item = require('../../database/models/itemModel');

const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');
const {
  getOrCreateUserStats,
  getFormattedStatFields,
  calculateTotalStatsWithEquipement
} = require('../../utils/statsUtils');

Equipement.schema.set('strictPopulate', false);

module.exports = {
    commands: [

        {
            data: new SlashCommandBuilder()
            .setName('distribuer')
            .setDescription('Distribue des points dans une statistique spécifique 📊')
            .addStringOption(option =>
              option.setName('stat')
                .setDescription('La statistique à améliorer')
                .setRequired(true)
                .addChoices(
                  { name: 'Force', value: 'force' },
                  { name: 'Agilité', value: 'agilite' },
                  { name: 'Vitesse', value: 'vitesse' },
                  { name: 'Intelligence', value: 'intelligence' },
                  { name: 'Dextérité', value: 'dexterite' },
                  { name: 'Vitalité', value: 'vitalite' },
                  { name: 'Charisme', value: 'charisme' },
                  { name: 'Chance', value: 'chance' }
                )
            )
            .addIntegerOption(option =>
              option.setName('points')
                .setDescription('Le nombre de points à distribuer')
                .setRequired(true)
            ),
        
          async execute(interaction) {
            const userId = interaction.user.id;
            const stat = interaction.options.getString('stat');
            const points = interaction.options.getInteger('points');
        
            try {
              let userStats = await Stats.findOne({ userId });
              if (!userStats) {
                return interaction.reply({
                  embeds: [createErrorEmbed("Statistiques non trouvées", "Tu n'as pas encore de statistiques créées. Utilise `/stats` pour les générer.")],
                  ephemeral: true
                });
              }
        
              if (userStats.pointsADistribuer < points) {
                return interaction.reply({
                  embeds: [createErrorEmbed("Pas assez de points", `Tu n'as que **${userStats.pointsADistribuer}** points à distribuer.`)],
                  ephemeral: true
                });
              }
        
              userStats.statsBase[stat] += points;
              userStats.pointsADistribuer -= points;
              await userStats.save();
        
              const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('📊 Points Distribués')
                .setDescription(`${STAT_EMOJIS[stat]} **${points}** points ajoutés à **${stat.charAt(0).toUpperCase() + stat.slice(1)}** !`)
                .setFooter({ text: 'Système de statistiques du bot' })
                .setTimestamp();
        
              return interaction.reply({ embeds: [embed], ephemeral: true });
        
            } catch (error) {
              console.error("Erreur lors de la distribution des points:", error);
              return interaction.reply({
                embeds: [createErrorEmbed("Erreur", "Une erreur est survenue lors de la distribution des points.")],
                ephemeral: true
              });
            }
          }
        }

    ]
}
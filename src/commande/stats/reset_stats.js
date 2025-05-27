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
          .setName('reset_stats')
          .setDescription('Réinitialise tes statistiques et récupère tous tes points à redistribuer 🔄'),
        
        async execute(interaction) {
          const userId = interaction.user.id;
        
          try {
            const userStats = await Stats.findOne({ userId });
        
            if (!userStats) {
              return interaction.reply({
                embeds: [createErrorEmbed("❌ Statistiques introuvables", "Aucune statistique trouvée à réinitialiser.")],
                ephemeral: true
              });
            }
        
            let totalPoints = 0;
        
            for (const stat in userStats.statsBase) {
              if (Object.prototype.hasOwnProperty.call(userStats.statsBase, stat)) {
                totalPoints += userStats.statsBase[stat];
                userStats.statsBase[stat] = 0;
              }
            }
        
            userStats.pointsADistribuer = (userStats.pointsADistribuer || 0) + totalPoints;
        
            await userStats.save();
        
            const embed = createSuccessEmbed(
              '🔄 Statistiques réinitialisées',
              '✅ Tes statistiques ont été réinitialisées ! Tous tes points sont à nouveau disponibles pour la distribution.'
            );
        
            return interaction.reply({ embeds: [embed] });
        
          } catch (error) {
            console.error("Erreur lors de la réinitialisation des statistiques:", error);
            return interaction.reply({
              embeds: [createErrorEmbed("❌ Erreur", "Une erreur est survenue pendant la réinitialisation.")],
              ephemeral: true
            });
          }
        }
        }

    ]
}
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
          .setName('retirer_stats')
          .setDescription("Retirer des points de statistiques à un utilisateur (Administrateurs seulement) 📉")
          .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
          .addUserOption(option =>
            option.setName('utilisateur')
              .setDescription("L'utilisateur à qui retirer des points")
              .setRequired(true)
          )
          .addStringOption(option =>
            option.setName('stat')
              .setDescription("La statistique à diminuer")
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
              .setDescription("Le nombre de points à retirer")
              .setRequired(true)
          ),
        
        async execute(interaction) {
          const targetUser = interaction.options.getUser('utilisateur');
          const stat = interaction.options.getString('stat');
          const points = interaction.options.getInteger('points');
        
          try {
            const userStats = await Stats.findOne({ userId: targetUser.id });
        
            if (!userStats) {
              return interaction.reply({
                embeds: [createErrorEmbed("Utilisateur introuvable", "Ce membre n'a pas encore de statistiques.")],
                ephemeral: true
              });
            }
        
            if (userStats.statsBase[stat] < points) {
              return interaction.reply({
                embeds: [createErrorEmbed("Points insuffisants", `${targetUser.username} n’a pas assez de points en **${stat}**.`)],
                ephemeral: true
              });
            }
        
            userStats.statsBase[stat] -= points;
            await userStats.save();
        
            const emoji = STAT_EMOJIS[stat] || '📉';
            const statLabel = stat.charAt(0).toUpperCase() + stat.slice(1);
        
            const embed = createSuccessEmbed(
              '📉 Points Retirés',
              `${emoji} **${points}** points ont été retirés à **${statLabel}** de ${targetUser.username}.`
            );
            embed.setColor(0xFF0000); // pour forcer couleur rouge si tu veux
        
            return interaction.reply({ embeds: [embed] });
        
          } catch (error) {
            console.error("Erreur lors du retrait des points de statistiques:", error);
            return interaction.reply({
              embeds: [createErrorEmbed("❌ Erreur", "Une erreur est survenue lors du retrait des points.")],
              ephemeral: true
            });
          }
        }
        }
        
          ]
        }
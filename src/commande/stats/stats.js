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
    .setName('stats')
    .setDescription("Affiche tes statistiques et ton équipement 📊"),

  async execute(interaction) {
    const userId = interaction.user.id;

    try {
      const userStats = await getOrCreateUserStats(userId);

      let userEquipement = await Equipement.findOne({ userId }).populate(
        'equipement.casque equipement.cuirasse equipement.gantelet equipement.greve equipement.solerets equipement.epaulettes equipement.cape equipement.manchettes equipement.anneaux equipement.pendentifs equipement.armeD equipement.armeG'
      );

      const equipementData = userEquipement ? userEquipement.equipement : {};
      const statsFinales = calculateTotalStatsWithEquipement(userStats.statsBase, equipementData);

      const statsFields = getFormattedStatFields(statsFinales);
      statsFields.push({
        name: "🎯 Points à distribuer",
        value: `**${userStats.pointsADistribuer}**`,
        inline: true
      });

      const equipementFields = [];

      for (const [slot, item] of Object.entries(equipementData)) {
        if (item && item.name) {
          equipementFields.push({
            name: `🛡️ ${slot.charAt(0).toUpperCase() + slot.slice(1)}`,
            value: `**${item.name}**`,
            inline: true
          });
        }
      }

      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(`📊 Statistiques de ${interaction.user.username}`)
        .addFields(statsFields)
        .setTimestamp()
        .setFooter({ text: "Système de statistiques du bot" });

      embed.addFields({
        name: "🎽 Équipement actuel",
        value: equipementFields.length > 0 ? "Voici ce que tu portes :" : "Aucun équipement équipé"
      });

      if (equipementFields.length > 0) {
        embed.addFields(equipementFields);
      }

      return interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error("❌ Erreur lors de l'affichage des statistiques :", error);
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Erreur", "Une erreur est survenue lors de l'affichage de tes statistiques.")],
        ephemeral: true
      });
    }
  }
}

    ]
}
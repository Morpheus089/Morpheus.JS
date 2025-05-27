const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord-api-types/v10');
const mongoose = require('mongoose');
const Stats = require('../database/models/statsModel');
const Equipement = require('../database/models/equipementModel');
const Item = require('../database/models/itemModel');

const { createErrorEmbed, createSuccessEmbed } = require('../utils/embeds');
const {
  getOrCreateUserStats,
  getFormattedStatFields,
  calculateTotalStatsWithEquipement
} = require('../utils/statsUtils');

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
},

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
},

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
},

{
  data: new SlashCommandBuilder()
  .setName('ajouter_stats')
  .setDescription("Ajouter des points de statistiques à un utilisateur (Administrateurs seulement) 📊")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addUserOption(option =>
    option.setName('utilisateur')
      .setDescription("L'utilisateur à qui ajouter des points")
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('stat')
      .setDescription("La statistique à augmenter")
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
      .setDescription("Le nombre de points à ajouter")
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
        embeds: [createErrorEmbed("Utilisateur introuvable", "Ce membre n'a pas encore de profil de statistiques.")],
        ephemeral: true
      });
    }

    userStats.statsBase[stat] += points;
    await userStats.save();

    const emoji = STAT_EMOJIS[stat] || "📊";
    const statLabel = stat.charAt(0).toUpperCase() + stat.slice(1);

    const embed = createSuccessEmbed(
      '📊 Points Ajoutés',
      `✅ ${emoji} **${points}** points ont été ajoutés à **${statLabel}** de ${targetUser.username} !`
    );

    return interaction.reply({ embeds: [embed] });

  } catch (error) {
    console.error("Erreur lors de l'ajout des points de statistiques:", error);
    return interaction.reply({
      embeds: [createErrorEmbed("❌ Erreur", "Une erreur est survenue lors de l'ajout des points.")],
      ephemeral: true
    });
  }
}
},

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
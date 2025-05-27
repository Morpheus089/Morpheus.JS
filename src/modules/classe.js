const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const mongoose = require('mongoose');
const Classe = require('../database/models/classeModel');
const Stats = require('../database/models/statsModel');
const UserClasse = require('../database/models/joueurClasseModel');

module.exports = {
    commands: [
        {
            data: new SlashCommandBuilder()
                .setName('creer_classe')
                .setDescription('Crée une nouvelle classe pour le MMORPG')
                .addStringOption(option => 
                    option.setName('name')
                          .setDescription('Nom de la classe')
                          .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('description')
                          .setDescription('Description détaillée de la classe')
                          .setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName('niveau')
                          .setDescription('Niveau de la classe (optionnel, par défaut 1)')
                          .setRequired(false)
                )
                .addIntegerOption(option =>
                    option.setName('force')
                          .setDescription('Bonus de force')
                          .setRequired(false)
                )
                .addIntegerOption(option =>
                    option.setName('agilite')
                          .setDescription("Bonus d'agilité")
                          .setRequired(false)
                )
                .addIntegerOption(option =>
                    option.setName('vitesse')
                          .setDescription('Bonus de vitesse')
                          .setRequired(false)
                )
                .addIntegerOption(option =>
                    option.setName('intelligence')
                          .setDescription("Bonus d'intelligence")
                          .setRequired(false)
                )
                .addIntegerOption(option =>
                    option.setName('dexterite')
                          .setDescription('Bonus de dextérité')
                          .setRequired(false)
                )
                .addIntegerOption(option =>
                    option.setName('vitalite')
                          .setDescription('Bonus de vitalité')
                          .setRequired(false)
                )
                .addIntegerOption(option =>
                    option.setName('charisme')
                          .setDescription('Bonus de charisme')
                          .setRequired(false)
                )
                .addIntegerOption(option =>
                    option.setName('chance')
                          .setDescription('Bonus de chance')
                          .setRequired(false)
                )
                .addIntegerOption(option =>
                    option.setName('pointsadistribuer')
                          .setDescription('Points disponibles à distribuer')
                          .setRequired(false)
                ),
            async execute(interaction) {
                
                const name = interaction.options.getString('name');
                const description = interaction.options.getString('description');
                const niveau = interaction.options.getInteger('niveau') || 1;
                const bonusForce = interaction.options.getInteger('force') || 0;
                const bonusAgilite = interaction.options.getInteger('agilite') || 0;
                const bonusVitesse = interaction.options.getInteger('vitesse') || 0;
                const bonusIntelligence = interaction.options.getInteger('intelligence') || 0;
                const bonusDexterite = interaction.options.getInteger('dexterite') || 0;
                const bonusVitalite = interaction.options.getInteger('vitalite') || 0;
                const bonusCharisme = interaction.options.getInteger('charisme') || 0;
                const bonusChance = interaction.options.getInteger('chance') || 0;
                const pointsADistribuer = interaction.options.getInteger('pointsadistribuer') || 0;

                try {
                    
                    const newClasse = new Classe({
                        name,
                        description,
                        niveau,
                        bonusStats: {
                            force: bonusForce,
                            agilite: bonusAgilite,
                            vitesse: bonusVitesse,
                            intelligence: bonusIntelligence,
                            dexterite: bonusDexterite,
                            vitalite: bonusVitalite,
                            charisme: bonusCharisme,
                            chance: bonusChance
                        },
                        pointsADistribuer: pointsADistribuer
                    });

                    await newClasse.save();

                    
                    const embed = new EmbedBuilder()
                        .setTitle('Classe créée !')
                        .setDescription(`La classe **${name}** a été ajoutée avec succès.`)
                        .addFields(
                            { name: 'Description', value: description },
                            { name: 'Niveau', value: niveau.toString(), inline: true },
                            { name: 'Force', value: bonusForce.toString(), inline: true },
                            { name: 'Agilité', value: bonusAgilite.toString(), inline: true },
                            { name: 'Vitesse', value: bonusVitesse.toString(), inline: true },
                            { name: 'Intelligence', value: bonusIntelligence.toString(), inline: true },
                            { name: 'Dextérité', value: bonusDexterite.toString(), inline: true },
                            { name: 'Vitalité', value: bonusVitalite.toString(), inline: true },
                            { name: 'Charisme', value: bonusCharisme.toString(), inline: true },
                            { name: 'Chance', value: bonusChance.toString(), inline: true },
                            { name: 'Points à distribuer', value: pointsADistribuer.toString(), inline: true }
                        )
                        .setColor(0x00AE86)
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed] });
                } catch (error) {
                    console.error(error);
                    await interaction.reply({ content: "Une erreur est survenue lors de la création de la classe.", ephemeral: true });
                }
            }
        },
{
  data: new SlashCommandBuilder()
  .setName('attribuer_classe')
  .setDescription("Attribue une classe, réinitialise les stats et applique les bonus")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addUserOption(option =>
    option.setName('joueur')
      .setDescription("Le joueur à qui attribuer la classe")
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('classe')
      .setDescription("Le nom de la classe à attribuer")
      .setRequired(true)
  ),

async execute(interaction) {
  const targetUser = interaction.options.getUser('joueur');
  const className = interaction.options.getString('classe');

  try {
    const foundClasse = await Classe.findOne({ name: className });
    if (!foundClasse) {
      return interaction.reply({
        content: "La classe spécifiée n'existe pas.",
        ephemeral: true
      });
    }

    let playerStats = await Stats.findOne({ userId: targetUser.id });

    const statKeys = ["force", "agilite", "vitesse", "intelligence", "dexterite", "vitalite", "charisme", "chance"];

    if (!playerStats) {
      const emptyStats = {};
      statKeys.forEach(key => emptyStats[key] = 0);

      playerStats = new Stats({
        userId: targetUser.id,
        statsBase: emptyStats,
        pointsADistribuer: 0
      });
    }

    
    let refundedPoints = 0;
    statKeys.forEach(key => {
      const current = playerStats.statsBase[key] || 0;
      refundedPoints += Math.max(0, current);
    });

    
    const newStatsBase = {};
    statKeys.forEach(key => {
      newStatsBase[key] = foundClasse.bonusStats[key] || 0;
    });

    playerStats.statsBase = newStatsBase;

    
    playerStats.pointsADistribuer += refundedPoints + (foundClasse.pointsADistribuer || 0);

    playerStats.classe = foundClasse._id;

    await playerStats.save();

    await UserClasse.findOneAndUpdate(
      { userId: targetUser.id },
      {
        userId: targetUser.id,
        classeId: foundClasse._id,
        classeNom: foundClasse.name
      },
      { upsert: true, new: true }
    );

    const embed = new EmbedBuilder()
      .setTitle("Classe attribuée et statistiques mises à jour")
      .setDescription(`La classe **${foundClasse.name}** a été attribuée à **${targetUser.username}**.`)
      .addFields(
        { name: 'Points à distribuer', value: playerStats.pointsADistribuer.toString(), inline: true },
        ...statKeys.map(key => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value: playerStats.statsBase[key].toString(),
          inline: true
        }))
      )
      .setColor(0x00AE86)
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.error("Erreur lors de l'attribution de la classe :", error);
    return interaction.reply({
      content: "❌ Une erreur est survenue lors de l'attribution de la classe.",
      ephemeral: true
    });
  }
}
},

{
  data: new SlashCommandBuilder()
        .setName('retirer_classe')
        
        .setDescription("Retire la classe et enlève ses bonus des stats")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
          option.setName('joueur')
                .setDescription("Utilisateur ciblé")
                .setRequired(true)
        ),
      
      async execute(interaction) {
        const targetUser = interaction.options.getUser('joueur');

        try {
          
          const playerStats = await Stats.findOne({ userId: targetUser.id });
          if (!playerStats) {
            return interaction.reply({ content: "❌ Document de statistiques introuvable pour cet utilisateur.", ephemeral: true });
          }

          
          if (!playerStats.classe) {
            return interaction.reply({ content: "❌ Cet utilisateur n'a aucune classe assignée.", ephemeral: true });
          }

          
          const assignedClasse = await Classe.findById(playerStats.classe);
          if (!assignedClasse) {
            return interaction.reply({ content: "❌ La classe assignée n'existe plus.", ephemeral: true });
          }

          
          const statKeys = ["force", "agilite", "vitesse", "intelligence", "dexterite", "vitalite", "charisme", "chance"];
          const newStatsBase = {};

          
          for (const key of statKeys) {
            const bonus = assignedClasse.bonusStats[key] || 0;
            
            const currentValue = playerStats.statsBase[key] || 10;
            let newValue = currentValue - bonus;
            
            if (newValue < 10) newValue = 10;
            newStatsBase[key] = newValue;
          }

          
          playerStats.statsBase = newStatsBase;
          playerStats.classe = undefined;

          await playerStats.save();

          
          const embed = new EmbedBuilder()
            .setTitle("Classe retirée")
            .setDescription(`La classe assignée à **${targetUser.username}** a été retirée.\nLes bonus de classe ont été enlevés.`)
            .setColor(0xFF4500)
            .setTimestamp();

          
          for (const key of statKeys) {
            embed.addFields({ name: key.charAt(0).toUpperCase() + key.slice(1), value: newStatsBase[key].toString(), inline: true });
          }

          return interaction.reply({ embeds: [embed] });
        } catch (error) {
          console.error("Erreur lors du retrait de la classe :", error);
          return interaction.reply({ content: "❌ Une erreur est survenue lors du retrait de la classe.", ephemeral: true });
        }
      }
    }
    ]
}
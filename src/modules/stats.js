const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord-api-types/v10');
const mongoose = require('mongoose');
const Stats = require('../database/models/statsModel');
const Equipement = require('../database/models/equipementModel');
const Item = require('../database/models/itemModel');

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
        let userStats = await Stats.findOne({ userId });
        if (!userStats) {
            userStats = new Stats({ userId });
            await userStats.save();
            return interaction.reply({ content: "✅ Tes statistiques ont été créées avec succès ! Utilise à nouveau `/stats` pour les voir." });
        }

        let userEquipement = await Equipement.findOne({ userId }).populate(
            'equipement.casque equipement.cuirasse equipement.gantelet equipement.greve equipement.solerets equipement.epaulettes equipement.cape equipement.manchettes equipement.anneaux equipement.pendentifs equipement.armeD equipement.armeG'
        );

        // Modification ici : on continue même si aucun équipement n'est trouvé
        if (!userEquipement) {
            console.log("ℹ️ Aucun équipement trouvé, affichage des stats de base.");
            userEquipement = { equipement: {} };
        } else {
            console.log("Équipement de l'utilisateur récupéré:", userEquipement);
        }

        const statsEmojis = {
            force: "💪",
            agilite: "🏃",
            vitesse: "⚡",
            intelligence: "🧠",
            dexterite: "🎯",
            vitalite: "❤️",
            charisme: "🗣️",
            chance: "🍀"
        };

        let statsFinales = { ...userStats.statsBase };

        console.log("Stats de base utilisateur:", userStats.statsBase);
        console.log("Ajout des bonus/malus de l'équipement...");

        for (const slot in userEquipement.equipement) {
            const item = userEquipement.equipement[slot];
            if (item && mongoose.Types.ObjectId.isValid(item)) {
                const itemData = await Item.findById(item);
                if (itemData && itemData.stats) {
                    console.log(`🔍 Traitement de l'item dans le slot ${slot}:`, itemData.name);
                    for (const stat in itemData.stats) {
                        if (statsFinales.hasOwnProperty(stat)) {
                            const bonus = itemData.stats[stat]?.bonus || 0;
                            const malus = itemData.stats[stat]?.malus || 0;
                            console.log(`Bonus/Malus pour la stat "${stat}": Bonus = ${bonus}, Malus = ${malus}`);
                            statsFinales[stat] += bonus;
                            statsFinales[stat] -= malus;
                            console.log(`Stat calculée: ${stat}, Valeur finale: ${statsFinales[stat]}`);
                        }
                    }
                }
            }
        }

        console.log("Stats finales après calcul des bonus/malus:", statsFinales);

        const statsFields = Object.entries(statsFinales).map(([stat, value]) => ({
            name: `${statsEmojis[stat] || "📊"} ${stat.charAt(0).toUpperCase() + stat.slice(1)}`,
            value: `**${value}**`,
            inline: true
        }));

        statsFields.push({
            name: "🎯 Points à distribuer",
            value: `**${userStats.pointsADistribuer}**`,
            inline: true
        });

        const equipementFields = [];
        for (const [slot, item] of Object.entries(userEquipement.equipement)) {
            if (item && mongoose.Types.ObjectId.isValid(item)) {
                const itemData = await Item.findById(item);
                if (itemData) {
                    equipementFields.push({
                        name: `🛡️ ${slot.charAt(0).toUpperCase() + slot.slice(1)}`,
                        value: `**${itemData.name}**`,
                        inline: true
                    });
                }
            }
        }

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`📊 Statistiques de ${interaction.user.username}`)
            .addFields(statsFields)
            .setFooter({ text: "Système de statistiques du bot" })
            .setTimestamp();

        if (equipementFields.length > 0) {
            embed.addFields({ name: "🎽 Équipement actuel", value: "Voici ce que tu portes :" });
            embed.addFields(equipementFields);
        } else {
            embed.addFields({ name: "🎽 Équipement actuel", value: "Aucun équipement équipé" });
        }

        return interaction.reply({ embeds: [embed] });

    } catch (error) {
        console.error("Erreur lors de l'affichage des statistiques:", error);
        return interaction.reply({ content: "❌ Une erreur est survenue lors de l'affichage des stats." });
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
        const emojis = {
            force: '💪',
            agilite: '🏃',
            vitesse: '⚡',
            intelligence: '🧠',
            dexterite: '🎯',
            vitalite: '❤️',
            charisme: '🗣️',
            chance: '🍀'
        };
        const points = interaction.options.getInteger('points');

        try {
            let userStats = await Stats.findOne({ userId });
            if (!userStats) {
                const emojis = {
                force: '💪',
                agilite: '🏃',
                vitesse: '⚡',
                intelligence: '🧠',
                dexterite: '🎯',
                vitalite: '❤️',
                charisme: '🗣️',
                chance: '🍀'
            };

            const { EmbedBuilder } = require('discord.js');

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('📊 Points Distribués')
                .setDescription(`${emojis[stat]} **${points}** points ont été ajoutés à **${stat.charAt(0).toUpperCase() + stat.slice(1)}** !`)
                .setFooter({ text: 'Système de statistiques du bot' })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
            }

            if (userStats.pointsADistribuer < points) {
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            userStats.statsBase[stat] += points;
            userStats.pointsADistribuer -= points;
            await userStats.save();

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('📊 Points Distribués')
                .setDescription(`${emojis[stat]} **${points}** points ont été ajoutés à **${stat.charAt(0).toUpperCase() + stat.slice(1)}** !`)
                .setFooter({ text: 'Système de statistiques du bot' })
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });

        } catch (error) {
            console.error("Erreur lors de la distribution des points:", error);
            return interaction.reply({ content: "❌ Une erreur est survenue lors de la distribution des points." });
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
            let userStats = await Stats.findOne({ userId });
            if (!userStats) {
                return interaction.reply({ content: "❌ Aucune statistique trouvée à réinitialiser." });
            }

            // Initialiser le compteur total de points
            let totalPoints = 0;

            // Récupérer les points de chaque statistique avant de les remettre à zéro
            if (userStats.statsBase && typeof userStats.statsBase === 'object') {
                for (const stat in userStats.statsBase) {
                    if (userStats.statsBase.hasOwnProperty(stat)) {
                        totalPoints += userStats.statsBase[stat];
                        userStats.statsBase[stat] = 0; // Remettre à zéro
                    }
                }
            }

            // Ajouter les points récupérés à ceux déjà disponibles
            userStats.pointsADistribuer = (userStats.pointsADistribuer || 0) + totalPoints;

            // Sauvegarder les modifications
            await userStats.save();

            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('🔄 Réinitialisation des Statistiques')
                .setDescription('✅ Tes statistiques ont été réinitialisées avec succès !\nTous tes points ont été récupérés et peuvent être redistribués.')
                .setFooter({ text: 'Système de statistiques du bot' })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Erreur lors de la réinitialisation des statistiques:", error);
            return interaction.reply({ content: "❌ Une erreur est survenue lors de la réinitialisation des statistiques." });
        }
    }
},

{
    data: new SlashCommandBuilder()
        .setName('ajouter_stats')
        .setDescription("Ajouter des points de statistiques à un utilisateur (Administrateurs seulement) 📊")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Seulement pour les admins
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
            let userStats = await Stats.findOne({ userId: targetUser.id });

            if (!userStats) {
                return interaction.reply({ content: "❌ Utilisateur introuvable dans la base de données.", ephemeral: true });
            }

            // Ajouter les points à la statistique choisie
            userStats.statsBase[stat] += points;
            await userStats.save();

            const emojis = {
                force: '💪',
                agilite: '🏃',
                vitesse: '⚡',
                intelligence: '🧠',
                dexterite: '🎯',
                vitalite: '❤️',
                charisme: '🗣️',
                chance: '🍀'
            };

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('📊 Points Ajoutés')
                .setDescription(`✅ ${emojis[stat]} **${points}** points ont été ajoutés à **${stat.charAt(0).toUpperCase() + stat.slice(1)}** de ${targetUser.username} !`)
                .setFooter({ text: 'Système de statistiques du bot' })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Erreur lors de l'ajout des points de statistiques:", error);
            return interaction.reply({ content: "❌ Une erreur est survenue lors de l'ajout des points.", ephemeral: true });
        }
    }
},

{
    data: new SlashCommandBuilder()
        .setName('retirer_stats')
        .setDescription("Retirer des points de statistiques à un utilisateur (Administrateurs seulement) 📉")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Seulement pour les admins
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
            let userStats = await Stats.findOne({ userId: targetUser.id });

            if (!userStats) {
                return interaction.reply({ content: "❌ Utilisateur introuvable dans la base de données.", ephemeral: true });
            }

            // Vérifie si l'utilisateur a suffisamment de points dans cette stat
            if (userStats.statsBase[stat] < points) {
                return interaction.reply({ content: `❌ ${targetUser.username} n'a pas assez de points en **${stat}** pour effectuer cette opération.`, ephemeral: true });
            }

            // Retire les points à la statistique choisie
            userStats.statsBase[stat] -= points;
            await userStats.save();

            const emojis = {
                force: '💪',
                agilite: '🏃',
                vitesse: '⚡',
                intelligence: '🧠',
                dexterite: '🎯',
                vitalite: '❤️',
                charisme: '🗣️',
                chance: '🍀'
            };

            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('📉 Points Retirés')
                .setDescription(`❌ ${emojis[stat]} **${points}** points ont été retirés à **${stat.charAt(0).toUpperCase() + stat.slice(1)}** de ${targetUser.username} !`)
                .setFooter({ text: 'Système de statistiques du bot' })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Erreur lors du retrait des points de statistiques:", error);
            return interaction.reply({ content: "❌ Une erreur est survenue lors du retrait des points.", ephemeral: true });
        }
    }
}

  ]
}
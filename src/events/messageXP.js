const { Events, EmbedBuilder } = require('discord.js');
const Niveau = require('../database/models/niveauModel');
const Stats = require('../database/models/statsModel');

// IDs des catégories autorisées
const allowedCategories = [
    '1280212736269221948'
];

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        // On ignore les messages des bots ou ceux hors des catégories autorisées
        if (message.author.bot || 
            !message.channel.parent || 
            !allowedCategories.includes(message.channel.parentId)
        ) return;

        const userId = message.author.id;
        const messageLength = message.content.length;

        try {
            // On récupère le niveau de l'utilisateur ou on en crée un s'il n'existe pas
            let niveau = await Niveau.findOne({ userId });

            if (!niveau) {
                niveau = new Niveau({ userId });
                await niveau.save();
            }

            // On ajoute l'expérience en fonction de la longueur du message
            niveau.experience += messageLength;

            // On vérifie si l'utilisateur a atteint le niveau supérieur
            if (niveau.experience >= niveau.experienceRequise) {
                niveau.niveau++;
                niveau.experience -= niveau.experienceRequise;
                niveau.experienceRequise *= 2;

                // On ajoute 5 points à distribuer au moment du level up
                let userStats = await Stats.findOne({ userId });
                if (!userStats) {
                    userStats = new Stats({ userId, statsBase: { force: 0, agilite: 0, vitesse: 0, intelligence: 0, dexterite: 0, vitalite: 0, charisme: 0, chance: 0 }, pointsADistribuer: 0 });
                    await userStats.save();
                }
                userStats.pointsADistribuer += 5;
                await userStats.save();

                // On cherche le salon où envoyer le message
                const levelUpChannelId = process.env.LEVEL_UP_CHANNEL_ID;
                let levelUpChannel;

                if (levelUpChannelId) {
                    levelUpChannel = message.guild ? message.guild.channels.cache.get(levelUpChannelId) : null;
                    if (!levelUpChannel) {
                        console.warn(`⚠️ Le salon avec l'ID ${levelUpChannelId} n'a pas été trouvé. Le message sera envoyé dans le salon actuel.`);
                        levelUpChannel = message.channel;
                    }
                } else {
                    levelUpChannel = message.channel;
                }

                // === EMBED DE MONTÉE DE NIVEAU ===
                const levelUpEmbed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setTitle('🎉 **Niveau Supérieur !**')
                    .setDescription(`🆙 Félicitations <@${userId}> ! Tu viens de passer au niveau **${niveau.niveau}** ! 🎁 Tu gagnes **5** points à distribuer !`)
                    .addFields(
                        { name: '🔥 Continue comme ça !', value: 'Ta progression est impressionnante !' }
                    )
                    .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                    .setTimestamp()
                    .setFooter({ text: 'Système de Niveau', iconURL: message.guild ? message.guild.iconURL() : '' });

                // On envoie l'embed dans le salon approprié
                levelUpChannel.send({ embeds: [levelUpEmbed] });
            }

            await niveau.save();
        } catch (err) {
            console.error("Erreur lors de la mise à jour de l'XP :", err);
        }
    }
};
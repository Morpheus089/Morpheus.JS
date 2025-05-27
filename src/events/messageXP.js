const { Events, EmbedBuilder } = require('discord.js');
const Niveau = require('../../database/models/niveauModel');
const Stats = require('../../database/models/statsModel');

const allowedCategoryNames = [
    '🌲 𝐂anopée – Les hauteurs célestes',
    '🌳 𝐋e Cœur de l’Arbre – La cité vivante',
    '🌿 𝐋e Tronc – Les profondeurs mystiques',
    '🌱 𝐋es Racines – Les tunnels oubliés',
    '🌿 𝐋a Clairière Sacrée – Hors du Grand Arbre',

    '🌌 𝐋a Haute Sphère – Les Domaines Divins',
    '🏙 𝐀valone – La Capitale Céleste',
    '🏘 𝐋es Quartiers Élémentaires – Vie et Culture',
    '⏳ 𝐋e Quartier Mystique – Science et Exploration',
    '🏗 𝐋es Cités Flottantes – Les Villes Secondaires',
    '🌑 𝐋es Domaines Oubliés – Lieux Perdus dans l’Ombre',

    '⛏ 𝐊azad’Mar – La Capitale du Roc',
    '⚒ 𝐃urak’Thorn – La Cité des Forges',
    '🏰 𝐁aldur’Dran – La Forteresse des Hautes Cimes',
    '💎 𝐓horin’Dor – La Ville des Joyaux',

    '🌋 𝐂haîne des Monts Brisés',
    '🌊 𝐋a Rivière de Mithril',
    '🌲 𝐅orêt des Racines-Profondes',

    '👑 𝐕aldrith — Les Plaines Royales',
    '🌲 𝐒ylvaren — La Frontière Verte',
    '🌊 𝐀erinthys — Les Îles d\'Écume',
    '🕯 𝐊erynthal — Le Voile Gris',

    '🕷 𝐍yrth Kal — Le Cœur d\'Ébène',
    '🦂 𝐔l\'Kalth — Les Fosses de Carcère',
    '🐍 𝐕ael\'Sirith — Les Jardins Obscurs',
    '⚙ 𝐓hrek\'Zhun — Le Creuset Silencieux',
    '🦎 𝐄zzh\'Ryn — Les Marais du Serment Trahi',
    '🩸 𝐕el’Drakhaal — Le Chant des Lamentations',
    '🪞 𝐃rel’Nashaar — Le Miroir Tordu',
    '🦴 𝐊ael’Morr — Les Landes Osseuses',
    '🐜 𝐍zz’Khaal — Le Fief des Vermines',
    '🔮 𝐘r’Kaenhal — Les Rêves Fêlés',
    '🛕 𝐇ael’Zyn — Les Cloîtres de l’Inquisition',

    '📚 𝐄nclave du Firmament',
    '🌲𝐕allée des Rêves Éveillés',
    '🌠 𝐌ontagnes d\'Étoilebrume',
    '🍃 𝐅orêt de Voileargent',
    '🌊 𝐑ivages d\'Opaline',
    '🌩 𝐋andes des Songes Perdus',
    '🌌 𝐏laines d’Auragivre',
    '🌵 𝐃ésert d\'Éclipsia',
    '🍂 𝐁ois des Murmures Ambrés',

    '🏭 Drakhenor - Capitale Mécanique',
    '🌋 Volcans d’Aetherflam',
    '⚙ Vallée des Échos Métalliques',
    '🏜 Désert d’Obsidiane',
    '❄ Toundra de Ferbrume',
    '🕳 Abysses de Noiracier',
    '🌊 Rivages d\'Éthervapeur',
    '🍁 Forêt d’Automnétoile',
    '⚡ Plateaux d\'Oragivre'

];

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (
            message.author.bot ||
            !message.channel.parent ||
            !allowedCategoryNames.includes(message.channel.parent.name)
        ) return;

        const userId = message.author.id;
        const messageLength = message.content.length;

        try {
            let niveau = await Niveau.findOne({ userId });

            if (!niveau) {
                niveau = new Niveau({ userId });
                await niveau.save();
            }

            niveau.experience += messageLength;

            if (niveau.experience >= niveau.experienceRequise) {
                niveau.niveau++;
                niveau.experience -= niveau.experienceRequise;
                niveau.experienceRequise *= 2;

                let userStats = await Stats.findOne({ userId });
                if (!userStats) {
                    userStats = new Stats({
                        userId,
                        statsBase: {
                            force: 0,
                            agilite: 0,
                            vitesse: 0,
                            intelligence: 0,
                            dexterite: 0,
                            vitalite: 0,
                            charisme: 0,
                            chance: 0
                        },
                        pointsADistribuer: 0
                    });
                    await userStats.save();
                }

                userStats.pointsADistribuer += 5;
                await userStats.save();

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

                const levelUpEmbed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setTitle('🎉 **Niveau Supérieur !**')
                    .setDescription(`🆙 Félicitations <@${userId}> ! Tu viens de passer au niveau **${niveau.niveau}** ! 🎁 Tu gagnes **5** points à distribuer !`)
                    .addFields({
                        name: '🔥 Continue comme ça !',
                        value: 'Ta progression est impressionnante !'
                    })
                    .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                    .setTimestamp()
                    .setFooter({
                        text: 'Système de Niveau',
                        iconURL: message.guild ? message.guild.iconURL() : ''
                    });

                levelUpChannel.send({ embeds: [levelUpEmbed] });
            }

            await niveau.save();
        } catch (err) {
            console.error("Erreur lors de la mise à jour de l'XP :", err);
        }
    }
};
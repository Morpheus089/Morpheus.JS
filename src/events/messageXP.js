const { Events, EmbedBuilder } = require('discord.js');
const Niveau = require('../database/models/niveauModel');
const Stats = require('../database/models/statsModel');

// IDs des catégories autorisées
const allowedCategories = [
    '1351994238099001515',
    '1351995226784530543',
    '1351996228963139678',
    '1351996950458798230',
    '1351997385831874591',
    '1353046714541412452',
    '1353050449497821265',
    '1353054559462883370',
    '1353059371168563200',
    '1353060316631797882',
    '1353061202502221895',
    '1353080321955856454',
    '1353081309630693527',
    '1353081911882285147',
    '1353082691729489951',
    '1353083545987321926',
    '1353083997294563359',
    '1353084323825455254',
    '1353313840737030154',
    '1353314063622471701',
    '1353314312940290078',
    '1353314543505248276',
    '1355835488908349531',
    '1355835670672834621',
    '1355835934255611925',
    '1355836000907034774',
    '1355836070394331297',
    '1355849103837364234',
    '1355849169369043044',
    '1355849226944516208',
    '1355849283156316170',
    '1355849339544670228',
    '1355849443781509261',
    '1358739961515474974',
    '1358740122308317294',
    '1358740386436350122',
    '1358740546570682458',
    '1358740715529572352',
    '1358740715529572352',
    '1358740859377422529',
    '1358741176642961538',
    '1358741291982258187',
    '1362093095478493334',
    '1362094039289168143',
    '1362094608431058984',
    '1362095116524847335',
    '1362095538538811412',
    '1362095930068959232',
    '1362096321695191090',
    '1362096830506340563',
    '1362096897971458208'
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
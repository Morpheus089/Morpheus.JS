const { Events } = require('discord.js');
const Niveau = require('../database/models/niveauModel');


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
    name: Events.MessageReactionAdd,
    async execute(reaction, user) {
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Erreur lors de la récupération du message:', error);
                return;
            }
        }

        const parent = reaction.message.channel.parent;
        if (user.bot || !parent || !allowedCategoryNames.includes(parent.name)) return;

        const userId = reaction.message.author?.id;
        if (!userId) return;

        try {
            let niveau = await Niveau.findOne({ userId });

            if (!niveau) {
                niveau = new Niveau({ userId });
                await niveau.save();
            }

            niveau.experience += 10;

            if (niveau.experience >= niveau.experienceRequise) {
                niveau.niveau++;
                niveau.experience -= niveau.experienceRequise;
                niveau.experienceRequise *= 2;
            }

            await niveau.save();
        } catch (err) {
            console.error("Erreur lors de l'ajout d'XP via réaction :", err);
        }
    }
};
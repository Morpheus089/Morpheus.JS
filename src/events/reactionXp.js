const { Events } = require('discord.js');

const Niveau = require('../database/models/niveauModel');

// IDs des catégories autorisées
const allowedCategories = [
    '1280212736269221948'
];


module.exports = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user) {
        // Assure le cache du message
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Erreur lors de la récupération du message:', error);
                return;
            }
        }

        // Vérifie si c'est dans la bonne catégorie
        if (user.bot || 
            !reaction.message.channel.parent || 
            !allowedCategories.includes(reaction.message.channel.parentId)
        ) return;

        const userId = reaction.message.author.id;

        try {
            // On récupère le niveau de l'auteur du message ou on en crée un s'il n'existe pas
            let niveau = await Niveau.findOne({ userId });

            if (!niveau) {
                niveau = new Niveau({ userId });
                await niveau.save();
            }

            // On ajoute 10 XP pour la réaction
            niveau.experience += 10;

            // On vérifie si l'utilisateur a atteint le niveau supérieur
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
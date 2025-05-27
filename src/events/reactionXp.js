const { Events } = require('discord.js');

const Niveau = require('../database/models/niveauModel');


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

        
        if (user.bot || 
            !reaction.message.channel.parent || 
            !allowedCategories.includes(reaction.message.channel.parentId)
        ) return;

        const userId = reaction.message.author.id;

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
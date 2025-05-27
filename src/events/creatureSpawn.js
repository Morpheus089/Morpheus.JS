const { EmbedBuilder } = require('discord.js');
const Creature = require('../database/models/creatureModel');


const allowedChannels = [
    '1345828925682745436'
];

module.exports = {
    name: 'ready', 
    async execute(client) {
        console.log('[Event] Spawning des créatures activé !');

        
        const intervalle = 2 * 60 * 1000;

        async function spawnCreature() {
            try {
                
                const channelId = allowedChannels[Math.floor(Math.random() * allowedChannels.length)];
                const channel = await client.channels.fetch(channelId).catch(() => null);

                if (!channel || channel.type !== 0) {
                    console.warn(`[⚠️] Impossible d'envoyer une créature dans ${channelId}`);
                    return;
                }

                
                const creature = await Creature.aggregate([{ $sample: { size: 1 } }]);
                if (!creature || creature.length === 0) {
                    console.warn('[⚠️] Aucune créature trouvée dans la base de données.');
                    return;
                }

                const creatureData = creature[0];

                
                const embed = new EmbedBuilder()
                    .setTitle('⚔️ Une créature sauvage apparaît !')
                    .setDescription(`Une créature, **${creatureData.nom}**, est apparue ! Préparez-vous à l'affronter !`)
                    .addFields(
                        { name: '🔥 Rareté', value: creatureData.rarete || 'Inconnue', inline: true },
                        { name: '⚡ Niveau', value: creatureData.niveau?.toString() || '???', inline: true },
                        { name: '💪 Force', value: creatureData.stats?.force?.toString() || '???', inline: true },
                        { name: '❤️ Vitalité', value: creatureData.stats?.vitalite?.toString() || '???', inline: true },
                        { name: '⚡ Vitesse', value: creatureData.stats?.vitesse?.toString() || '???', inline: true }
                    )
                    .setColor(0x00FF00)
                    .setTimestamp();

                
                await channel.send({ embeds: [embed] });
                console.log(`[✔️] Créature "${creatureData.nom}" apparue dans ${channel.name}`);
            } catch (error) {
                console.error('[❌] Erreur lors du spawn de la créature :', error);
            }
        }

        
        setInterval(spawnCreature, intervalle);
    }
};
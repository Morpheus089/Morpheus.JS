const { EmbedBuilder } = require('discord.js');
const Creature = require('../database/models/creatureModel');

// IDs des salons autorisés où les créatures peuvent apparaître
const allowedChannels = [
    '1345828925682745436' // Remplace avec les vrais IDs de tes salons
];

module.exports = {
    name: 'ready', // L'événement déclenché quand le bot est prêt
    async execute(client) {
        console.log('[Event] Spawning des créatures activé !');

        // Intervalle pour faire apparaître une créature toutes les 2 minutes
        const intervalle = 2 * 60 * 1000; // 2 minutes

        async function spawnCreature() {
            try {
                // Sélectionner un salon au hasard
                const channelId = allowedChannels[Math.floor(Math.random() * allowedChannels.length)];
                const channel = await client.channels.fetch(channelId).catch(() => null);

                if (!channel || channel.type !== 0) {
                    console.warn(`[⚠️] Impossible d'envoyer une créature dans ${channelId}`);
                    return;
                }

                // Récupérer une créature au hasard
                const creature = await Creature.aggregate([{ $sample: { size: 1 } }]);
                if (!creature || creature.length === 0) {
                    console.warn('[⚠️] Aucune créature trouvée dans la base de données.');
                    return;
                }

                const creatureData = creature[0];

                // Création de l'embed
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
                    .setColor(0x00FF00) // Vert
                    .setTimestamp();

                // Envoi du message
                await channel.send({ embeds: [embed] });
                console.log(`[✔️] Créature "${creatureData.nom}" apparue dans ${channel.name}`);
            } catch (error) {
                console.error('[❌] Erreur lors du spawn de la créature :', error);
            }
        }

        // Lancer le spawn toutes les 2 minutes
        setInterval(spawnCreature, intervalle);
    }
};
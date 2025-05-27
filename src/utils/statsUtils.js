const Stats = require('../database/models/statsModel');
const { STAT_EMOJIS } = require('./constants');

async function getOrCreateUserStats(userId) {
  let stats = await Stats.findOne({ userId });
  if (!stats) {
    stats = new Stats({
      userId,
      force: 10,
      agilite: 10,
      vitesse: 10,
      intelligence: 10,
      dexterite: 10,
      vitalite: 10,
      charisme: 10,
      chance: 10,
      equipement: {}
    });
    await stats.save();
  }
  return stats;
}

function getFormattedStatFields(stats) {
  return Object.keys(STAT_EMOJIS).map(stat => ({
    name: `${STAT_EMOJIS[stat]} ${stat.charAt(0).toUpperCase() + stat.slice(1)}`,
    value: `${stats[stat] || 0}`,
    inline: true
  }));
}

function calculateTotalStatsWithEquipement(baseStats, equipement) {
  const total = { ...baseStats };

  for (const slot in equipement) {
    const item = equipement[slot];
    if (item && item.stats) {
      for (const stat in item.stats) {
        const bonus = item.stats[stat].bonus || 0;
        const malus = item.stats[stat].malus || 0;
        total[stat] = (total[stat] || 0) + bonus - malus;
      }
    }
  }

  return total;
}

module.exports = {
  getOrCreateUserStats,
  getFormattedStatFields,
  calculateTotalStatsWithEquipement
};
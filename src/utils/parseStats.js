function parseStats(statsString) {
    if (!statsString) return {};
    const statsArray = statsString.split(',').map(stat => {
      const [statName, value] = stat.split(':');
      return { statName: statName.trim(), value: parseInt(value.trim(), 10) };
    });
    return statsArray.reduce((acc, { statName, value }) => {
      acc[statName] = value;
      return acc;
    }, {});
  }
  
  module.exports = parseStats;  
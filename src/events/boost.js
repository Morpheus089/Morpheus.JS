const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.GuildMemberUpdate,
  /**
   * @param {import('discord.js').GuildMember} oldMember 
   * @param {import('discord.js').GuildMember} newMember 
   */
  async execute(oldMember, newMember) {

    if (oldMember.premiumSince || !newMember.premiumSince) return;

    
    const channel = newMember.guild.channels.cache.get('1351487918124040253');
    if (!channel) return; 

    
    const boostEmbed = new EmbedBuilder()
      .setColor('#ffd700')
      .setTitle(`🚀 𓆩༺ 𝐍𝐨𝐮𝐯𝐞𝐚𝐮 𝐁𝐨𝐨𝐬𝐭𝐞𝐮𝐫 ! ༻𓆪`)
      .setDescription(`
╔════════ ༺💎༻ ═════════╗  
✨ ${newMember} vient de **booster** **Echoes Of Avalone** !  
╚════════ ༺💎༻ ═════════╝

🛡️ Merci pour ton soutien indéfectible, vaillant aventurier !  
🚀 Grâce à toi, notre royaume s'élève vers de nouveaux sommets…

> _“Dans chaque goutte d’écho, ton nom résonne à jamais…”_

──────────────────────────

🌟 **Total de boosts :** ${newMember.guild.premiumSubscriptionCount}
      `)
      .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
      
      .setImage('https://zupimages.net/up/25/16/acz2.gif') 
      .setFooter({
        text: 'Echoes Of Avalone • Merci pour le boost !',
        iconURL: newMember.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    
    await channel.send({ embeds: [boostEmbed] });
  }
};
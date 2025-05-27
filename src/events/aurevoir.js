const { WebhookClient, EmbedBuilder } = require('discord.js');


const webhook = new WebhookClient({ url: 'https://discord.com/api/webhooks/1362108727087595831/cE4pSVweSlBwwaRrZA3f_3qOgSPWbGuO-4MA9-ZLuvlHkbc8E2hdRWOvRdyFZCJvueR4' });

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {

    const farewellEmbed = new EmbedBuilder()
      .setColor('#2c2f33')
      .setTitle(`🌫️ 𓆩༺ 𝑫𝒆𝒔𝒕𝒊𝒏 𝑹𝒐𝒎𝒑𝒖 𝒅𝒂𝒏𝒔 𝑬𝒄𝒉𝒐𝒆𝒔 𝑶𝒇 𝑨𝒗𝒂𝒍𝒐𝒏𝒆 ༻𓆪 🌫️`)
      .setDescription(`
╔═══════════ ༺༻ ═══════════╗  
       🕯️ **𝙐𝙣𝙚 𝙖̂𝙢𝙚 𝙖 𝙦𝙞𝙩𝙩𝙚́ 𝙡𝙚 𝙧𝙚𝙘𝙪𝙚𝙞𝙡...**  
       *𝑳𝒆 𝒔𝒊𝒍𝒆𝒏𝒄𝒆 𝒔'𝒆𝒔𝒕 𝒂𝒃𝒂𝒕𝒕𝒖.*
╚═══════════ ༺༻ ═══════════╝  

🕯️ **${member.user.username}** a quitté **Echoes Of Avalone**...

> *Son nom s’efface doucement des grimoires...*
> *Son histoire s’arrête, mais l’écho demeure.*

═══════════ ⋆✧⋆ ═══════════

📜 *Aucun chant ne racontera sa fin...*
🌒 *Mais les étoiles se souviendront peut-être...*

═══════════ ⋆✧⋆ ═══════════

> ✧ Que son voyage le guide vers d’autres horizons ✧  
> *Et que sa plume retrouve un autre monde à écrire...*
`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setImage('https://zupimages.net/up/25/16/oe9p.jpg')
      .setFooter({ text: 'Echoes Of Avalone • Le Destin poursuit sa course', iconURL: member.client.user.displayAvatarURL() });

    await webhook.send({
      username: '👁 Le Grand Oracle',
      avatarURL: 'https://zupimages.net/up/25/16/56ra.jpg',
      content: `🌫️ Un voyageur a quitté le Royaume...`,
      embeds: [farewellEmbed],
    });
  }
};
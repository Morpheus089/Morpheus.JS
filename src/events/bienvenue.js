const { WebhookClient, EmbedBuilder } = require('discord.js');


const webhook = new WebhookClient({ url: 'https://discord.com/api/webhooks/1362096316326481991/ZHLxpKLZNQrLzdzHQUs_uus5iJTs94u0T3WuTZMM_J6an0TZx0WTwwakd96ywypFkzwF' });

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {

    const welcomeEmbed = new EmbedBuilder()
      .setColor('#5b84ea')
      .setTitle(`🌌 𓆩༺ 𝑩𝒊𝒆𝒏𝒗𝒆𝒏𝒖𝒆 𝒅𝒂𝒏𝒔 𝑬𝒄𝒉𝒐𝒆𝒔 𝑶𝒇 𝑨𝒗𝒂𝒍𝒐𝒏𝒆 ༻𓆪 🌌`)
      .setDescription(`
╔═══════════ ༺༻ ═══════════╗  
       🐉 **𝙀𝙘𝙝𝙤𝙚𝙨 𝙊𝙛 𝘼𝙫𝙖𝙡𝙤𝙣𝙚** 🏰  
      *𝐿𝑒 𝑑𝑒𝑠𝑡𝑖𝑛 𝑡'𝑎 𝑔𝑢𝑖𝑑𝑒́ 𝑗𝑢𝑠𝑞𝑢'𝑖𝑐𝑖...*
╚═══════════ ༺༻ ═══════════╝  

📜 **Prologue :**
> *Les vents anciens murmurent ton nom, ${member.user.username}...*  
> *Les étoiles se sont alignées... et les portes d'Avalone s’ouvrent enfin pour toi.*

═══════════ ⋆★⋆ ═══════════

🎮 **Un MMORPG RP écrit, jamais vu :**
┌────────────────────────────┐  
│ ⚔️  𝙁𝙖𝙘𝙩𝙞𝙤𝙣𝙨 légendaires à rejoindre  
│ 🧙‍♂️  𝙌𝙪𝙚̂𝙩𝙚𝙨 scénarisées dynamiques  
│ 📖  𝘿𝙚𝙨𝙩𝙞𝙣𝙚́𝙚 façonnée par ton écriture  
│ 🤖  𝘽𝙤𝙩 maître du jeu, bientôt 100% autonome  
└────────────────────────────┘  

🌟 **Commencer ton épopée :**
> 📌 Rejoins ta faction : <#1351527182266142770>  
> 📌 Crée ton personnage : <#1362102016670957789> 
> 📌 Lis les lois d’Avalone : <#1351486034818371624>   

🕯️ *Souviens-toi, aventurier...*  
> *𝑻𝒐𝒖𝒕 𝒄𝒆 𝒒𝒖𝒆 𝒕𝒖 𝒆́𝒄𝒓𝒊𝒓𝒂𝒔 𝒅𝒆𝒗𝒊𝒆𝒏𝒅𝒓𝒂 𝒓𝒆́𝒆𝒍...*

🎇 **𝑩𝒊𝒆𝒏𝒗𝒆𝒏𝒖𝒆 𝒅𝒂𝒏𝒔 𝒍𝒂 𝑳𝒆́𝒈𝒆𝒏𝒅𝒆, ${member.user.username} !**
`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setImage('https://zupimages.net/up/25/16/x1oa.jpg')
      .setFooter({ text: 'Echoes Of Avalone • MMORPG RP Automatisé', iconURL: member.client.user.displayAvatarURL() });

    await webhook.send({
      username: '👁 Le Grand Oracle',
      avatarURL: 'https://zupimages.net/up/25/16/56ra.jpg',
      content: `🔮 Une âme vient de franchir les Portes du Monde...`,
      embeds: [welcomeEmbed],
    });
  }
};
const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    Events,
    WebhookClient,
    ComponentType,
  } = require('discord.js');
  
  module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
      const client = member.client;
  
      // ─── 🎭 Check si c’est un BOT ───────────────────────────────
      if (member.user.bot) {
        await member.roles.add(['1351322344643235850', '1351321201401659392']);
        return;
      }
  
      // ─── 🕊️ Rôles de pré-accueil ───────────────────────────────
      await member.roles.add(['1351328204056563824', '1351328026398429317']);
  
      // ─── 🔮 Embed RP RedProtecte ───────────────────────────────
      const protecteEmbed = new EmbedBuilder()
        .setColor('#d41e6c')
        .setTitle('🕯️ 𓆩༺ 𝑹𝒊𝒕𝒖𝒆𝒍 𝒅’𝑨𝒄𝒄𝒆̀𝒔 : 𝑹𝒆𝒅 𝑷𝒓𝒐𝒕𝒆𝒄𝒕𝒆 ༻𓆪')
        .setDescription(`
  ╔═════ ༺⚔️༻ ═════╗  
     *𝙏𝙤𝙪𝙩 𝙘𝙖𝙣𝙙𝙞𝙙𝙖𝙩 𝙖̀ 𝙡'𝙖𝙫𝙚𝙣𝙩𝙪𝙧𝙚*  
     *𝙙𝙤𝙞𝙩 𝙨𝙪𝙗𝙞𝙧 𝙡𝙚 𝙧𝙞𝙩𝙪𝙚𝙡 𝙨𝙖𝙘𝙧𝙚́...*
  ╚═════ ༺⚔️༻ ═════╝
  
  > *"Le Royaume d’Avalone ne s’ouvre qu’aux âmes prêtes à le défendre..."*
  
  🔒 **Clique sur le sceau mystique ci-dessous pour prouver ta légitimité.**
  
  > *Une fois le rituel accompli, ton destin sera scellé.*  
        `)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setImage('https://zupimages.net/up/25/16/x1oa.jpg')
        .setFooter({
          text: 'Echoes Of Avalone • Rituel de Sécurité',
          iconURL: client.user.displayAvatarURL(),
        });
  
      // ─── 🪬 Bouton d’acceptation ───────────────────────────────
      const validateButton = new ButtonBuilder()
        .setCustomId(`red_protecte_validate_${member.id}`)
        .setLabel('🔓 Briser le Sceau')
        .setStyle(ButtonStyle.Primary);
  
      const row = new ActionRowBuilder().addComponents(validateButton);
  
      try {
        const dm = await member.send({
          content: `🔮 **Bienvenue, ${member.user.username}...**`,
          embeds: [protecteEmbed],
          components: [row],
        });
  
        // ─── 🎯 Attente de clic sur le bouton ─────────────────────
        const collector = dm.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: 10 * 60 * 1000, // 10 minutes
        });
  
        collector.on('collect', async (interaction) => {
          if (interaction.customId !== `red_protecte_validate_${member.id}`) return;
  
          await interaction.deferReply({ ephemeral: true });
  
          // Rôles à donner après réussite
          const rolesToAdd = [
            '1351324078031507588',
            '1351323089010688084',
            '1351321904002367568',
            '1351321201401659392',
          ];
          const rolesToRemove = [
            '1351328204056563824',
            '1351328026398429317',
          ];
  
          await member.roles.add(rolesToAdd);
          await member.roles.remove(rolesToRemove);
  
          await interaction.editReply({
            content: `🛡️ **Le Sceau est brisé...**\nBienvenue dans **Echoes Of Avalone**, l'aventure commence !`,
          });
        });
      } catch (err) {
        console.error(`Impossible d’envoyer un MP à ${member.user.tag}`);
      }
    },
  };  
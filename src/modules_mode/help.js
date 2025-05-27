const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commandFolders = {
  'modules': [
    'craft', 'creature', 'economie', 'guilde', 'metier', 'stats', 'xp','classe'
  ],
  'modules_mode': [
    'build', 'moderation', 'save_serveur', 'ticket', 'tupper'
  ]
};

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function generatePages() {
  const pages = [];


  const indexEmbed = new EmbedBuilder()
    .setTitle('📖 Menu d\'aide')
    .setDescription('Utilise les boutons ci-dessous pour naviguer entre les pages.\nChaque page contient les commandes d\'un module spécifique.')
    .setColor(0x3498db)
    .setThumbnail('https://cdn-icons-png.flaticon.com/512/1828/1828778.png')
    .setFooter({ text: 'Bot d\'assistance • Page 1' });

  let pageNumber = 2;
  for (const files of Object.values(commandFolders)) {
    for (const file of files) {
      indexEmbed.addFields({
        name: `📄 Page ${pageNumber}`,
        value: `Module : **${capitalizeFirstLetter(file)}**`,
        inline: true
      });
      pageNumber++;
    }
  }
  pages.push(indexEmbed);


  for (const files of Object.values(commandFolders)) {
    for (const file of files) {
      const filePath = path.join(__dirname, '..', Object.keys(commandFolders).find(key => commandFolders[key].includes(file)), `${file}.js`);
      let commands = 'Impossible de lire ce fichier.';

      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        commands = [...content.matchAll(/data\s*:\s*new\s*SlashCommandBuilder\(\)\s*\.(setName\([^)]*\)[\s\S]*?)(?=\n\s*data|module\.exports|$)/g)]
          .map(match => match[1])
          .map(code => {
            const nameMatch = code.match(/setName\(['"`](.*?)['"`]\)/);
            const descMatch = code.match(/setDescription\(['"`](.*?)['"`]\)/);
            return `🔹 \`/${nameMatch?.[1] ?? 'unknown'}\` : ${descMatch?.[1] ?? 'Aucune description.'}`;
          }).join('\n') || 'Aucune commande trouvée.';
      }

      const cmdEmbed = new EmbedBuilder()
        .setTitle(`📦 Commandes du module : ${capitalizeFirstLetter(file)}`)
        .setDescription(commands)
        .setColor(0x2ecc71)
        .setFooter({ text: `Bot d'assistance • Module ${capitalizeFirstLetter(file)}` });

      pages.push(cmdEmbed);
    }
  }

  return pages;
}

const helpCommand = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Affiche l\'aide des commandes du bot'),

  async execute(interaction) {
    const pages = generatePages();
    let currentPage = 0;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('help_prev').setLabel('⬅️ Précédent').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('help_next').setLabel('Suivant ➡️').setStyle(ButtonStyle.Secondary)
    );

    const msg = await interaction.reply({
      embeds: [pages[currentPage]],
      components: [row],
      ephemeral: true,
      fetchReply: true
    });

    const collector = msg.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', i => {
      if (i.user.id !== interaction.user.id) return i.reply({ content: 'Ce menu ne vous est pas destiné.', ephemeral: true });
      if (!i.customId.startsWith('help_')) return;

      if (i.customId === 'help_next') currentPage = (currentPage + 1) % pages.length;
      if (i.customId === 'help_prev') currentPage = (currentPage - 1 + pages.length) % pages.length;

      const newEmbed = pages[currentPage];
      i.update({ embeds: [newEmbed] });
    });
  }
};

helpCommand.commands = [helpCommand];

module.exports = helpCommand;
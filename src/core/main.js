const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../config/.env') });

const fs = require('fs');
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const mongoose = require('mongoose');

process.on('unhandledRejection', reason => console.error('⚠️ Rejection non gérée :', reason));
process.on('uncaughtException', err => console.error('⚠️ Exception non gérée :', err));

if (!fs.existsSync(path.join(__dirname, '../config/.env'))) {
  console.warn('⚠️ .env introuvable ! Certaines variables peuvent manquer.');
}
if (!process.env.TOKEN) console.warn('⚠️ TOKEN manquant dans .env !');
if (!process.env.MONGO_URI) console.warn('⚠️ URI MongoDB manquant dans .env !');

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
      .then(() => console.log('✅ Connecté à MongoDB'))
      .catch(err => console.error('❌ Erreur MongoDB :', err));
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

client.commands = new Map();

const modules_modPath = path.join(__dirname, '../modules_mode');

const commandesModules = require(path.join(__dirname, '../commande/commande.js'));
const moderation = require(path.join(modules_modPath, 'moderation.js'));
const building = require(path.join(modules_modPath, 'build.js'));
const tupper = require(path.join(modules_modPath, 'tupper.js'));
const ticket = require(path.join(modules_modPath, 'ticket.js'));
const help = require(path.join(modules_modPath, 'help.js'));

const allCommands = [
  ...commandesModules.commands,
  ...moderation.commands,
  ...building.commands,
  ...tupper.commands,
  ...ticket.commands,
  ...help.commands,
];

const commandMap = new Map();
for (const cmd of allCommands) {
  if (cmd?.data && typeof cmd.data.toJSON === 'function') {
    const name = cmd.data.name;
    if (!commandMap.has(name)) {
      commandMap.set(name, cmd);
    } else {
      console.warn(`⚠️ Commande en double ignorée : ${name}`);
    }
  }
}

const validCommands = Array.from(commandMap.values());
const commands = validCommands.map(cmd => cmd.data.toJSON());
client.commands = new Map(validCommands.map(cmd => [cmd.data.name, cmd]));

client.once('ready', async () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);

  if (!process.env.TOKEN || !process.env.CLIENT_ID) {
    console.warn('⚠️ Enregistrement des commandes ignoré (manque TOKEN/CLIENT_ID)');
    return;
  }

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  const guildIds = process.env.GUILD_IDS?.split(',').map(id => id.trim()) || [];

  try {
    console.log('🔄 Enregistrement des commandes...');
    for (const guildId of guildIds) {
      await rest.put(
          Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
          { body: commands }
      );
      console.log(`✅ Commandes enregistrées pour le serveur ${guildId}`);
    }
  } catch (error) {
    console.error('❌ Erreur enregistrement des commandes :', error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ Erreur commande ${interaction.commandName} :`, error);
    const replyOptions = { content: '❌ Une erreur est survenue.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(replyOptions);
    } else {
      await interaction.reply(replyOptions);
    }
  }
});

const eventsPath = path.join(__dirname, '../events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    try {
      const event = require(filePath);
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
    } catch (err) {
      console.error(`❌ Erreur dans l'événement ${file} :`, err.message);
    }
  }
} else {
  console.warn('⚠️ Aucun dossier "events" trouvé.');
}

if (process.env.TOKEN) {
  client.login(process.env.TOKEN)
      .then(() => console.log('✅ Bot connecté avec succès'))
      .catch(err => console.error('❌ ERREUR connexion Discord :', err.message));
} else {
  console.warn('⚠️ TOKEN manquant, connexion annulée.');
}
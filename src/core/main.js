// === Chargement des variables d'environnement ===
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, REST, Routes, Collection } = require('discord.js');
const mongoose = require('mongoose');

// === Sécurité globale ===
process.on('unhandledRejection', reason => console.error('⚠️ Rejection non gérée :', reason));
process.on('uncaughtException', err => console.error('⚠️ Exception non gérée :', err));

// === Vérification .env ===
if (!fs.existsSync(path.join(__dirname, '../../.env'))) {
  console.warn('⚠️ .env introuvable ! Certaines variables peuvent manquer.');
}
if (!process.env.TOKEN) console.warn('⚠️ TOKEN manquant dans .env !');
if (!process.env.MONGO_URI) console.warn('⚠️ URI MongoDB manquant dans .env !');

// === Connexion MongoDB ===
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connecté à MongoDB'))
    .catch(err => console.error('❌ Erreur MongoDB :', err));
}

// === Configuration du client Discord ===
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

// === Chargement des modules ===
const modulesPath = path.join(__dirname, '../modules');
const utilsPath = path.join(__dirname, '../utils');

const economie = require(path.join(modulesPath, 'economie.js'));
const stats = require(path.join(modulesPath, 'stats.js'));
const niveau = require(path.join(modulesPath, 'xp.js'));
const craft = require(path.join(modulesPath, 'craft.js'));
const metier = require(path.join(modulesPath, 'metier.js'));
const creature = require(path.join(modulesPath, 'creature.js'));

const moderation = require(path.join(utilsPath, 'moderation.js'));
const building = require(path.join(utilsPath, 'build.js'));
const tupper = require(path.join(utilsPath, 'tupper.js'));
const save_serveur = require(path.join(utilsPath, 'save_serveur.js'));
const ticket = require(path.join(utilsPath, 'ticket.js'));
const help = require(path.join(utilsPath, 'help.js'));

// === Fusion des commandes ===
const allCommands = [
  ...economie.commands,
  ...stats.commands,
  ...niveau.commands,
  ...craft.commands,
  ...metier.commands,
  ...creature.commands,
  ...moderation.commands,
  ...building.commands,
  ...tupper.commands,
  ...save_serveur.commands,
  ...ticket.commands,
  ...help.commands,
];

// === Filtrage et enregistrement des commandes ===
const validCommands = allCommands.filter(cmd => cmd?.data && typeof cmd.data.toJSON === 'function');
const commands = validCommands.map(cmd => cmd.data.toJSON());
client.commands = new Map(validCommands.map(cmd => [cmd.data.name, cmd]));

// === Enregistrement des commandes slash ===
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

// === Gestion des interactions ===
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

// === Chargement des événements ===
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

// === Connexion au bot ===
if (process.env.TOKEN) {
  client.login(process.env.TOKEN)
    .then(() => console.log('✅ Bot connecté avec succès'))
    .catch(err => console.error('❌ ERREUR connexion Discord :', err.message));
} else {
  console.warn('⚠️ TOKEN manquant, connexion annulée.');
}
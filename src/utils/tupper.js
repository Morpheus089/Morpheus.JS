const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
const Tupper = require('../database/models/tupperModel');

module.exports = {
    commands: [
        {
            data: new SlashCommandBuilder()
                .setName('tupper_enregistre')
                .setDescription('Enregistre un tupper avec un avatar.')
                .addStringOption(option => 
                    option.setName('nom')
                        .setDescription('Nom du tupper')
                        .setRequired(true))
                .addStringOption(option => 
                    option.setName('url_avatar')
                        .setDescription("URL de l'avatar du tupper")
                        .setRequired(true)),
            
            async execute(interaction) {
                const name = interaction.options.getString('nom');
                const avatar = interaction.options.getString('url_avatar');
                const userId = interaction.user.id;

                // Vérifie si le tupper existe déjà pour l'utilisateur
                const existingTupper = await Tupper.findOne({ userId, name });
                if (existingTupper) {
                    return interaction.reply({ content: '❌ Ce tupper existe déjà.', ephemeral: true });
                }

                // Enregistre le tupper
                const newTupper = new Tupper({ userId, name, avatar });
                await newTupper.save();

                await interaction.reply({ content: `✅ Tupper **${name}** enregistré avec succès !`, ephemeral: true });
            }
        },
        {
            data: new SlashCommandBuilder()
                .setName('tupper')
                .setDescription('Envoie un message en tant que tupper.')
                .addStringOption(option => 
                    option.setName('nom')
                        .setDescription('Nom du tupper enregistré')
                        .setRequired(true))
                .addStringOption(option => 
                    option.setName('message')
                        .setDescription('Message à envoyer avec le tupper')
                        .setRequired(true)),
            
            async execute(interaction) {
                const name = interaction.options.getString('nom');
                const message = interaction.options.getString('message');
                const userId = interaction.user.id;

                // Recherche du tupper
                const tupper = await Tupper.findOne({ userId, name });
                if (!tupper) {
                    return interaction.reply({ content: '❌ Aucun tupper trouvé avec ce nom.', ephemeral: true });
                }

                // Supprime l'interaction pour ne pas afficher la commande
                await interaction.deferReply({ ephemeral: true });
                await interaction.deleteReply();

                // Création d'un webhook temporaire pour envoyer le message
                const webhook = await interaction.channel.createWebhook({
                    name: tupper.name,
                    avatar: tupper.avatar,
                });

                await webhook.send({
                    content: message,
                    username: tupper.name,
                    avatarURL: tupper.avatar
                });

                // Suppression du webhook après utilisation
                setTimeout(() => webhook.delete(), 5000);
            }
        },
        {
            data: new SlashCommandBuilder()
                .setName('tupper_liste')
                .setDescription('Affiche la liste de tous les tuppers enregistrés.'),
            
            async execute(interaction) {
                const userId = interaction.user.id;
                const tuppers = await Tupper.find({ userId });

                if (tuppers.length === 0) {
                    return interaction.reply({ content: '❌ Vous n\'avez enregistré aucun tupper.', ephemeral: true });
                }

                const embed = new EmbedBuilder()
                    .setTitle('📜 Liste de vos Tuppers')
                    .setColor('Blue')
                    .setFooter({ text: `Demandé par ${interaction.user.tag}` });

                tuppers.forEach(tupper => {
                    embed.addFields({
                        name: `🧸 ${tupper.name}`,
                        value: `[Avatar](${tupper.avatar})`,
                        inline: true
                    });
                });

                await interaction.reply({ embeds: [embed] });
            }
        }
    ]
};
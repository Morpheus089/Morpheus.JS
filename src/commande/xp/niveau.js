const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Niveau = require('../../database/models/niveauModel');

const generateProgressBar = require('../../utils/progressBar');
const calculerXpPourNiveau = require('../../utils/xpCalcul');
const { ajouterNiveaux, retirerNiveaux } = require('../../utils/xpHandler');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');

module.exports = {
    commands: [

        {
                    data: new SlashCommandBuilder()
                .setName('niveau')
                .setDescription('Affiche ton niveau et ton expérience actuelle'),
        
            async execute(interaction) {
                const userId = interaction.user.id;
        
                try {
                    let niveau = await Niveau.findOne({ userId });
        
                    if (!niveau) {
                        niveau = new Niveau({ userId });
                        await niveau.save();
                        return interaction.reply({ 
                            embeds: [createSuccessEmbed('📈 Compte Niveau créé', '✅ Ton système de niveaux vient d\'être initialisé ! Utilise `/niveau` à nouveau.')], 
                            ephemeral: true 
                        });
                    }
        
                    const pourcentageXP = Math.floor((niveau.experience / niveau.experienceRequise) * 100);
                    const progressionBar = generateProgressBar(pourcentageXP);
        
                    const embed = new EmbedBuilder()
                        .setColor('#32CD32')
                        .setTitle(`📊 Niveau de ${interaction.user.username}`)
                        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                        .addFields(
                            { name: 'Niveau', value: `🎯 **${niveau.niveau}**`, inline: true },
                            { name: 'XP', value: `🟢 **${niveau.experience}** / **${niveau.experienceRequise}** XP`, inline: true },
                            { name: 'Progression', value: `${progressionBar} ${pourcentageXP}%` }
                        )
                        .setFooter({ text: 'Continue de participer pour monter en niveau !' })
                        .setTimestamp();
        
                    await interaction.reply({ embeds: [embed] });
        
                } catch (err) {
                    console.error('Erreur lors de l\'affichage du niveau :', err);
                    await interaction.reply({ embeds: [createErrorEmbed('Erreur', '❌ Une erreur est survenue lors de l\'affichage de ton niveau.')], ephemeral: true });
                }
            }
        }

    ]
}
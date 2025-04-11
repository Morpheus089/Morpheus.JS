const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const Niveau = require('../database/models/niveauModel');

// === FONCTION DE GÉNÉRATION DE LA BARRE D'XP ===
function generateProgressBar(pourcentage) {
    const totalBar = 20;  // Longueur totale de la barre
    const filledBar = Math.round((pourcentage / 100) * totalBar);

    const progressBar = '🟩'.repeat(filledBar) + '⬜'.repeat(totalBar - filledBar);
    return progressBar;
}

// === FONCTION DE CALCUL DE L'XP NÉCESSAIRE POUR UN NIVEAU ===
function calculerXpPourNiveau(niveau) {
    return 2000 * Math.pow(2, niveau - 1); // Exemple : Formule exponentielle
}

module.exports = {
    commands: [
        {
            data: new SlashCommandBuilder()
                .setName('niveau')
                .setDescription('Affiche ton niveau et ton expérience actuelle'),

            async execute(interaction) {
                const userId = interaction.user.id;

                try {
                    // On récupère le niveau de l'utilisateur ou on en crée un s'il n'existe pas
                    let niveau = await Niveau.findOne({ userId });

                    if (!niveau) {
                        niveau = new Niveau({ userId });
                        await niveau.save();
                    }

                    // Calcul du pourcentage d'XP pour la barre
                    const pourcentageXP = Math.floor((niveau.experience / niveau.experienceRequise) * 100);
                    const progressionBar = generateProgressBar(pourcentageXP);

                    // === EMBED D'AFFICHAGE DU NIVEAU ===
                    const niveauEmbed = new EmbedBuilder()
                        .setColor('#32CD32')  // Vert pour l'XP
                        .setTitle(`📊 Niveau de ${interaction.user.username}`)
                        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                        .addFields(
                            { name: 'Niveau', value: `🎯 **${niveau.niveau}**`, inline: true },
                            { name: 'XP', value: `🟢 **${niveau.experience}** / **${niveau.experienceRequise}** XP`, inline: true },
                            { name: 'Progression', value: `${progressionBar} ${pourcentageXP}%` }
                        )
                        .setFooter({ text: 'Continue de participer pour monter en niveau !' })
                        .setTimestamp();

                    await interaction.reply({ embeds: [niveauEmbed] });
                } catch (err) {
                    console.error('Erreur lors de l\'affichage du niveau :', err);
                    await interaction.reply({ content: '❌ Une erreur est survenue lors de l\'affichage de ton niveau.', ephemeral: true });
                }
            }
        },

        {
            data: new SlashCommandBuilder()
                .setName('ajouter_niveau')
                .setDescription("Ajouter des niveaux à un utilisateur")
                .addUserOption(option =>
                    option.setName('utilisateur')
                        .setDescription("L'utilisateur à qui ajouter des niveaux")
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName('niveau')
                        .setDescription("Le niveau à atteindre")
                        .setRequired(true)
                )
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
            async execute(interaction) {
                const utilisateur = interaction.options.getUser('utilisateur');
                const niveauCible = interaction.options.getInteger('niveau');
                const userId = utilisateur.id;
        
                try {
                    let niveau = await Niveau.findOne({ userId });
                    if (!niveau) {
                        niveau = new Niveau({ userId, niveau: 0, experience: 0, experienceRequise: calculerXpPourNiveau(1) });
                        await niveau.save();
                    }
        
                    if (niveauCible <= niveau.niveau) {
                        return interaction.reply({ content: '❌ Le niveau cible doit être supérieur à son niveau actuel.', ephemeral: true });
                    }
        
                    const xpNecessaire = calculerXpPourNiveau(niveauCible);
                    const xpActuel = calculerXpPourNiveau(niveau.niveau);
                    niveau.experience += xpNecessaire - xpActuel;
                    niveau.niveau = niveauCible;
                    niveau.updatedAt = Date.now();
                    niveau.experience = xpNecessaire;
                    niveau.experienceRequise = calculerXpPourNiveau(niveauCible + 1);
        
                    await niveau.save();
        
                    const embed = new EmbedBuilder()
                        .setColor('#FFD700')
                        .setTitle('🎉 Niveau mis à jour !')
                        .setDescription(`${utilisateur.username} a été promu au niveau ${niveauCible} avec ${xpNecessaire} XP !`)
                        .setTimestamp();
        
                    await interaction.reply({ embeds: [embed] });
                } catch (err) {
                    console.error('Erreur lors de l\'ajout de niveau :', err);
                    await interaction.reply({ content: '❌ Une erreur est survenue lors de l\'ajout du niveau.', ephemeral: true });
                }
            }
        },
        
        {
            data: new SlashCommandBuilder()
                .setName('retirer_niveaux')
                .setDescription("Retire des niveaux à un utilisateur (en calculant l'XP correspondante)")
                .addUserOption(option =>
                    option.setName('utilisateur')
                        .setDescription("L'utilisateur à qui retirer des niveaux")
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName('niveaux')
                        .setDescription("Nombre de niveaux à retirer")
                        .setRequired(true)
                )
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
            async execute(interaction) {
                const utilisateur = interaction.options.getUser('utilisateur');
                const niveauxARetirer = interaction.options.getInteger('niveaux');
                const userId = utilisateur.id;
        
                try {
                    let niveau = await Niveau.findOne({ userId });
                    if (!niveau) {
                        return interaction.reply({ content: '❌ Cet utilisateur n\'a pas encore de niveau enregistré.', ephemeral: true });
                    }
        
                    // Vérification que le retrait ne dépasse pas le niveau actuel
                    if (niveauxARetirer >= niveau.niveau) {
                        return interaction.reply({ content: '❌ Le nombre de niveaux à retirer doit être inférieur au niveau actuel de l\'utilisateur.', ephemeral: true });
                    }
        
                    // Calcul du nouveau niveau après retrait
                    const nouveauNiveau = niveau.niveau - niveauxARetirer;
                    const xpNouveauNiveau = calculerXpPourNiveau(nouveauNiveau);
                    
                    // Mise à jour du niveau et de l'XP
                    niveau.niveau = nouveauNiveau;
                    niveau.experience = xpNouveauNiveau;
                    niveau.experienceRequise = calculerXpPourNiveau(nouveauNiveau + 1);
        
                    await niveau.save();
        
                    const embed = new EmbedBuilder()
                        .setColor('#FF4500')
                        .setTitle('📉 Niveaux retirés !')
                        .setDescription(`${niveauxARetirer} niveaux ont été retirés à ${utilisateur.username}.`)
                        .addFields(
                            { name: 'Niveau actuel', value: `${niveau.niveau}`, inline: true },
                            { name: 'XP actuelle', value: `${niveau.experience} / ${niveau.experienceRequise} XP`, inline: true }
                        )
                        .setTimestamp();
        
                    await interaction.reply({ embeds: [embed] });
                } catch (err) {
                    console.error('Erreur lors du retrait de niveaux :', err);
                    await interaction.reply({ content: '❌ Une erreur est survenue lors du retrait de niveaux.', ephemeral: true });
                }
            }
        }                       

    ]
}
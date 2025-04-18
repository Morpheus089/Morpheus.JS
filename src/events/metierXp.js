const { Events, EmbedBuilder } = require('discord.js');
const MetierUtilisateur = require('../database/models/metierUtilisateurModel');

// Définir manuellement les commandes associées à chaque métier
const commandXpMapping = {
    "67c35755fa2680612de53baa": ["solde"] //fermier
};

const XP_CHANNEL_ID = "1351493384988262503"; // Remplace par l'ID du salon où envoyer les notifications

async function ajouterXpMetier(userId, metierId, xpGagne, guild) {
    let utilisateur = await MetierUtilisateur.findOne({ userId });
    if (!utilisateur) return;

    let metierData = utilisateur.metiers.find(m => m.metierId.equals(metierId));
    if (!metierData) return;

    // Ajouter l'XP
    metierData.xp += xpGagne;
    let xpMax = 100 * metierData.niveau;

    // Monter de niveau si l'XP dépasse le max
    let niveauUp = false;
    while (metierData.xp >= xpMax) {
        metierData.xp -= xpMax;
        metierData.niveau++;
        xpMax = 100 * metierData.niveau;
        niveauUp = true;
    }

    await utilisateur.save();

    // Vérifier si le salon XP existe et envoyer la notification sous forme d'embed
    const xpChannel = guild.channels.cache.get(XP_CHANNEL_ID);
    if (xpChannel) {
        const embed = new EmbedBuilder()
            .setTitle("🎉 Gain d'XP !")
            .setDescription(`<@${userId}> a gagné **${xpGagne} XP** dans son métier !`)
            .addFields(
                { name: "📊 Niveau actuel", value: `**${metierData.niveau}**`, inline: true },
                { name: "🔥 XP Actuel", value: `**${metierData.xp} / ${xpMax}**`, inline: true }
            )
            .setColor(niveauUp ? "Gold" : "Orange")
            .setTimestamp();
        
        if (niveauUp) embed.setFooter({ text: "🆙 Niveau UP ! Félicitations ! 🎊" });
        
        xpChannel.send({ embeds: [embed] });
    } else {
        console.log(`❌ Le salon XP avec l'ID ${XP_CHANNEL_ID} est introuvable.`);
    }
}

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isCommand()) return;
        
        const userId = interaction.user.id;
        const commandName = interaction.commandName;
        const guild = interaction.guild;

        console.log(`🔍 Commande exécutée : ${commandName}`);
        
        // Récupérer les métiers de l'utilisateur
        let userMetier = await MetierUtilisateur.findOne({ userId });
        if (!userMetier) {
            console.log(`❌ L'utilisateur ${userId} n'a pas de métier enregistré.`);
            return;
        }

        console.log(`📜 Métiers de ${userId} :`, userMetier.metiers);
        
        for (let metier of userMetier.metiers) {
            const metierId = metier.metierId.toString();
            
            // Vérifier si la commande est associée à ce métier
            if (commandXpMapping[metierId] && commandXpMapping[metierId].includes(commandName)) {
                console.log(`✅ L'utilisateur ${userId} gagne de l'XP pour la commande ${commandName}`);
                
                // Ajouter l'XP sans modifier la réponse de la commande
                await ajouterXpMetier(userId, metier.metierId, 10, guild);
                return;
            }
        }
    }
};
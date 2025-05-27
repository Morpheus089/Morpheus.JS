const { Events, EmbedBuilder } = require('discord.js');
const MetierUtilisateur = require('../../database/models/metierUtilisateurModel');

const commandXpMapping = {
    "67c35755fa2680612de53baa": ["solde"] // fermier
};

const XP_CHANNEL_NAME = "《🤖》𝐑ank-metier";

async function ajouterXpMetier(userId, metierId, xpGagne, guild) {
    let utilisateur = await MetierUtilisateur.findOne({ userId });
    if (!utilisateur) return;

    let metierData = utilisateur.metiers.find(m => m.metierId.equals(metierId));
    if (!metierData) return;

    metierData.xp += xpGagne;
    let xpMax = 100 * metierData.niveau;

    let niveauUp = false;
    while (metierData.xp >= xpMax) {
        metierData.xp -= xpMax;
        metierData.niveau++;
        xpMax = 100 * metierData.niveau;
        niveauUp = true;
    }

    await utilisateur.save();

    const xpChannel = guild.channels.cache.find(ch => ch.name === XP_CHANNEL_NAME && ch.isTextBased());
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
        console.log(`❌ Le salon XP nommé "${XP_CHANNEL_NAME}" est introuvable.`);
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

        let userMetier = await MetierUtilisateur.findOne({ userId });
        if (!userMetier) {
            console.log(`❌ L'utilisateur ${userId} n'a pas de métier enregistré.`);
            return;
        }

        console.log(`📜 Métiers de ${userId} :`, userMetier.metiers);

        for (let metier of userMetier.metiers) {
            const metierId = metier.metierId.toString();

            if (commandXpMapping[metierId] && commandXpMapping[metierId].includes(commandName)) {
                console.log(`✅ L'utilisateur ${userId} gagne de l'XP pour la commande ${commandName}`);
                await ajouterXpMetier(userId, metier.metierId, 10, guild);
                return;
            }
        }
    }
};
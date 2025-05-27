const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Stats = require('../../database/models/statsModel');
const Economie = require('../../database/models/economieModel');
const Item = require('../../database/models/itemModel'); 
const Marketplace = require('../../database/models/marketplaceModel'); 
const Inventaire = require('../../database/models/inventaireModel') 
const Equipement = require('../../database/models/equipementModel'); 

const { createSuccessEmbed, createErrorEmbed, createBalanceEmbed } = require('../../utils/embeds');
const { modifierSolde, deviseLabels } = require('../../utils/devise');
const { isAdmin } = require('../../utils/permissions');
const parseStats = require('../../utils/parseStats');

module.exports = {
    commands: [

        {
            data: new SlashCommandBuilder()
                .setName('desequiper')
                .setDescription("Retire un objet équipé et le remet dans l'inventaire. 🛡️")
                .addStringOption(option =>
                    option.setName('objet')
                        .setDescription("Nom de l'objet à déséquiper 📦")
                        .setRequired(true)),
        
            async execute(interaction) {
                const userId = interaction.user.id;
                const itemName = interaction.options.getString('objet');
        
                try {
                    console.log(`🔎 Recherche de l'objet : ${itemName}`);
        
                    
                    const item = await Item.findOne({ name: { $regex: new RegExp(`^${itemName}$`, 'i') } });
        
                    if (!item) {
                        console.log(`❌ Objet non trouvé : ${itemName}`);
                        return interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(0xFF0000)
                                    .setTitle("❌ Objet introuvable !")
                                    .setDescription(`L'objet **${itemName}** n'existe pas.`)
                                    .setTimestamp()
                                    .setFooter({ text: "Système d'équipement du bot" })
                            ],
                            ephemeral: true
                        });
                    }
        
                    console.log(`✅ Objet trouvé : ${item.name} (ID: ${item._id})`);
        
                    
                    const userEquipement = await Equipement.findOne({ userId });
        
                    if (!userEquipement) {
                        console.log(`❌ L'utilisateur n'a aucun équipement.`);
                        return interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(0xFF0000)
                                    .setTitle("❌ Impossible de déséquiper !")
                                    .setDescription("Tu n'as aucun équipement actif.")
                                    .setTimestamp()
                                    .setFooter({ text: "Système d'équipement du bot" })
                            ],
                            ephemeral: true
                        });
                    }
        
        
                    const itemIdString = item._id.toString();
                    const slot = Object.keys(userEquipement.equipement).find(
                        key => userEquipement.equipement[key] && userEquipement.equipement[key].toString() === itemIdString
                    );
        
                    if (!slot) {
                        console.log(`❌ L'objet n'est pas équipé.`);
                        return interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(0xFF0000)
                                    .setTitle("❌ Impossible de déséquiper !")
                                    .setDescription(`Tu n'as pas **${item.name}** équipé.`)
                                    .setTimestamp()
                                    .setFooter({ text: "Système d'équipement du bot" })
                            ],
                            ephemeral: true
                        });
                    }
        
                    console.log(`✅ Objet trouvé dans l'emplacement : ${slot}`);
        
        
                    await Equipement.updateOne(
                        { userId },
                        { $unset: { [`equipement.${slot}`]: 1 } }
                    );
        
                    console.log(`✅ Objet retiré de l'équipement !`);
        
        
                    let userInventaire = await Inventaire.findOne({ userId });
        
                    if (!userInventaire) {
                        userInventaire = new Inventaire({ userId, items: [] });
                    }
        
        
                    const existingItem = userInventaire.items.find(i => i.itemId.equals(item._id));
                    if (existingItem) {
                        existingItem.quantity += 1;
                    } else {
                        userInventaire.items.push({ itemId: item._id, quantity: 1 });
                    }
        
                    await userInventaire.save();
        
                    console.log(`✅ Objet déséquipé et ajouté à l'inventaire.`);
        
        
                    const categoryEmojis = {
                        casque: "🪖",
                        cuirasse: "🛡️",
                        gantelet: "🧤",
                        greve: "🦵",
                        solerets: "👢",
                        epaulettes: "🏋️",
                        cape: "🧥",
                        manchettes: "🎽",
                        anneaux: "💍",
                        pendentifs: "📿",
                        "arme D": "🗡️",
                        "arme G": "🛡️"
                    };
        
        
                    const itemEmoji = categoryEmojis[item.categorie] || "📦";
        
        
                    const embed = new EmbedBuilder()
                        .setColor(0xFFA500)
                        .setTitle(`✅ ${interaction.user.username} a déséquipé un objet !`)
                        .setDescription(`L'objet **${itemEmoji} ${item.name}** a été retiré et ajouté à ton inventaire.`)
                        .addFields(
                            { name: "📜 Description", value: item.description, inline: false },
                            { name: "🛡️ Emplacement", value: slot, inline: true },
                            { name: "🔄 Ajouté dans l'inventaire", value: "✅ Oui", inline: true }
                        )
                        .setTimestamp()
                        .setFooter({ text: "Système d'équipement du bot" });
        
                    return interaction.reply({ embeds: [embed] });
        
                } catch (error) {
                    console.error(`❌ Erreur lors du déséquipement :`, error);
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(0xFF0000)
                                .setTitle("❌ Erreur interne")
                                .setDescription("Une erreur est survenue lors du déséquipement.")
                                .setTimestamp()
                                .setFooter({ text: "Système d'équipement du bot" })
                        ],
                        ephemeral: true
                    });
                }
            }
        }

    ]
}
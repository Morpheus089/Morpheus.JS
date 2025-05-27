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
                .setName('infos_item')
                .setDescription("Affiche les informations détaillées d'un item 🔍")
                .addStringOption(option =>
                    option.setName('objet')
                        .setDescription("Nom de l'objet à inspecter 📦")
                        .setRequired(true)),
        
            async execute(interaction) {
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
                                    .setDescription(`L'objet **${itemName}** n'existe pas dans la boutique.`)
                                    .setTimestamp()
                                    .setFooter({ text: "Système économique du bot" })
                            ],
                            ephemeral: true
                        });
                    }
        
                    console.log(`✅ Objet trouvé : ${item.name}`);
        
                    
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
        
                    
                    const rarityColors = {
                        Commun: 0xA0A0A0,       
                        Rare: 0x0084FF,         
                        Épique: 0x800080,       
                        Légendaire: 0xFFD700    
                    };
        
        
                    const currencyEmojis = {
                        ecus: "💰",
                        cristaux: "🔮",
                        points: "⭐"
                    };
        
                    
                    const shopEmojis = {
                        boutique: "🏪",
                        dark_boutique: "🌑",
                        boutique_vip: "💎"
                    };
        
                    
                    const itemEmoji = categoryEmojis[item.categorie] || "📦";
        
                    
                    let statsText = "Aucune statistique.";
                    if (item.stats && Object.keys(item.stats).length > 0) {
                        statsText = Object.entries(item.stats)
                            .map(([stat, values]) => `**${stat}**: +${values.bonus} | -${values.malus}`)
                            .join("\n");
                    }
        
                    
                    const embed = new EmbedBuilder()
                        .setColor(rarityColors[item.rarete] || 0xFFFFFF)
                        .setTitle(`${itemEmoji} **${item.name}**`)
                        .setDescription(`📜 **Description** : ${item.description}`)
                        .addFields(
                            { name: "💎 Rareté", value: item.rarete, inline: true },
                            { name: "💰 Prix", value: `${item.price} ${currencyEmojis[item.devise] || "💵"}`, inline: true },
                            { name: "📦 Stock", value: `${item.stock}`, inline: true },
                            { name: "🏬 Boutique", value: `${shopEmojis[item.boutique] || "🏪"} ${item.boutique}`, inline: true },
                            { name: "🛡️ Catégorie", value: `${itemEmoji} ${item.categorie}`, inline: true },
                            { name: "📊 Statistiques", value: statsText, inline: false }
                        )
                        .setTimestamp()
                        .setFooter({ text: "Système économique du bot" });
        
                    
                    if (item.image) {
                        embed.setImage(item.image);
                    }
        
                    return interaction.reply({ embeds: [embed] });
        
                } catch (error) {
                    console.error(`❌ Erreur lors de l'affichage des informations de l'item :`, error);
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(0xFF0000)
                                .setTitle("❌ Erreur interne")
                                .setDescription("Une erreur est survenue lors de la récupération des informations.")
                                .setTimestamp()
                                .setFooter({ text: "Système économique du bot" })
                        ],
                        ephemeral: true
                    });
                }
            }
        }

    ]
}
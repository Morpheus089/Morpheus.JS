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
                .setName('inventaire')
                .setDescription("Affiche ton inventaire 📦")
                .addUserOption(option =>
                    option.setName('utilisateur')
                        .setDescription("Voir l'inventaire d'un autre utilisateur")
                        .setRequired(false)),
        
            async execute(interaction) {
                const user = interaction.options.getUser('utilisateur') || interaction.user;
                const userId = user.id;
        
                try {
                    
                    let userInventaire = await Inventaire.findOne({ userId }).populate('items.itemId');
        
                    if (!userInventaire || userInventaire.items.length === 0) {
                        return interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(0xFF0000)
                                    .setTitle(`📦 Inventaire de ${user.username}`)
                                    .setDescription("❌ Ton inventaire est vide !")
                                    .setFooter({ text: "Système économique du bot" })
                                    .setTimestamp()
                            ],
                            ephemeral: true
                        });
                    }
        
                    
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
        
                    
                    const currencyEmojis = {
                        ecus: "💰",
                        cristaux: "🔮",
                        points: "⭐"
                    };
        
                    
                    const fields = userInventaire.items.map(i => {
                        const item = i.itemId;
                        const categoryEmoji = categoryEmojis[item.categorie] || "📦";
                        const currencyEmoji = currencyEmojis[item.devise] || "💵";
        
                        return {
                            name: `${categoryEmoji} ${item.name}`,
                            value: `📜 **${item.description}**\n🔢 **Quantité**: ${i.quantity}\n💰 **Valeur**: ${item.price} ${currencyEmoji}`,
                            inline: false
                        };
                    });
        
                    
                    const embeds = [];
                    for (let i = 0; i < fields.length; i += 25) {
                        const embed = new EmbedBuilder()
                            .setColor(0x0099FF)
                            .setTitle(`📦 Inventaire de ${user.username}`)
                            .setDescription("Voici les objets que tu possèdes :")
                            .addFields(fields.slice(i, i + 25))
                            .setFooter({ text: "Système économique du bot" })
                            .setTimestamp();
                        embeds.push(embed);
                    }
        
                    return interaction.reply({ embeds });
        
                } catch (error) {
                    console.error(error);
                    return interaction.reply({
                        content: "❌ Une erreur est survenue lors de la récupération de l'inventaire."});
                }
            }
        }

    ]
}
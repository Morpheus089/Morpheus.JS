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
                .setName('equiper')
                .setDescription("Équipe un objet de ton inventaire 📦")
                .addStringOption(option =>
                    option.setName('objet')
                        .setDescription("Nom de l'objet à équiper")
                        .setRequired(true)),
        
            async execute(interaction) {
                const userId = interaction.user.id;
                const itemName = interaction.options.getString('objet');
        
                try {
                    
                    const item = await Item.findOne({ name: itemName });
                    if (!item) {
                        return interaction.reply({ content: "❌ Cet objet n'existe pas.", ephemeral: true });
                    }
        
                    
                    if (!item.equipable) {
                        return interaction.reply({ content: "❌ Cet objet ne peut pas être équipé.", ephemeral: true });
                    }
        
                    
                    const userInventaire = await Inventaire.findOne({ userId });
                    if (!userInventaire) {
                        return interaction.reply({ content: "❌ Tu ne possèdes pas d'inventaire.", ephemeral: true });
                    }
        
                    
                    const itemIndex = userInventaire.items.findIndex(i => i.itemId.equals(item._id));
                    if (itemIndex === -1 || userInventaire.items[itemIndex].quantity <= 0) {
                        return interaction.reply({ content: "❌ Tu ne possèdes pas cet objet en quantité suffisante.", ephemeral: true });
                    }
        
                    
                    let userEquipement = await Equipement.findOne({ userId });
                    if (!userEquipement) {
                        userEquipement = new Equipement({ userId, equipement: {} });
                    }
        
                    
                    const slot = item.categorie; 
                    const equipementActuel = userEquipement.equipement[slot];
        
                    
                    let userStats = await Stats.findOne({ userId });
                    if (!userStats) {
                        userStats = new Stats({ userId });
                    }
        
                    
                    if (equipementActuel) {
                        const oldItem = await Item.findById(equipementActuel);
                        if (oldItem) {
                            
                            const existingIndex = userInventaire.items.findIndex(i => i.itemId.equals(oldItem._id));
                            if (existingIndex !== -1) {
                                userInventaire.items[existingIndex].quantity += 1; 
                            } else {
                                userInventaire.items.push({ itemId: oldItem._id, quantity: 1 });
                            }
                        }
                    }
        
                    
                    userEquipement.equipement[slot] = item._id;
        
                    
                    userInventaire.items[itemIndex].quantity -= 1;
                    if (userInventaire.items[itemIndex].quantity <= 0) {
                        userInventaire.items.splice(itemIndex, 1); 
                    }
        
                    
                    await userInventaire.save();
                    await userEquipement.save();
        
                    
                    const embed = new EmbedBuilder()
                        .setColor(0x00FF00)
                        .setTitle(`✅ ${interaction.user.username} a équipé ${item.name} !`)
                        .setDescription("L'équipement a été mis à jour avec succès.")
                        .addFields(
                            { name: "📜 Description", value: item.description },
                            { name: "🛡️ Équipé à", value: slot, inline: true },
                            { name: "📈 Bonus", value: Object.entries(item.stats).map(([stat, values]) => `+${values.bonus} ${stat}`).join("\n") || "Aucun", inline: true },
                            { name: "📉 Malus", value: Object.entries(item.stats).map(([stat, values]) => `-${values.malus} ${stat}`).join("\n") || "Aucun", inline: true }
                        )
                        .setTimestamp()
                        .setFooter({ text: "Système d'équipement du bot" });
        
                    return interaction.reply({ embeds: [embed] });
        
                } catch (error) {
                    console.error(error);
                    return interaction.reply({ content: "❌ Une erreur est survenue lors de l'équipement.", ephemeral: true });
                }
            }
        }

    ]
}
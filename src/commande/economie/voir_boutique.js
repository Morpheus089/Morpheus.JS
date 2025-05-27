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
                .setName('voir_boutique')
                .setDescription('Affiche tous les articles d’une boutique spécifique 🛒')
                .addStringOption(option =>
                    option.setName('boutique')
                        .setDescription("Sélectionnez la boutique à afficher 🏬")
                        .setRequired(true)
                        .addChoices(
                            { name: 'Boutique Standard 🏪', value: 'boutique' },
                            { name: 'Dark Boutique 🌑', value: 'dark_boutique' },
                            { name: 'Boutique VIP 💎', value: 'boutique_vip' }
                        )
                ),
        
            async execute(interaction) {
                await interaction.deferReply(); 
        
                try {
                    const boutique = interaction.options.getString('boutique');
        
                    
                    const items = await Item.find({ boutique });
        
                    if (!items || items.length === 0) {
                        return interaction.editReply({ content: '❌ Aucun article disponible dans cette boutique.' });
                    }
        
                    
                    const boutiqueColors = {
                        boutique: 0x0099FF, 
                        dark_boutique: 0x990000, 
                        boutique_vip: 0xFFD700 
                    };
        
                    
                    const embed = new EmbedBuilder()
                        .setColor(boutiqueColors[boutique])
                        .setTitle(`🛒 Articles de la ${boutique === 'dark_boutique' ? 'Dark Boutique 🌑' : boutique === 'boutique_vip' ? 'Boutique VIP 💎' : 'Boutique Standard 🏪'}`)
                        .setDescription("Voici la liste des articles disponibles dans cette boutique :")
                        .setTimestamp()
                        .setFooter({ text: 'Système économique du bot' });
        
                    
                    items.forEach(item => {
                        embed.addFields({
                            name: `**${item.name}** - 💰 ${item.price} ${item.devise}`,
                            value: `📜 ${item.description}\n🛒 **Stock** : ${item.stock} | 🔮 **Rareté** : ${item.rarete}`,
                            inline: false
                        });
                    });
        
                    return interaction.editReply({ embeds: [embed] });
        
                } catch (error) {
                    console.error("Erreur lors de l'exécution de la commande /voir_boutique :", error);
                    return interaction.editReply({ content: '❌ Une erreur est survenue, réessayez plus tard.' });
                }
            }
        }

    ]
}
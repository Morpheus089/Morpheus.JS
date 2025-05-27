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
            .setName('marketplace')
            .setDescription('Affiche les items disponibles sur le marketplace'),
          
          async execute(interaction) {
            try {
              const itemsEnVente = await Marketplace.find().populate('itemId');
          
              if (!itemsEnVente.length) {
                return interaction.reply({
                  embeds: [createErrorEmbed("🛒 Aucun article", "Aucun item n'est disponible sur le marketplace pour le moment.")],
                  ephemeral: true
                });
              }
          
              const embed = createSuccessEmbed(
                '🛒 Marketplace - Articles en vente',
                'Voici les articles actuellement disponibles sur le marketplace :'
              );
          
              itemsEnVente.forEach(vente => {
                embed.addFields({
                  name: `🔹 ${vente.itemId.name}`,
                  value: `📦 Quantité : **${vente.quantity}**\n💰 Prix : **${vente.price} ${vente.devise}**\n🛒 Vendeur : <@${vente.sellerId}>`,
                  inline: false
                });
              });
          
              await interaction.reply({ embeds: [embed] });
          
            } catch (error) {
              console.error("❌ Erreur marketplace :", error);
              await interaction.reply({
                embeds: [createErrorEmbed("❌ Erreur interne", "Une erreur est survenue lors de la récupération du marketplace.")],
                ephemeral: true
              });
            }
          }
          }

    ]
}
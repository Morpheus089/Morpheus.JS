const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Stats = require('../../database/models/statsModel');
const Economie = require('../../database/models/economieModel');
const Item = require('../../database/models/itemModel'); 
const Marketplace = require('../../database/models/marketplaceModel'); 
const Inventaire = require('../../database/models/inventaireModel') 
const Equipement = require('../../database/models/equipementModel');

const embeds = require('../../utils/embeds');
const { modifierSolde, deviseLabels } = require('../../utils/devise');
const { isAdmin } = require('../../utils/permissions');
const parseStats = require('../../utils/parseStats');

module.exports = {
    commands: [

        {
            data: new SlashCommandBuilder()
            .setName('acheter')
            .setDescription('Achète un article dans la boutique 🛍️')
            .addStringOption(option =>
              option.setName('nom').setDescription("Nom de l'article à acheter").setRequired(true))
            .addIntegerOption(option =>
              option.setName('quantite').setDescription("Quantité souhaitée").setRequired(true)),
        
          async execute(interaction) {
            await interaction.deferReply();
        
            const userId = interaction.user.id;
            const username = interaction.user.username;
            const itemName = interaction.options.getString('nom');
            const quantity = interaction.options.getInteger('quantite');
        
            if (quantity <= 0) {
              return interaction.editReply({
                embeds: [createErrorEmbed("❌ Quantité invalide", "La quantité doit être supérieure à zéro.")]
              });
            }
        
        
            const item = await Item.findOne({ name: itemName });
            if (!item) {
              return interaction.editReply({
                embeds: [createErrorEmbed("❌ Article introuvable", "Cet article n’existe pas dans la boutique.")]
              });
            }
        
        
            const userEconomie = await Economie.findOne({ userId });
            const devise = item.devise;
            const deviseNom = deviseLabels[devise] || devise;
            const totalPrix = item.price * quantity;
        
            if (!userEconomie || userEconomie[devise] < totalPrix) {
              return interaction.editReply({
                embeds: [createErrorEmbed("❌ Fonds insuffisants", `Tu n'as pas assez de ${deviseNom} pour acheter cet article.`)]
              });
            }
        
        
            if (item.stock < quantity) {
              return interaction.editReply({
                embeds: [createErrorEmbed("❌ Stock insuffisant", `Stock disponible : ${item.stock}`)]
              });
            }
        
            
            userEconomie[devise] -= totalPrix;
            await userEconomie.save();
        
            
            item.stock -= quantity;
            await item.save();
        
            
            let userInventaire = await Inventaire.findOne({ userId });
            if (!userInventaire) {
              userInventaire = new Inventaire({ userId, items: [] });
            }
        
        
            const existingItem = userInventaire.items.find(i => i.itemId.equals(item._id));
            if (existingItem) {
              existingItem.quantity += quantity;
            } else {
              userInventaire.items.push({ itemId: item._id, quantity });
            }
        
            await userInventaire.save();
        
            
            return interaction.editReply({
              embeds: [
                createSuccessEmbed(
                  '🛍️ Achat réussi !',
                  `Tu as acheté **${quantity}x ${item.name}** pour **${totalPrix} ${deviseNom}**.`
                )
              ]
            });
          }
        }

    ]
}
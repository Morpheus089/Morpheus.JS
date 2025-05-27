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
            .setName('retirer_marketplace')
            .setDescription("Retire un item que vous avez mis en vente sur le marketplace.")
            .addStringOption(option =>
              option.setName('item').setDescription("Nom de l'item à retirer").setRequired(true)
            ),
          
          async execute(interaction) {
            const userId = interaction.user.id;
            const itemName = interaction.options.getString('item');
          
            try {
              const item = await Item.findOne({ name: itemName });
              if (!item) {
                return interaction.reply({
                  embeds: [createErrorEmbed("❌ Introuvable", "Cet item n'existe pas.")],
                  ephemeral: true
                });
              }
          
              const vente = await Marketplace.findOne({ itemId: item._id, sellerId: userId });
              if (!vente) {
                return interaction.reply({
                  embeds: [createErrorEmbed("❌ Pas en vente", "Vous n'avez pas mis cet item en vente.")],
                  ephemeral: true
                });
              }
          
              const economie = await Economie.findOne({ userId });
              if (!economie) {
                return interaction.reply({
                  embeds: [createErrorEmbed("❌ Aucun compte", "Vous n'avez pas de compte économique.")],
                  ephemeral: true
                });
              }
          
              const deviseNom = deviseLabels[vente.devise] || vente.devise;
              const cout = vente.price * 2;
          
              if (economie[vente.devise] < cout) {
                return interaction.reply({
                  embeds: [createErrorEmbed("❌ Fonds insuffisants", `Il vous faut ${cout} ${deviseNom} pour retirer cette annonce.`)],
                  ephemeral: true
                });
              }
          
              economie[vente.devise] -= cout;
              await economie.save();
          
              let inventaire = await Inventaire.findOne({ userId });
              if (!inventaire) {
                inventaire = new Inventaire({ userId, items: [] });
              }
          
              const itemIndex = inventaire.items.findIndex(i => i.itemId.equals(item._id));
              if (itemIndex !== -1) {
                inventaire.items[itemIndex].quantity += vente.quantity;
              } else {
                inventaire.items.push({ itemId: item._id, quantity: vente.quantity });
              }
          
              await inventaire.save();
              await Marketplace.findByIdAndDelete(vente._id);
          
              const embed = createSuccessEmbed(
                "✅ Annonce retirée du Marketplace",
                `Vous avez retiré **${item.name}** du marketplace.\n💸 Coût de l'opération : **${cout} ${deviseNom}**.`
              );
          
              return interaction.reply({ embeds: [embed] });
          
            } catch (error) {
              console.error("❌ Erreur retrait marketplace :", error);
              return interaction.reply({
                embeds: [createErrorEmbed("❌ Erreur interne", "Une erreur est survenue lors du retrait de l'annonce.")],
                ephemeral: true
              });
            }
          }
          }

        ]
    }
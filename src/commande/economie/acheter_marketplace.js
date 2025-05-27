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
            .setName('acheter_marketplace')
            .setDescription("🛒 Achète un objet depuis le Marketplace")
            .addStringOption(option =>
              option.setName('item').setDescription("Nom de l'item à acheter").setRequired(true))
            .addIntegerOption(option =>
              option.setName('quantite').setDescription("Quantité souhaitée").setRequired(true).setMinValue(1)),
          
          async execute(interaction) {
            const userId = interaction.user.id;
            const itemName = interaction.options.getString('item');
            const quantiteAchat = interaction.options.getInteger('quantite');
          
            try {
              const item = await Item.findOne({ name: itemName });
              if (!item) {
                return interaction.reply({
                  embeds: [createErrorEmbed("❌ Introuvable", "Cet item n'existe pas dans la base de données.")],
                  ephemeral: true
                });
              }
          
              const vente = await Marketplace.findOne({ itemId: item._id }).populate('itemId');
              if (!vente) {
                return interaction.reply({
                  embeds: [createErrorEmbed("❌ Non en vente", "Cet item n'est pas en vente sur le Marketplace.")],
                  ephemeral: true
                });
              }
          
              if (vente.quantity < quantiteAchat) {
                return interaction.reply({
                  embeds: [createErrorEmbed("❌ Stock insuffisant", `Seulement ${vente.quantity} disponible.`)],
                  ephemeral: true
                });
              }
          
              const acheteurEconomie = await Economie.findOne({ userId });
              if (!acheteurEconomie) {
                return interaction.reply({
                  embeds: [createErrorEmbed("❌ Compte requis", "Vous n'avez pas de compte économique.")],
                  ephemeral: true
                });
              }
          
              const totalPrix = vente.price * quantiteAchat;
              const deviseNom = deviseLabels[vente.devise] || vente.devise;
          
              if (acheteurEconomie[vente.devise] < totalPrix) {
                return interaction.reply({
                  embeds: [createErrorEmbed("❌ Fonds insuffisants", `Vous n'avez pas assez de ${deviseNom} pour cet achat.`)],
                  ephemeral: true
                });
              }
          
              const vendeurEconomie = await Economie.findOne({ userId: vente.sellerId });
              if (!vendeurEconomie) {
                return interaction.reply({
                  embeds: [createErrorEmbed("❌ Vendeur invalide", "Le vendeur n'a pas de compte économique valide.")],
                  ephemeral: true
                });
              }
          
              
              acheteurEconomie[vente.devise] -= totalPrix;
              vendeurEconomie[vente.devise] += totalPrix;
              await acheteurEconomie.save();
              await vendeurEconomie.save();
          
              
              let acheteurInventaire = await Inventaire.findOne({ userId });
              if (!acheteurInventaire) {
                acheteurInventaire = new Inventaire({ userId, items: [] });
              }
          
              const itemIndex = acheteurInventaire.items.findIndex(i => i.itemId.equals(item._id));
              if (itemIndex !== -1) {
                acheteurInventaire.items[itemIndex].quantity += quantiteAchat;
              } else {
                acheteurInventaire.items.push({ itemId: item._id, quantity: quantiteAchat });
              }
              await acheteurInventaire.save();
          
              
              vente.quantity -= quantiteAchat;
              if (vente.quantity <= 0) {
                await Marketplace.findByIdAndDelete(vente._id);
              } else {
                await vente.save();
              }
          
              const embed = createSuccessEmbed(
                '🛒 Achat effectué !',
                `Vous avez acheté **${quantiteAchat}x ${vente.itemId.name}** sur le Marketplace.`,
                [
                  { name: '💰 Montant payé', value: `${totalPrix} ${deviseNom}`, inline: true },
                  { name: '📦 Nouvel Inventaire', value: `L'item a été ajouté à votre inventaire.`, inline: true }
                ]
              ).setFooter({ text: 'Merci pour votre achat sur le Marketplace !' });
          
              return interaction.reply({ embeds: [embed] });
          
            } catch (error) {
              console.error("❌ Erreur achat marketplace :", error);
              return interaction.reply({
                embeds: [createErrorEmbed("❌ Erreur interne", "Une erreur est survenue lors de l'achat.")],
                ephemeral: true
              });
            }
          }
          }

        ]
    }
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
            .setName('ajouter-au-marketplace')
            .setDescription("Ajoute un item de votre inventaire au marketplace")
            .addStringOption(option =>
              option.setName('item').setDescription("Nom de l'item à vendre").setRequired(true))
            .addIntegerOption(option =>
              option.setName('quantite').setDescription("Quantité à vendre").setRequired(true).setMinValue(1))
            .addIntegerOption(option =>
              option.setName('prix').setDescription("Prix de vente").setRequired(true).setMinValue(1))
            .addStringOption(option =>
              option.setName('devise').setDescription("Devise de la vente").setRequired(true)
                .addChoices(
                  { name: '💰 Écus', value: 'ecus' },
                  { name: '🔮 Cristaux', value: 'cristaux' },
                  { name: '⭐ Points', value: 'points' }
                )),
          
          async execute(interaction) {
            const userId = interaction.user.id;
            const itemName = interaction.options.getString('item');
            const quantite = interaction.options.getInteger('quantite');
            const prix = interaction.options.getInteger('prix');
            const devise = interaction.options.getString('devise');
            const deviseNom = deviseLabels[devise] || devise;
          
            try {
              const item = await Item.findOne({ name: itemName });
              if (!item) {
                return interaction.reply({
                  embeds: [createErrorEmbed("❌ Item introuvable", "Cet item n'existe pas.")],
                  ephemeral: true
                });
              }
          
              const inventaire = await Inventaire.findOne({ userId });
              if (!inventaire) {
                return interaction.reply({
                  embeds: [createErrorEmbed("❌ Inventaire vide", "Vous ne possédez aucun inventaire.")],
                  ephemeral: true
                });
              }
          
              const itemIndex = inventaire.items.findIndex(i => i.itemId.toString() === item._id.toString());
              if (itemIndex === -1 || inventaire.items[itemIndex].quantity < quantite) {
                return interaction.reply({
                  embeds: [createErrorEmbed("❌ Quantité insuffisante", "Vous n'avez pas assez de cet item en stock.")],
                  ephemeral: true
                });
              }
          
              inventaire.items[itemIndex].quantity -= quantite;
              if (inventaire.items[itemIndex].quantity <= 0) {
                inventaire.items.splice(itemIndex, 1);
              }
              await inventaire.save();
          
              const vente = new Marketplace({
                sellerId: userId,
                itemId: item._id,
                quantity: quantite,
                price: prix,
                devise
              });
              await vente.save();
          
              const embed = createSuccessEmbed(
                '✅ Ajout au Marketplace',
                'Votre item a été ajouté avec succès au marketplace !',
                [
                  { name: '📦 Item', value: `**${item.name}**`, inline: true },
                  { name: '📊 Quantité', value: `**${quantite}**`, inline: true },
                  { name: '💰 Prix', value: `**${prix} ${deviseNom}**`, inline: true }
                ]
              ).setFooter({ text: 'Marché mis à jour avec succès !' });
          
              await interaction.reply({ embeds: [embed] });
          
            } catch (error) {
              console.error("❌ Erreur Marketplace :", error);
              await interaction.reply({
                embeds: [createErrorEmbed("❌ Erreur interne", "Une erreur est survenue lors de l'ajout au marketplace.")],
                ephemeral: true
              });
            }
          }
          }

        ]
    }
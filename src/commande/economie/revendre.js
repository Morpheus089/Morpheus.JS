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
            .setName('revendre')
            .setDescription("Revends un objet de ton inventaire pour de la monnaie 💰")
            .addStringOption(option =>
              option.setName('objet')
                .setDescription("Nom de l'objet à revendre 📦")
                .setRequired(true)
            ),
          
          async execute(interaction) {
            const userId = interaction.user.id;
            const username = interaction.user.username;
            const itemName = interaction.options.getString('objet');
          
            try {
              const item = await Item.findOne({ name: { $regex: new RegExp(`^${itemName}$`, 'i') } });
              if (!item) {
                return interaction.reply({
                  embeds: [createErrorEmbed("❌ Objet introuvable", `L'objet **${itemName}** n'existe pas.`)],
                  ephemeral: true
                });
              }
          
              const userInventaire = await Inventaire.findOne({ userId });
              if (!userInventaire || !userInventaire.items.some(i => i.itemId.equals(item._id))) {
                return interaction.reply({
                  embeds: [createErrorEmbed("❌ Vente impossible", `Tu ne possèdes pas **${item.name}** dans ton inventaire.`)],
                  ephemeral: true
                });
              }
          
              const resaleValue = Math.floor(item.price * 0.5);
              const deviseNom = deviseLabels[item.devise] || item.devise;
          
              let userEconomie = await Economie.findOne({ userId });
              if (!userEconomie) {
                userEconomie = new Economie({ userId, ecus: 0, cristauxNoirs: 0, pointsFidelite: 0 });
              }
          
              userEconomie[item.devise] += resaleValue;
              await userEconomie.save();
          
              userInventaire.items = userInventaire.items.filter(i => !i.itemId.equals(item._id));
              await userInventaire.save();
          
              const categoryEmojis = {
                casque: "🪖", cuirasse: "🛡️", gantelet: "🧤", greve: "🦵", solerets: "👢",
                epaulettes: "🏋️", cape: "🧥", manchettes: "🎽", anneaux: "💍", pendentifs: "📿",
                "arme D": "🗡️", "arme G": "🛡️"
              };
              const itemEmoji = categoryEmojis[item.categorie] || "📦";
          
              const embed = createSuccessEmbed(
                "✅ Vente réussie !",
                `Tu as vendu **${itemEmoji} ${item.name}** pour **${resaleValue} ${deviseNom}**.`,
                [
                  { name: "📜 Description", value: item.description, inline: false },
                  { name: "💰 Valeur de revente", value: `${resaleValue} ${deviseNom}`, inline: true },
                  { name: "🗑️ Supprimé de l'inventaire", value: "✅ Oui", inline: true }
                ]
              );
          
              return interaction.reply({ embeds: [embed] });
          
            } catch (error) {
              console.error("❌ Erreur lors de la vente :", error);
              return interaction.reply({
                embeds: [createErrorEmbed("❌ Erreur interne", "Une erreur est survenue lors de la vente.")],
                ephemeral: true
              });
            }
          }
          }

        ]
    }
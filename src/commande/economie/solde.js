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
            .setName('solde')
            .setDescription('Vérifie ton solde économique. 💳'),
        
          async execute(interaction) {
            const userId = interaction.user.id;
            const username = interaction.user.username;
        
            let userEconomie = await Economie.findOne({ userId });
        
            if (!userEconomie) {
              userEconomie = new Economie({ userId });
              await userEconomie.save();
        
              return interaction.reply({
                embeds: [
                  createSuccessEmbed(
                    'Bienvenue ! 👋',
                    "Tu n'avais pas de solde, je viens de te créer un compte économique."
                  )
                ]
              });
            }
        
            return interaction.reply({
              embeds: [createBalanceEmbed(username, userEconomie)]
            });
          }
        }

    ]
}
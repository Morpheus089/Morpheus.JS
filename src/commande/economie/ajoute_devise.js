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
                .setName('ajoute_devise')
                .setDescription("Ajoute une certaine quantité de monnaie à l'utilisateur spécifié. ✅")
                .addUserOption(option =>
                  option.setName('utilisateur')
                    .setDescription("L'utilisateur à qui ajouter la monnaie")
                    .setRequired(true))
                .addStringOption(option =>
                  option.setName('monnaie')
                    .setDescription('Type de monnaie à ajouter')
                    .setRequired(true)
                    .addChoices(
                      { name: 'Écus', value: 'ecus' },
                      { name: 'Cristaux Noirs', value: 'cristaux' },
                      { name: 'Points de Fidélité', value: 'points' }
                    ))
                .addIntegerOption(option =>
                  option.setName('montant')
                    .setDescription('Le montant à ajouter')
                    .setRequired(true)),
            
              async execute(interaction) {
                if (!isAdmin(interaction.member)) {
                  return interaction.reply({
                    embeds: [createErrorEmbed('Erreur ❌', "Tu n'as pas les permissions nécessaires pour utiliser cette commande.")],
                    ephemeral: true
                  });
                }
            
                const user = interaction.options.getUser('utilisateur');
                const monnaie = interaction.options.getString('monnaie');
                const montant = interaction.options.getInteger('montant');
            
                if (montant <= 0) {
                  return interaction.reply({
                    embeds: [createErrorEmbed('Erreur ❌', "Le montant doit être supérieur à zéro.")],
                    ephemeral: true
                  });
                }
            
                let userEconomie = await Economie.findOne({ userId: user.id });
                if (!userEconomie) {
                  userEconomie = new Economie({ userId: user.id });
                }
            
                modifierSolde(userEconomie, monnaie, montant);
                await userEconomie.save();
            
                const deviseNom = deviseLabels[monnaie] || monnaie;
            
                return interaction.reply({
                  embeds: [
                    createSuccessEmbed(
                      'Succès ✅',
                      `${montant} ${deviseNom} ont été ajoutés au solde de ${user.username}.`,
                      [
                        { name: 'Écus 💰', value: `${userEconomie.ecus}`, inline: true },
                        { name: 'Cristaux Noirs 🔮', value: `${userEconomie.cristauxNoirs}`, inline: true },
                        { name: 'Points de Fidélité ⭐', value: `${userEconomie.pointsFidelite}`, inline: true }
                      ]
                    )
                  ]
                });
              }
            }

        ]
    }
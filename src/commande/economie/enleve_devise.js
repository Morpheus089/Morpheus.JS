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
    .setName('enleve_devise')
    .setDescription("Enlève une certaine quantité de monnaie à l'utilisateur spécifié. ❌")
    .addUserOption(option =>
      option.setName('utilisateur')
        .setDescription("L'utilisateur à qui enlever la monnaie")
        .setRequired(true))
    .addStringOption(option =>
      option.setName('monnaie')
        .setDescription('Type de monnaie à enlever')
        .setRequired(true)
        .addChoices(
          { name: 'Écus', value: 'ecus' },
          { name: 'Cristaux Noirs', value: 'cristaux' },
          { name: 'Points de Fidélité', value: 'points' }
        ))
    .addIntegerOption(option =>
      option.setName('montant')
        .setDescription('Le montant à enlever')
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

    const userEconomie = await Economie.findOne({ userId: user.id });
    if (!userEconomie) {
      return interaction.reply({
        embeds: [createErrorEmbed('Erreur ❌', "L'utilisateur n'a pas encore de compte économique.")],
        ephemeral: true
      });
    }

    const deviseNom = deviseLabels[monnaie] || monnaie;
    let soldeActuel;

    switch (monnaie) {
      case 'ecus':
        soldeActuel = userEconomie.ecus;
        if (soldeActuel < montant) {
          return interaction.reply({
            embeds: [createErrorEmbed('Erreur ❌', `${user.username} n'a pas assez d'Écus pour cette opération.`)],
            ephemeral: true
          });
        }
        userEconomie.ecus -= montant;
        break;

      case 'cristaux':
        soldeActuel = userEconomie.cristauxNoirs;
        if (soldeActuel < montant) {
          return interaction.reply({
            embeds: [createErrorEmbed('Erreur ❌', `${user.username} n'a pas assez de Cristaux Noirs pour cette opération.`)],
            ephemeral: true
          });
        }
        userEconomie.cristauxNoirs -= montant;
        break;

      case 'points':
        soldeActuel = userEconomie.pointsFidelite;
        if (soldeActuel < montant) {
          return interaction.reply({
            embeds: [createErrorEmbed('Erreur ❌', `${user.username} n'a pas assez de Points de Fidélité pour cette opération.`)],
            ephemeral: true
          });
        }
        userEconomie.pointsFidelite -= montant;
        break;
    }

    await userEconomie.save();

    return interaction.reply({
      embeds: [
        createSuccessEmbed(
          'Succès ✅',
          `${montant} ${deviseNom} ont été retirés au solde de ${user.username}.`,
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
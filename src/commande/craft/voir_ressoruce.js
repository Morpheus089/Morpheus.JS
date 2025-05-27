const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const mongoose = require('mongoose');
const Recette = require('../../database/models/recetteModel');
const Ressource = require('../../database/models/ressourceModel');
const InventaireRessource = require('../../database/models/inventaireRessourceModel');
const Inventaire = require('../../database/models/inventaireModel');
const MetierUtilisateur = require('../../database/models/metierUtilisateurModel');
const Metier = require('../../database/models/metierModel');
const Item = require('../../database/models/itemModel');
const Equipement = require('../../database/models/equipementModel');

const parseStats = require('../../utils/parseStats');
const { createSuccessEmbed, createErrorEmbed } = require('../../utils/embeds');
const { findRessource } = require('../../utils/db');
const { checkMetierAccess } = require('../../utils/metier');

module.exports = {
  commands: [

    {
      data: new SlashCommandBuilder()
        .setName('voir_ressources')
        .setDescription("Affiche l'inventaire des ressources d'un utilisateur.")
        .addUserOption(option =>
          option.setName('utilisateur')
            .setDescription("Utilisateur dont vous voulez voir les ressources.")
            .setRequired(false)
        ),
    
      async execute(interaction) {
        const utilisateur = interaction.options.getUser('utilisateur') || interaction.user;
    
        const inventaire = await InventaireRessource.findOne({ utilisateurId: utilisateur.id })
          .populate('ressources.ressourceId');
    
        if (!inventaire || inventaire.ressources.length === 0) {
          return interaction.reply({
            embeds: [
              createErrorEmbed('❌ Aucune ressource', `${utilisateur.username} n'a aucune ressource.`)
            ],
            ephemeral: true
          });
        }
    
        const ressourcesListe = inventaire.ressources
          .map(r => `**${r.ressourceId.nom}**: ${r.quantite}`)
          .join('\n');
    
        return interaction.reply({
          embeds: [
            createSuccessEmbed(
              `📦 Inventaire de ${utilisateur.username}`,
              ressourcesListe
            )
          ]
        });
      }
    }

]
}
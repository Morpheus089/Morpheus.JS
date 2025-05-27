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
          .setName('donner_ressource')
          .setDescription("Donne une ressource à un utilisateur (Admin uniquement).")
          .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
          .addUserOption(option =>
            option.setName('utilisateur')
              .setDescription("Utilisateur qui recevra la ressource.")
              .setRequired(true)
          )
          .addStringOption(option =>
            option.setName('ressource')
              .setDescription("Nom ou ID de la ressource à donner.")
              .setRequired(true)
          )
          .addIntegerOption(option =>
            option.setName('quantite')
              .setDescription("Quantité de la ressource à donner.")
              .setRequired(true)
          ),
      
        async execute(interaction) {
          const utilisateur = interaction.options.getUser('utilisateur');
          const ressourceNomOuId = interaction.options.getString('ressource');
          const quantite = interaction.options.getInteger('quantite');
      
          if (quantite <= 0) {
            return interaction.reply({
              embeds: [createErrorEmbed('⛔ Erreur', 'La quantité doit être supérieure à 0.')],
              ephemeral: true
            });
          }
      
          const ressource = await findRessource(ressourceNomOuId);
          if (!ressource) {
            return interaction.reply({
              embeds: [createErrorEmbed('⛔ Ressource introuvable', `Aucune ressource nommée ou avec l'ID **${ressourceNomOuId}** n'a été trouvée.`)],
              ephemeral: true
            });
          }
      
          let inventaire = await InventaireRessource.findOne({ utilisateurId: utilisateur.id });
          if (!inventaire) {
            inventaire = new InventaireRessource({ utilisateurId: utilisateur.id, ressources: [] });
          }
      
          let ressourceExistante = inventaire.ressources.find(r => r.ressourceId.equals(ressource._id));
          if (ressourceExistante) {
            ressourceExistante.quantite += quantite;
          } else {
            inventaire.ressources.push({ ressourceId: ressource._id, quantite });
          }
      
          await inventaire.save();
      
          return interaction.reply({
            embeds: [
              createSuccessEmbed(
                '🎁 Ressource attribuée',
                `**${quantite}x ${ressource.nom}** ont été ajoutés à l'inventaire de ${utilisateur.username}.`,
                [
                  { name: '🆔 ID Ressource', value: ressource._id.toString(), inline: true },
                  { name: '📜 Nom Ressource', value: ressource.nom, inline: true },
                  { name: '📦 Quantité', value: `${quantite}`, inline: true }
                ]
              )
            ]
          });
        }
      }

    ]
}
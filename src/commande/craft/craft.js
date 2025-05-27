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
          .setName('craft')
          .setDescription("Crée un objet à partir d'une recette.")
          .addStringOption(option =>
              option.setName('recette')
                  .setDescription("Nom de la recette à utiliser")
                  .setRequired(true)
          ),
      
      async execute(interaction) {
          const userId = interaction.user.id;
          const recetteNom = interaction.options.getString('recette');
      
          console.log("🔍 [1] Début du craft pour la recette :", recetteNom);
      
          const recette = await Recette.findOne({ name: recetteNom }).populate('ingredients.ressource');
          if (!recette) {
              return interaction.reply({ embeds: [createErrorEmbed('⛔ Erreur', `La recette **${recetteNom}** est introuvable.`)], ephemeral: true });
          }
      
          // Vérifier l'accès au métier avec l'utilitaire
          const { ok, message } = await checkMetierAccess(userId, recette);
          if (!ok) {
              return interaction.reply({ embeds: [createErrorEmbed('⛔ Erreur', message)], ephemeral: true });
          }
      
          let inventaireRessource = await InventaireRessource.findOne({ utilisateurId: userId });
          if (!inventaireRessource) {
              return interaction.reply({ embeds: [createErrorEmbed('⛔ Erreur', "Vous ne possédez aucun inventaire de ressources.")], ephemeral: true });
          }
      
          let ressourcesUtilisees = [];
          for (const ingredient of recette.ingredients) {
              const ressourceUtilisateur = inventaireRessource.ressources.find(r => r.ressourceId.toString() === ingredient.ressource._id.toString());
              if (!ressourceUtilisateur || ressourceUtilisateur.quantite < ingredient.quantity) {
                  return interaction.reply({ embeds: [createErrorEmbed('⛔ Ressources insuffisantes', `Vous n'avez pas assez de **${ingredient.ressource.nom}** (Requis: ${ingredient.quantity})`)], ephemeral: true });
              }
              ressourceUtilisateur.quantite -= ingredient.quantity;
              ressourcesUtilisees.push(`🔹 ${ingredient.ressource.nom} : ${ingredient.quantity}`);
          }
          await inventaireRessource.save();
      
          let inventaire = await Inventaire.findOne({ userId: userId }) || new Inventaire({ userId: userId, items: [] });
      
          let itemExistant = await Item.findOne({ name: recette.name });
          if (!itemExistant) {
              itemExistant = new Item({
                  name: recette.name,
                  description: recette.description,
                  price: recette.prix,
                  devise: recette.devise,
                  rarete: recette.rarete,
                  equipable: true,
                  stock: recette.stock,
                  categorie: recette.categorie,
                  boutique: recette.boutique,
                  image: recette.image || null,
                  stats: recette.stats
              });
              await itemExistant.save();
          }
      
          const itemInInventory = inventaire.items.find(i => i.itemId.toString() === itemExistant._id.toString());
          if (itemInInventory) {
              itemInInventory.quantity += 1;
          } else {
              inventaire.items.push({ itemId: itemExistant._id, quantity: 1 });
          }
          await inventaire.save();
      
          const embedSuccess = createSuccessEmbed('✅ Craft réussi !', `Vous avez fabriqué **${recette.name}** !`, [
              { name: '📜 Description', value: recette.description },
              { name: '🎭 Métier requis', value: recette.metierAssocie.name, inline: true },
              { name: '📊 Rareté', value: recette.rarete, inline: true },
              { name: '📦 Ressources utilisées', value: ressourcesUtilisees.join('\n') }
          ]);
      
          return interaction.reply({ embeds: [embedSuccess] });
       }
      }

    ]
}
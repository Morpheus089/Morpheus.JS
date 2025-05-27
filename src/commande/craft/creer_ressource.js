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
            .setName('creer_ressource')
            .setDescription('Crée une nouvelle ressource')
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addStringOption(option =>
              option.setName('nom').setDescription('Nom de la ressource').setRequired(true))
            .addStringOption(option =>
              option.setName('type').setDescription('Type de la ressource').setRequired(true))
            .addIntegerOption(option =>
              option.setName('valeur').setDescription('Valeur marchande de la ressource').setRequired(true))
            .addStringOption(option =>
              option.setName('rarete').setDescription('Rareté de la ressource').setRequired(true)
                .addChoices(
                  { name: 'Commun', value: 'Commun' },
                  { name: 'Rare', value: 'Rare' },
                  { name: 'Épique', value: 'Épique' },
                  { name: 'Légendaire', value: 'Légendaire' }
                ))
            .addStringOption(option =>
              option.setName('description').setDescription('Description de la ressource').setRequired(false)),
        
          async execute(interaction) {
            const nom = interaction.options.getString('nom');
            const type = interaction.options.getString('type');
            const description = interaction.options.getString('description') || 'Aucune description fournie';
            const valeur = interaction.options.getInteger('valeur');
            const rarete = interaction.options.getString('rarete');
        
            try {
              const ressourceExistante = await Ressource.findOne({ nom });
              if (ressourceExistante) {
                return interaction.reply({
                  embeds: [createErrorEmbed('⛔ Ressource existante', `Une ressource portant le nom **${nom}** existe déjà.`)],
                  ephemeral: true
                });
              }
        
        
              const nouvelleRessource = new Ressource({
                nom,
                type,
                description,
                valeurMarchande: valeur,
                rarete,
              });
        
              await nouvelleRessource.save();
        
              return interaction.reply({
                embeds: [
                  createSuccessEmbed(
                    'Ressource Créée',
                    `La ressource **${nom}** a été créée avec succès !`,
                    [
                      { name: 'Nom', value: nom },
                      { name: 'Type', value: type },
                      { name: 'Rareté', value: rarete },
                      { name: 'Valeur marchande', value: `${valeur} écus` },
                    ]
                  )
                ]
              });
        
              
            } catch (err) {
              console.error('Erreur lors de la création de la ressource :', err);
              return interaction.reply({
                embeds: [createErrorEmbed('⛔ Erreur', 'Une erreur est survenue lors de la création de la ressource.')],
                ephemeral: true
              });
            }
          }
        }

    ]
}
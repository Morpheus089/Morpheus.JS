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
      .setName('creer_recette')
      .setDescription('Crée une nouvelle recette de craft')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addStringOption(option =>
        option.setName('nom').setDescription('Nom de la recette').setRequired(true))
      .addStringOption(option =>
        option.setName('description').setDescription('Description de la recette').setRequired(true))
      .addIntegerOption(option =>
        option.setName('prix').setDescription('Prix de la recette').setRequired(true))
      .addStringOption(option =>
        option.setName('devise').setDescription('Devise utilisée').setRequired(true)
          .addChoices(
            { name: 'Ecus', value: 'ecus' },
            { name: 'Cristaux', value: 'cristaux' },
            { name: 'Points', value: 'points' }
          ))
      .addStringOption(option =>
        option.setName('rarete').setDescription('Rareté').setRequired(true)
          .addChoices(
            { name: 'Commun', value: 'Commun' },
            { name: 'Rare', value: 'Rare' },
            { name: 'Épique', value: 'Épique' },
            { name: 'Légendaire', value: 'Légendaire' }
          ))
      .addIntegerOption(option =>
        option.setName('niveau').setDescription('Niveau requis').setRequired(true))
      .addStringOption(option =>
        option.setName('categorie').setDescription('Catégorie').setRequired(true)
          .addChoices(
            { name: 'casque', value: 'casque' },
            { name: 'cuirasse', value: 'cuirasse' },
            { name: 'gantelet', value: 'gantelet' },
            { name: 'greve', value: 'greve' },
            { name: 'solerets', value: 'solerets' },
            { name: 'epaulettes', value: 'epaulettes' },
            { name: 'cape', value: 'cape' },
            { name: 'manchettes', value: 'manchettes' },
            { name: 'anneaux', value: 'anneaux' },
            { name: 'pendentifs', value: 'pendentifs' },
            { name: 'arme D', value: 'arme D' },
            { name: 'arme G', value: 'arme G' }
          ))
      .addStringOption(option =>
        option.setName('boutique').setDescription('Type de boutique').setRequired(true)
          .addChoices(
            { name: 'boutique', value: 'boutique' },
            { name: 'dark_boutique', value: 'dark_boutique' },
            { name: 'boutique_vip', value: 'boutique_vip' }
          ))
      .addStringOption(option =>
        option.setName('ingredients').setDescription('id:quantité, id:quantité').setRequired(true))
      .addStringOption(option =>
        option.setName('bonus').setDescription('stats bonus: "force:10"').setRequired(false))
      .addStringOption(option =>
        option.setName('malus').setDescription('stats malus: "force:10"').setRequired(false)),
  
    async execute(interaction) {
      const nom = interaction.options.getString('nom');
      const description = interaction.options.getString('description');
      const prix = interaction.options.getInteger('prix');
      const devise = interaction.options.getString('devise');
      const rarete = interaction.options.getString('rarete');
      const niveauMin = interaction.options.getInteger('niveau');
      const categorie = interaction.options.getString('categorie');
      const boutique = interaction.options.getString('boutique');
      const ingredients = interaction.options.getString('ingredients').split(',');
      const bonus = parseStats(interaction.options.getString('bonus'));
      const malus = parseStats(interaction.options.getString('malus'));
  
      try {
        const ressources = await Promise.all(ingredients.map(async (ing) => {
          const [id, quantity] = ing.split(':');
          const ressource = await Ressource.findById(id);
          return { ressource: ressource._id, quantity: parseInt(quantity, 10) };
        }));
  
  
        const produitId = new mongoose.Types.ObjectId();
  
        const nouvelleRecette = new Recette({
          name: nom,
          description,
          prix,
          devise,
          rarete,
          equipable: false,
          stock: 0,
          categorie,
          boutique,
          stats: {
            force: { bonus: bonus.force || 0, malus: malus.force || 0 },
            agilite: { bonus: bonus.agilite || 0, malus: malus.agilite || 0 },
            vitesse: { bonus: bonus.vitesse || 0, malus: malus.vitesse || 0 },
            inteligence: { bonus: bonus.intelligence || 0, malus: malus.intelligence || 0 },
            dexterite: { bonus: bonus.dexterite || 0, malus: malus.dexterite || 0 },
            vitalite: { bonus: bonus.vitalite || 0, malus: malus.vitalite || 0 },
            charisme: { bonus: bonus.charisme || 0, malus: malus.charisme || 0 },
            chance: { bonus: bonus.chance || 0, malus: malus.chance || 0 },
          },
          niveauMin,
          ingredients: ressources,
          produit: produitId,
        });
  
        await nouvelleRecette.save();
  
        return interaction.reply({
          embeds: [
            createSuccessEmbed(
              'Recette de Craft Créée',
              `La recette **${nom}** a été créée avec succès !`,
              [{ name: 'ID Produit', value: produitId.toString() }]
            )
          ]
        });
  
  
      } catch (err) {
        console.error('Erreur lors de la création de la recette :', err);
        return interaction.reply({
          embeds: [createErrorEmbed('⛔ Erreur', 'Une erreur est survenue lors de la création de la recette.')],
          ephemeral: true
        });
      }
    }
  }

]
}
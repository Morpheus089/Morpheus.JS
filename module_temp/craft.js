const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const mongoose = require('mongoose');
const Recette = require('../database/models/recetteModel');
const Ressource = require('../database/models/ressourceModel');
const InventaireRessource = require('../database/models/inventaireRessourceModel');
const Inventaire = require('../database/models/inventaireModel');
const MetierUtilisateur = require('../database/models/metierUtilisateurModel');
const Metier = require('../database/models/metierModel');
const Item = require('../database/models/itemModel');
const Equipement = require('../database/models/equipementModel');

const parseStats = require('../utils/parseStats');
const { createSuccessEmbed, createErrorEmbed } = require('../utils/embeds');
const { findRessource } = require('../utils/db');
const { checkMetierAccess } = require('../utils/metier');

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
},

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
},

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
},

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
},

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
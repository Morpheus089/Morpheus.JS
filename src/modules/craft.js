const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const mongoose = require('mongoose');
const Recette = require('../database/models/recetteModel'); // Importer le modèle de la recette
const Ressource = require('../database/models/ressourceModel'); // Importer le modèle de la ressource
const InventaireRessource = require('../database/models/inventaireRessourceModel'); // Importer le modèle de l'inventaire de ressources
const Inventaire = require('../database/models/inventaireModel'); // Importer le modèle de l'inventaire
const MetierUtilisateur = require('../database/models/metierUtilisateurModel'); // Importer le modèle de la relation entre métier et utilisateur
const Metier = require('../database/models/metierModel'); // Importer le modèle du métier
const Item = require('../database/models/itemModel'); // Importer le modèle de l'item
const Equipement = require('../database/models/equipementModel'); // Assure-toi que le chemin est correct

module.exports = {
  commands: [
    {
      data: new SlashCommandBuilder()
    .setName('creer_recette')
    .setDescription('Crée une nouvelle recette de craft')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Limite aux administrateurs
    .addStringOption(option =>
      option.setName('nom')
        .setDescription('Nom de la recette')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Description de la recette')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('prix')
        .setDescription('Prix de la recette')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('devise')
        .setDescription('Devise utilisée pour acheter la recette')
        .setRequired(true)
        .addChoices(
          { name: 'Ecus', value: 'ecus' },
          { name: 'Cristaux', value: 'cristaux' },
          { name: 'Points', value: 'points' }
        ))
    .addStringOption(option =>
      option.setName('rarete')
        .setDescription('Rareté de la recette')
        .setRequired(true)
        .addChoices(
          { name: 'Commun', value: 'Commun' },
          { name: 'Rare', value: 'Rare' },
          { name: 'Épique', value: 'Épique' },
          { name: 'Légendaire', value: 'Légendaire' }
        ))
    .addIntegerOption(option =>
      option.setName('niveau')
        .setDescription('Niveau minimum requis pour créer l\'objet')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('categorie')
        .setDescription('Catégorie de l\'objet produit')
        .setRequired(true)
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
      option.setName('boutique')
        .setDescription('Type de boutique où la recette est disponible')
        .setRequired(true)
        .addChoices(
          { name: 'boutique', value: 'boutique' },
          { name: 'dark_boutique', value: 'dark_boutique' },
          { name: 'boutique_vip', value: 'boutique_vip' }
        ))
    .addStringOption(option =>
      option.setName('ingredients')
        .setDescription('Liste des ressources et quantités requises (format: "id_ressource:quantité")')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('bonus')
        .setDescription('Entrez les bonus sous la forme "stat:valeur, stat:valeur"')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('malus')
        .setDescription('Entrez les malus sous la forme "stat:valeur, stat:valeur"')
        .setRequired(false)),

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
    const bonusString = interaction.options.getString('bonus');
    const malusString = interaction.options.getString('malus');

    const parseStats = (statsString) => {
      if (!statsString) return {};
      const statsArray = statsString.split(',').map(stat => {
        const [statName, value] = stat.split(':');
        return { statName, value: parseInt(value.trim(), 10) };
      });
      return statsArray.reduce((acc, { statName, value }) => {
        acc[statName] = value;
        return acc;
      }, {});
    };

    const bonus = parseStats(bonusString);
    const malus = parseStats(malusString);

    try {
      const ressources = await Promise.all(ingredients.map(async (ing) => {
        const [id, quantity] = ing.split(':');
        const ressource = await Ressource.findById(id);
        return { ressource: ressource._id, quantity: parseInt(quantity, 10) };
      }));

      // Génération de l'ID du produit
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
          inteligence: { bonus: bonus.intelligence || 0, malus: malus.ntelligence || 0},
          dexterite: { bonus: bonus.dexterite || 0, malus: malus.dexterite || 0},
          vitalite: { bonus: bonus.vitalite || 0, malus: malus.vitalite || 0},
          charisme: { bonus: bonus.charisme || 0, malus: malus.charisme || 0},
          chance: { bonus: bonus.chance || 0, malus: malus.chance || 0},
        },
        niveauMin,
        ingredients: ressources,
        produit: produitId,  // Utilisation de l'ID généré
      });

      await nouvelleRecette.save();

      const embed = new EmbedBuilder()
        .setColor('#FF9900')
        .setTitle('Recette de Craft Créée')
        .setDescription(`La recette **${nom}** a été créée avec succès !`)
        .addFields({ name: 'ID Produit', value: produitId.toString() })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error('Erreur lors de la création de la recette :', err);
      return interaction.reply({ content: 'Une erreur est survenue lors de la création de la recette.', ephemeral: true });
    }
  },
},

{
  data: new SlashCommandBuilder()
    .setName('creer_ressource')
    .setDescription('Crée une nouvelle ressource')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Limite aux administrateurs
    .addStringOption(option => 
      option.setName('nom')
        .setDescription('Nom de la ressource')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('type')
        .setDescription('Type de la ressource')
        .setRequired(true))
    .addIntegerOption(option => 
      option.setName('valeur')
        .setDescription('Valeur marchande de la ressource')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('rarete')
        .setDescription('Rareté de la ressource')
        .setRequired(true)
        .addChoices(
          { name: 'Commun', value: 'Commun' },
          { name: 'Rare', value: 'Rare' },
          { name: 'Épique', value: 'Épique' },
          { name: 'Légendaire', value: 'Légendaire' }
        ))
    // Option facultative placée en dernier
    .addStringOption(option => 
      option.setName('description')
        .setDescription('Description de la ressource')
        .setRequired(false)),
  
  async execute(interaction) {
    const nom = interaction.options.getString('nom');
    const type = interaction.options.getString('type');
    const description = interaction.options.getString('description') || 'Aucune description fournie';
    const valeur = interaction.options.getInteger('valeur');
    const rarete = interaction.options.getString('rarete');

    try {
      // Vérifie si la ressource existe déjà
      const ressourceExistante = await Ressource.findOne({ nom: nom });
      if (ressourceExistante) {
        return interaction.reply({ content: `Une ressource portant le nom **${nom}** existe déjà.`, ephemeral: true });
      }

      // Créer la ressource
      const nouvelleRessource = new Ressource({
        nom,
        type,
        description,
        valeurMarchande: valeur,
        rarete,
      });

      await nouvelleRessource.save();

      // Création d'un embed pour la réponse
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Ressource Créée')
        .setDescription(`La ressource **${nom}** a été créée avec succès !`)
        .addFields(
          { name: 'Nom', value: nom },
          { name: 'Type', value: type },
          { name: 'Rareté', value: rarete },
          { name: 'Valeur marchande', value: `${valeur} écus` },
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error('Erreur lors de la création de la ressource :', err);
      return interaction.reply({ content: 'Une erreur est survenue lors de la création de la ressource.', ephemeral: true });
    }
  },
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
            return interaction.reply({ content: "❌ La quantité doit être supérieure à 0.", ephemeral: true });
        }

        // Vérifier si la ressource existe avec un ID valide ou un nom
        let ressource;
        if (mongoose.Types.ObjectId.isValid(ressourceNomOuId)) {
            ressource = await Ressource.findOne({ _id: ressourceNomOuId });
        }
        if (!ressource) {
            ressource = await Ressource.findOne({ nom: ressourceNomOuId });
        }

        if (!ressource) {
            return interaction.reply({ content: `❌ Ressource **${ressourceNomOuId}** introuvable.`, ephemeral: true });
        }

        // Vérifier si l'utilisateur a un inventaire
        let inventaire = await InventaireRessource.findOne({ utilisateurId: utilisateur.id });
        if (!inventaire) {
            inventaire = new InventaireRessource({ utilisateurId: utilisateur.id, ressources: [] });
        }

        // Vérifier si l'utilisateur a déjà cette ressource
        let ressourceExistante = inventaire.ressources.find(r => r.ressourceId.equals(ressource._id));
        if (ressourceExistante) {
            ressourceExistante.quantite += quantite;
        } else {
            inventaire.ressources.push({ ressourceId: ressource._id, quantite });
        }

        await inventaire.save();

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🎁 Ressource attribuée')
            .setDescription(`**${quantite}x ${ressource.nom}** ont été ajoutés à l'inventaire de ${utilisateur.username}.`)
            .addFields(
                { name: '🆔 ID Ressource', value: ressource._id.toString(), inline: true },
                { name: '📜 Nom Ressource', value: ressource.nom, inline: true },
                { name: '📦 Quantité', value: `${quantite}`, inline: true }
            )
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
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
        
        // Récupérer l'inventaire de l'utilisateur
        let inventaire = await InventaireRessource.findOne({ utilisateurId: utilisateur.id }).populate('ressources.ressourceId');
        
        if (!inventaire || inventaire.ressources.length === 0) {
            return interaction.reply({ content: `❌ ${utilisateur.username} n'a aucune ressource.`, ephemeral: true });
        }
        
        // Construire la liste des ressources
        const ressourcesListe = inventaire.ressources.map(r => `**${r.ressourceId.nom}**: ${r.quantite}`).join('\n');
        
        // Créer un embed
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`📦 Inventaire de ${utilisateur.username}`)
            .setDescription(ressourcesListe)
            .setTimestamp();
        
        interaction.reply({ embeds: [embed] });
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
            return interaction.reply({ embeds: [new EmbedBuilder().setColor('Red').setTitle('⛔ Erreur').setDescription(`La recette **${recetteNom}** est introuvable.`)], ephemeral: true });
        }

        const metierAssocie = await Metier.findOne({ "recettes.recetteId": recette._id });
        if (!metierAssocie) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor('Red').setTitle('⛔ Erreur').setDescription(`Aucun métier n'est associé à la recette **${recetteNom}**.`)], ephemeral: true });
        }

        const metierUtilisateurData = await MetierUtilisateur.findOne({ userId: userId });
        if (!metierUtilisateurData) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor('Red').setTitle('⛔ Erreur').setDescription("Vous n'avez aucun métier enregistré.")], ephemeral: true });
        }

        const metierUtilisateurInfo = metierUtilisateurData.metiers.find(m => m.metierId.toString() === metierAssocie._id.toString());
        if (!metierUtilisateurInfo || metierUtilisateurInfo.niveau < metierAssocie.recettes.find(m => m.recetteId.toString() === recette._id.toString()).niveauRequis) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor('Red').setTitle('⛔ Niveau insuffisant').setDescription("Vous ne remplissez pas les conditions pour crafter cet objet.")], ephemeral: true });
        }

        let inventaireRessource = await InventaireRessource.findOne({ utilisateurId: userId });
        if (!inventaireRessource) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor('Red').setTitle('⛔ Erreur').setDescription("Vous ne possédez aucun inventaire de ressources.")], ephemeral: true });
        }

        let ressourcesUtilisees = [];
        for (const ingredient of recette.ingredients) {
            const ressourceUtilisateur = inventaireRessource.ressources.find(r => r.ressourceId.toString() === ingredient.ressource._id.toString());
            if (!ressourceUtilisateur || ressourceUtilisateur.quantite < ingredient.quantity) {
                return interaction.reply({ embeds: [new EmbedBuilder().setColor('Red').setTitle('⛔ Ressources insuffisantes').setDescription(`Vous n'avez pas assez de **${ingredient.ressource.nom}** (Requis: ${ingredient.quantity})`)], ephemeral: true });
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
                equipable: true, // Toujours définir l'objet comme équipable
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

        const embedSuccess = new EmbedBuilder()
            .setColor('Green')
            .setTitle('✅ Craft réussi !')
            .setDescription(`Vous avez fabriqué **${recette.name}** !`)
            .addFields(
                { name: '📜 Description', value: recette.description },
                { name: '🎭 Métier requis', value: metierAssocie.name, inline: true },
                { name: '📊 Rareté', value: recette.rarete, inline: true },
                { name: '📦 Ressources utilisées', value: ressourcesUtilisees.join('\n') }
            )
            .setTimestamp();

        return interaction.reply({ embeds: [embedSuccess] });
    }
}

  ]
}
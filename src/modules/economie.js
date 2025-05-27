const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Stats = require('../src/database/models/statsModel');
const Economie = require('../src/database/models/economieModel');
const Item = require('../src/database/models/itemModel');
const Marketplace = require('../src/database/models/marketplaceModel');
const Inventaire = require('../src/database/models/inventaireModel')
const Equipement = require('../src/database/models/equipementModel');

const { createSuccessEmbed, createErrorEmbed, createBalanceEmbed } = require('../src/utils/embeds');
const { modifierSolde, deviseLabels } = require('../src/utils/devise');
const { isAdmin } = require('../src/utils/permissions');
const parseStats = require('../src/utils/parseStats');

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
},

        
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
},

        
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
},
        {
            data: new SlashCommandBuilder()
    .setName('cree_item')
    .setDescription("Crée un nouvel article dans la boutique. 🛒")
    .addStringOption(option =>
      option.setName('nom').setDescription("Nom de l'article").setRequired(true))
    .addStringOption(option =>
      option.setName('description').setDescription("Description de l'article").setRequired(true))
    .addIntegerOption(option =>
      option.setName('prix').setDescription("Prix de l'article").setRequired(true))
    .addStringOption(option =>
      option.setName('devise').setDescription("Devise utilisée pour l'achat").setRequired(true)
        .addChoices(
          { name: 'Écus 💰', value: 'ecus' },
          { name: 'Cristaux Noirs 🔮', value: 'cristaux' },
          { name: 'Points de Fidélité ⭐', value: 'points' }
        ))
    .addStringOption(option =>
      option.setName('rarete').setDescription("Rareté de l'article").setRequired(true)
        .addChoices(
          { name: 'Commun', value: 'Commun' },
          { name: 'Rare', value: 'Rare' },
          { name: 'Épique', value: 'Épique' },
          { name: 'Légendaire', value: 'Légendaire' }
        ))
    .addBooleanOption(option =>
      option.setName('equipable').setDescription("L'article est-il équipable ?").setRequired(true))
    .addIntegerOption(option =>
      option.setName('stock').setDescription("Quantité en stock").setRequired(true))
    .addStringOption(option =>
      option.setName('categorie').setDescription("Catégorie de l'article").setRequired(true)
        .addChoices(
          { name: 'Casque 🪖', value: 'casque' },
          { name: 'Cuirasse 🛡️', value: 'cuirasse' },
          { name: 'Gantelet 🧤', value: 'gantelet' },
          { name: 'Grève 🦵', value: 'greve' },
          { name: 'Solerets 👢', value: 'solerets' },
          { name: 'Épaulettes 🏋️', value: 'epaulettes' },
          { name: 'Cape 🧥', value: 'cape' },
          { name: 'Manchettes 🎽', value: 'manchettes' },
          { name: 'Anneaux 💍', value: 'anneaux' },
          { name: 'Pendentifs 📿', value: 'pendentifs' },
          { name: 'Arme D 🗡️', value: 'arme D' },
          { name: 'Arme G 🛡️', value: 'arme G' }
        ))
    .addStringOption(option =>
      option.setName('boutique').setDescription("Boutique de destination").setRequired(true)
        .addChoices(
          { name: 'Boutique 🏪', value: 'boutique' },
          { name: 'Dark Boutique 🌑', value: 'dark_boutique' },
          { name: 'Boutique VIP 💎', value: 'boutique_vip' }
        ))
    .addStringOption(option =>
      option.setName('image').setDescription("URL de l'image (requis pour la boutique VIP)").setRequired(false))
    .addStringOption(option =>
      option.setName('bonus').setDescription("Bonus des stats (ex: force:10)").setRequired(false))
    .addStringOption(option =>
      option.setName('malus').setDescription("Malus des stats (ex: force:-10)").setRequired(false)),

  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      return interaction.reply({
        embeds: [createErrorEmbed("Accès refusé 🚫", "Vous n'avez pas la permission d'utiliser cette commande.")],
        ephemeral: true
      });
    }

    const bonus = parseStats(interaction.options.getString('bonus'));
    const malus = parseStats(interaction.options.getString('malus'));

    const statsList = ['force', 'agilite', 'vitesse', 'intelligence', 'dexterite', 'vitalite', 'charisme', 'chance'];
    
    const stats = {};

    statsList.forEach(stat => {
      stats[stat] = {
        bonus: bonus[stat] || 0,
        malus: malus[stat] || 0
      };
    });

    const itemData = {
      name: interaction.options.getString('nom'),
      description: interaction.options.getString('description'),
      price: interaction.options.getInteger('prix'),
      devise: interaction.options.getString('devise'),
      rarete: interaction.options.getString('rarete'),
      equipable: interaction.options.getBoolean('equipable'),
      stock: interaction.options.getInteger('stock'),
      categorie: interaction.options.getString('categorie'),
      boutique: interaction.options.getString('boutique'),
      image: interaction.options.getString('image'),
      stats
    };

    try {
      const nouvelItem = new Item(itemData);
      await nouvelItem.save();

      const fields = [
        { name: 'Prix', value: `${itemData.price} ${itemData.devise}`, inline: true },
        { name: 'Rareté', value: itemData.rarete, inline: true },
        { name: 'Équipable', value: itemData.equipable ? 'Oui ✅' : 'Non ❌', inline: true },
        { name: 'Stock', value: `${itemData.stock}`, inline: true },
        { name: 'Catégorie', value: itemData.categorie, inline: true },
        { name: 'Boutique', value: itemData.boutique, inline: true },
        ...statsList.map(stat => ({
          name: `${stat.charAt(0).toUpperCase() + stat.slice(1)} 📊`,
          value: `Bonus: ${itemData.stats[stat].bonus} | Malus: ${itemData.stats[stat].malus}`,
          inline: true
        }))
      ];

      const embed = createSuccessEmbed(`✅ Article créé : ${itemData.name}`, itemData.description, fields);

      if (itemData.image) {
        embed.setImage(itemData.image);
      }

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      await interaction.reply({
        embeds: [createErrorEmbed("❌ Erreur", "Une erreur est survenue lors de la création de l'article.")],
        ephemeral: true
      });
    }
  }
},

{
    data: new SlashCommandBuilder()
        .setName('voir_boutique')
        .setDescription('Affiche tous les articles d’une boutique spécifique 🛒')
        .addStringOption(option =>
            option.setName('boutique')
                .setDescription("Sélectionnez la boutique à afficher 🏬")
                .setRequired(true)
                .addChoices(
                    { name: 'Boutique Standard 🏪', value: 'boutique' },
                    { name: 'Dark Boutique 🌑', value: 'dark_boutique' },
                    { name: 'Boutique VIP 💎', value: 'boutique_vip' }
                )
        ),

    async execute(interaction) {
        await interaction.deferReply(); 

        try {
            const boutique = interaction.options.getString('boutique');

            
            const items = await Item.find({ boutique });

            if (!items || items.length === 0) {
                return interaction.editReply({ content: '❌ Aucun article disponible dans cette boutique.' });
            }

            
            const boutiqueColors = {
                boutique: 0x0099FF, 
                dark_boutique: 0x990000, 
                boutique_vip: 0xFFD700 
            };

            
            const embed = new EmbedBuilder()
                .setColor(boutiqueColors[boutique])
                .setTitle(`🛒 Articles de la ${boutique === 'dark_boutique' ? 'Dark Boutique 🌑' : boutique === 'boutique_vip' ? 'Boutique VIP 💎' : 'Boutique Standard 🏪'}`)
                .setDescription("Voici la liste des articles disponibles dans cette boutique :")
                .setTimestamp()
                .setFooter({ text: 'Système économique du bot' });

            
            items.forEach(item => {
                embed.addFields({
                    name: `**${item.name}** - 💰 ${item.price} ${item.devise}`,
                    value: `📜 ${item.description}\n🛒 **Stock** : ${item.stock} | 🔮 **Rareté** : ${item.rarete}`,
                    inline: false
                });
            });

            return interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("Erreur lors de l'exécution de la commande /voir_boutique :", error);
            return interaction.editReply({ content: '❌ Une erreur est survenue, réessayez plus tard.' });
        }
    }
},
{
    data: new SlashCommandBuilder()
    .setName('acheter')
    .setDescription('Achète un article dans la boutique 🛍️')
    .addStringOption(option =>
      option.setName('nom').setDescription("Nom de l'article à acheter").setRequired(true))
    .addIntegerOption(option =>
      option.setName('quantite').setDescription("Quantité souhaitée").setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();

    const userId = interaction.user.id;
    const username = interaction.user.username;
    const itemName = interaction.options.getString('nom');
    const quantity = interaction.options.getInteger('quantite');

    if (quantity <= 0) {
      return interaction.editReply({
        embeds: [createErrorEmbed("❌ Quantité invalide", "La quantité doit être supérieure à zéro.")]
      });
    }


    const item = await Item.findOne({ name: itemName });
    if (!item) {
      return interaction.editReply({
        embeds: [createErrorEmbed("❌ Article introuvable", "Cet article n’existe pas dans la boutique.")]
      });
    }


    const userEconomie = await Economie.findOne({ userId });
    const devise = item.devise;
    const deviseNom = deviseLabels[devise] || devise;
    const totalPrix = item.price * quantity;

    if (!userEconomie || userEconomie[devise] < totalPrix) {
      return interaction.editReply({
        embeds: [createErrorEmbed("❌ Fonds insuffisants", `Tu n'as pas assez de ${deviseNom} pour acheter cet article.`)]
      });
    }


    if (item.stock < quantity) {
      return interaction.editReply({
        embeds: [createErrorEmbed("❌ Stock insuffisant", `Stock disponible : ${item.stock}`)]
      });
    }

    
    userEconomie[devise] -= totalPrix;
    await userEconomie.save();

    
    item.stock -= quantity;
    await item.save();

    
    let userInventaire = await Inventaire.findOne({ userId });
    if (!userInventaire) {
      userInventaire = new Inventaire({ userId, items: [] });
    }


    const existingItem = userInventaire.items.find(i => i.itemId.equals(item._id));
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      userInventaire.items.push({ itemId: item._id, quantity });
    }

    await userInventaire.save();

    
    return interaction.editReply({
      embeds: [
        createSuccessEmbed(
          '🛍️ Achat réussi !',
          `Tu as acheté **${quantity}x ${item.name}** pour **${totalPrix} ${deviseNom}**.`
        )
      ]
    });
  }
},

{
    data: new SlashCommandBuilder()
        .setName('inventaire')
        .setDescription("Affiche ton inventaire 📦")
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription("Voir l'inventaire d'un autre utilisateur")
                .setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('utilisateur') || interaction.user;
        const userId = user.id;

        try {
            
            let userInventaire = await Inventaire.findOne({ userId }).populate('items.itemId');

            if (!userInventaire || userInventaire.items.length === 0) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setTitle(`📦 Inventaire de ${user.username}`)
                            .setDescription("❌ Ton inventaire est vide !")
                            .setFooter({ text: "Système économique du bot" })
                            .setTimestamp()
                    ],
                    ephemeral: true
                });
            }

            
            const categoryEmojis = {
                casque: "🪖",
                cuirasse: "🛡️",
                gantelet: "🧤",
                greve: "🦵",
                solerets: "👢",
                epaulettes: "🏋️",
                cape: "🧥",
                manchettes: "🎽",
                anneaux: "💍",
                pendentifs: "📿",
                "arme D": "🗡️",
                "arme G": "🛡️"
            };

            
            const currencyEmojis = {
                ecus: "💰",
                cristaux: "🔮",
                points: "⭐"
            };

            
            const fields = userInventaire.items.map(i => {
                const item = i.itemId;
                const categoryEmoji = categoryEmojis[item.categorie] || "📦";
                const currencyEmoji = currencyEmojis[item.devise] || "💵";

                return {
                    name: `${categoryEmoji} ${item.name}`,
                    value: `📜 **${item.description}**\n🔢 **Quantité**: ${i.quantity}\n💰 **Valeur**: ${item.price} ${currencyEmoji}`,
                    inline: false
                };
            });

            
            const embeds = [];
            for (let i = 0; i < fields.length; i += 25) {
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`📦 Inventaire de ${user.username}`)
                    .setDescription("Voici les objets que tu possèdes :")
                    .addFields(fields.slice(i, i + 25))
                    .setFooter({ text: "Système économique du bot" })
                    .setTimestamp();
                embeds.push(embed);
            }

            return interaction.reply({ embeds });

        } catch (error) {
            console.error(error);
            return interaction.reply({
                content: "❌ Une erreur est survenue lors de la récupération de l'inventaire."});
        }
    }
},

{
  data: new SlashCommandBuilder()
  .setName('revendre')
  .setDescription("Revends un objet de ton inventaire pour de la monnaie 💰")
  .addStringOption(option =>
    option.setName('objet')
      .setDescription("Nom de l'objet à revendre 📦")
      .setRequired(true)
  ),

async execute(interaction) {
  const userId = interaction.user.id;
  const username = interaction.user.username;
  const itemName = interaction.options.getString('objet');

  try {
    const item = await Item.findOne({ name: { $regex: new RegExp(`^${itemName}$`, 'i') } });
    if (!item) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Objet introuvable", `L'objet **${itemName}** n'existe pas.`)],
        ephemeral: true
      });
    }

    const userInventaire = await Inventaire.findOne({ userId });
    if (!userInventaire || !userInventaire.items.some(i => i.itemId.equals(item._id))) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Vente impossible", `Tu ne possèdes pas **${item.name}** dans ton inventaire.`)],
        ephemeral: true
      });
    }

    const resaleValue = Math.floor(item.price * 0.5);
    const deviseNom = deviseLabels[item.devise] || item.devise;

    let userEconomie = await Economie.findOne({ userId });
    if (!userEconomie) {
      userEconomie = new Economie({ userId, ecus: 0, cristauxNoirs: 0, pointsFidelite: 0 });
    }

    userEconomie[item.devise] += resaleValue;
    await userEconomie.save();

    userInventaire.items = userInventaire.items.filter(i => !i.itemId.equals(item._id));
    await userInventaire.save();

    const categoryEmojis = {
      casque: "🪖", cuirasse: "🛡️", gantelet: "🧤", greve: "🦵", solerets: "👢",
      epaulettes: "🏋️", cape: "🧥", manchettes: "🎽", anneaux: "💍", pendentifs: "📿",
      "arme D": "🗡️", "arme G": "🛡️"
    };
    const itemEmoji = categoryEmojis[item.categorie] || "📦";

    const embed = createSuccessEmbed(
      "✅ Vente réussie !",
      `Tu as vendu **${itemEmoji} ${item.name}** pour **${resaleValue} ${deviseNom}**.`,
      [
        { name: "📜 Description", value: item.description, inline: false },
        { name: "💰 Valeur de revente", value: `${resaleValue} ${deviseNom}`, inline: true },
        { name: "🗑️ Supprimé de l'inventaire", value: "✅ Oui", inline: true }
      ]
    );

    return interaction.reply({ embeds: [embed] });

  } catch (error) {
    console.error("❌ Erreur lors de la vente :", error);
    return interaction.reply({
      embeds: [createErrorEmbed("❌ Erreur interne", "Une erreur est survenue lors de la vente.")],
      ephemeral: true
    });
  }
}
},

{
    data: new SlashCommandBuilder()
        .setName('infos_item')
        .setDescription("Affiche les informations détaillées d'un item 🔍")
        .addStringOption(option =>
            option.setName('objet')
                .setDescription("Nom de l'objet à inspecter 📦")
                .setRequired(true)),

    async execute(interaction) {
        const itemName = interaction.options.getString('objet');

        try {
            console.log(`🔎 Recherche de l'objet : ${itemName}`);

            
            const item = await Item.findOne({ name: { $regex: new RegExp(`^${itemName}$`, 'i') } });

            if (!item) {
                console.log(`❌ Objet non trouvé : ${itemName}`);
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setTitle("❌ Objet introuvable !")
                            .setDescription(`L'objet **${itemName}** n'existe pas dans la boutique.`)
                            .setTimestamp()
                            .setFooter({ text: "Système économique du bot" })
                    ],
                    ephemeral: true
                });
            }

            console.log(`✅ Objet trouvé : ${item.name}`);

            
            const categoryEmojis = {
                casque: "🪖",
                cuirasse: "🛡️",
                gantelet: "🧤",
                greve: "🦵",
                solerets: "👢",
                epaulettes: "🏋️",
                cape: "🧥",
                manchettes: "🎽",
                anneaux: "💍",
                pendentifs: "📿",
                "arme D": "🗡️",
                "arme G": "🛡️"
            };

            
            const rarityColors = {
                Commun: 0xA0A0A0,       
                Rare: 0x0084FF,         
                Épique: 0x800080,       
                Légendaire: 0xFFD700    
            };


            const currencyEmojis = {
                ecus: "💰",
                cristaux: "🔮",
                points: "⭐"
            };

            
            const shopEmojis = {
                boutique: "🏪",
                dark_boutique: "🌑",
                boutique_vip: "💎"
            };

            
            const itemEmoji = categoryEmojis[item.categorie] || "📦";

            
            let statsText = "Aucune statistique.";
            if (item.stats && Object.keys(item.stats).length > 0) {
                statsText = Object.entries(item.stats)
                    .map(([stat, values]) => `**${stat}**: +${values.bonus} | -${values.malus}`)
                    .join("\n");
            }

            
            const embed = new EmbedBuilder()
                .setColor(rarityColors[item.rarete] || 0xFFFFFF)
                .setTitle(`${itemEmoji} **${item.name}**`)
                .setDescription(`📜 **Description** : ${item.description}`)
                .addFields(
                    { name: "💎 Rareté", value: item.rarete, inline: true },
                    { name: "💰 Prix", value: `${item.price} ${currencyEmojis[item.devise] || "💵"}`, inline: true },
                    { name: "📦 Stock", value: `${item.stock}`, inline: true },
                    { name: "🏬 Boutique", value: `${shopEmojis[item.boutique] || "🏪"} ${item.boutique}`, inline: true },
                    { name: "🛡️ Catégorie", value: `${itemEmoji} ${item.categorie}`, inline: true },
                    { name: "📊 Statistiques", value: statsText, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: "Système économique du bot" });

            
            if (item.image) {
                embed.setImage(item.image);
            }

            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(`❌ Erreur lors de l'affichage des informations de l'item :`, error);
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle("❌ Erreur interne")
                        .setDescription("Une erreur est survenue lors de la récupération des informations.")
                        .setTimestamp()
                        .setFooter({ text: "Système économique du bot" })
                ],
                ephemeral: true
            });
        }
    }
},

{
    data: new SlashCommandBuilder()
        .setName('equiper')
        .setDescription("Équipe un objet de ton inventaire 📦")
        .addStringOption(option =>
            option.setName('objet')
                .setDescription("Nom de l'objet à équiper")
                .setRequired(true)),

    async execute(interaction) {
        const userId = interaction.user.id;
        const itemName = interaction.options.getString('objet');

        try {
            
            const item = await Item.findOne({ name: itemName });
            if (!item) {
                return interaction.reply({ content: "❌ Cet objet n'existe pas.", ephemeral: true });
            }

            
            if (!item.equipable) {
                return interaction.reply({ content: "❌ Cet objet ne peut pas être équipé.", ephemeral: true });
            }

            
            const userInventaire = await Inventaire.findOne({ userId });
            if (!userInventaire) {
                return interaction.reply({ content: "❌ Tu ne possèdes pas d'inventaire.", ephemeral: true });
            }

            
            const itemIndex = userInventaire.items.findIndex(i => i.itemId.equals(item._id));
            if (itemIndex === -1 || userInventaire.items[itemIndex].quantity <= 0) {
                return interaction.reply({ content: "❌ Tu ne possèdes pas cet objet en quantité suffisante.", ephemeral: true });
            }

            
            let userEquipement = await Equipement.findOne({ userId });
            if (!userEquipement) {
                userEquipement = new Equipement({ userId, equipement: {} });
            }

            
            const slot = item.categorie; 
            const equipementActuel = userEquipement.equipement[slot];

            
            let userStats = await Stats.findOne({ userId });
            if (!userStats) {
                userStats = new Stats({ userId });
            }

            
            if (equipementActuel) {
                const oldItem = await Item.findById(equipementActuel);
                if (oldItem) {
                    
                    const existingIndex = userInventaire.items.findIndex(i => i.itemId.equals(oldItem._id));
                    if (existingIndex !== -1) {
                        userInventaire.items[existingIndex].quantity += 1; 
                    } else {
                        userInventaire.items.push({ itemId: oldItem._id, quantity: 1 });
                    }
                }
            }

            
            userEquipement.equipement[slot] = item._id;

            
            userInventaire.items[itemIndex].quantity -= 1;
            if (userInventaire.items[itemIndex].quantity <= 0) {
                userInventaire.items.splice(itemIndex, 1); 
            }

            
            await userInventaire.save();
            await userEquipement.save();

            
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle(`✅ ${interaction.user.username} a équipé ${item.name} !`)
                .setDescription("L'équipement a été mis à jour avec succès.")
                .addFields(
                    { name: "📜 Description", value: item.description },
                    { name: "🛡️ Équipé à", value: slot, inline: true },
                    { name: "📈 Bonus", value: Object.entries(item.stats).map(([stat, values]) => `+${values.bonus} ${stat}`).join("\n") || "Aucun", inline: true },
                    { name: "📉 Malus", value: Object.entries(item.stats).map(([stat, values]) => `-${values.malus} ${stat}`).join("\n") || "Aucun", inline: true }
                )
                .setTimestamp()
                .setFooter({ text: "Système d'équipement du bot" });

            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "❌ Une erreur est survenue lors de l'équipement.", ephemeral: true });
        }
    }
},

{
    data: new SlashCommandBuilder()
        .setName('desequiper')
        .setDescription("Retire un objet équipé et le remet dans l'inventaire. 🛡️")
        .addStringOption(option =>
            option.setName('objet')
                .setDescription("Nom de l'objet à déséquiper 📦")
                .setRequired(true)),

    async execute(interaction) {
        const userId = interaction.user.id;
        const itemName = interaction.options.getString('objet');

        try {
            console.log(`🔎 Recherche de l'objet : ${itemName}`);

            
            const item = await Item.findOne({ name: { $regex: new RegExp(`^${itemName}$`, 'i') } });

            if (!item) {
                console.log(`❌ Objet non trouvé : ${itemName}`);
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setTitle("❌ Objet introuvable !")
                            .setDescription(`L'objet **${itemName}** n'existe pas.`)
                            .setTimestamp()
                            .setFooter({ text: "Système d'équipement du bot" })
                    ],
                    ephemeral: true
                });
            }

            console.log(`✅ Objet trouvé : ${item.name} (ID: ${item._id})`);

            
            const userEquipement = await Equipement.findOne({ userId });

            if (!userEquipement) {
                console.log(`❌ L'utilisateur n'a aucun équipement.`);
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setTitle("❌ Impossible de déséquiper !")
                            .setDescription("Tu n'as aucun équipement actif.")
                            .setTimestamp()
                            .setFooter({ text: "Système d'équipement du bot" })
                    ],
                    ephemeral: true
                });
            }


            const itemIdString = item._id.toString();
            const slot = Object.keys(userEquipement.equipement).find(
                key => userEquipement.equipement[key] && userEquipement.equipement[key].toString() === itemIdString
            );

            if (!slot) {
                console.log(`❌ L'objet n'est pas équipé.`);
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setTitle("❌ Impossible de déséquiper !")
                            .setDescription(`Tu n'as pas **${item.name}** équipé.`)
                            .setTimestamp()
                            .setFooter({ text: "Système d'équipement du bot" })
                    ],
                    ephemeral: true
                });
            }

            console.log(`✅ Objet trouvé dans l'emplacement : ${slot}`);


            await Equipement.updateOne(
                { userId },
                { $unset: { [`equipement.${slot}`]: 1 } }
            );

            console.log(`✅ Objet retiré de l'équipement !`);


            let userInventaire = await Inventaire.findOne({ userId });

            if (!userInventaire) {
                userInventaire = new Inventaire({ userId, items: [] });
            }


            const existingItem = userInventaire.items.find(i => i.itemId.equals(item._id));
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                userInventaire.items.push({ itemId: item._id, quantity: 1 });
            }

            await userInventaire.save();

            console.log(`✅ Objet déséquipé et ajouté à l'inventaire.`);


            const categoryEmojis = {
                casque: "🪖",
                cuirasse: "🛡️",
                gantelet: "🧤",
                greve: "🦵",
                solerets: "👢",
                epaulettes: "🏋️",
                cape: "🧥",
                manchettes: "🎽",
                anneaux: "💍",
                pendentifs: "📿",
                "arme D": "🗡️",
                "arme G": "🛡️"
            };


            const itemEmoji = categoryEmojis[item.categorie] || "📦";


            const embed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle(`✅ ${interaction.user.username} a déséquipé un objet !`)
                .setDescription(`L'objet **${itemEmoji} ${item.name}** a été retiré et ajouté à ton inventaire.`)
                .addFields(
                    { name: "📜 Description", value: item.description, inline: false },
                    { name: "🛡️ Emplacement", value: slot, inline: true },
                    { name: "🔄 Ajouté dans l'inventaire", value: "✅ Oui", inline: true }
                )
                .setTimestamp()
                .setFooter({ text: "Système d'équipement du bot" });

            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(`❌ Erreur lors du déséquipement :`, error);
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle("❌ Erreur interne")
                        .setDescription("Une erreur est survenue lors du déséquipement.")
                        .setTimestamp()
                        .setFooter({ text: "Système d'équipement du bot" })
                ],
                ephemeral: true
            });
        }
    }
}, 

{
  data: new SlashCommandBuilder()
  .setName('marketplace')
  .setDescription('Affiche les items disponibles sur le marketplace'),

async execute(interaction) {
  try {
    const itemsEnVente = await Marketplace.find().populate('itemId');

    if (!itemsEnVente.length) {
      return interaction.reply({
        embeds: [createErrorEmbed("🛒 Aucun article", "Aucun item n'est disponible sur le marketplace pour le moment.")],
        ephemeral: true
      });
    }

    const embed = createSuccessEmbed(
      '🛒 Marketplace - Articles en vente',
      'Voici les articles actuellement disponibles sur le marketplace :'
    );

    itemsEnVente.forEach(vente => {
      embed.addFields({
        name: `🔹 ${vente.itemId.name}`,
        value: `📦 Quantité : **${vente.quantity}**\n💰 Prix : **${vente.price} ${vente.devise}**\n🛒 Vendeur : <@${vente.sellerId}>`,
        inline: false
      });
    });

    await interaction.reply({ embeds: [embed] });

  } catch (error) {
    console.error("❌ Erreur marketplace :", error);
    await interaction.reply({
      embeds: [createErrorEmbed("❌ Erreur interne", "Une erreur est survenue lors de la récupération du marketplace.")],
      ephemeral: true
    });
  }
}
},

{
  data: new SlashCommandBuilder()
  .setName('ajouter-au-marketplace')
  .setDescription("Ajoute un item de votre inventaire au marketplace")
  .addStringOption(option =>
    option.setName('item').setDescription("Nom de l'item à vendre").setRequired(true))
  .addIntegerOption(option =>
    option.setName('quantite').setDescription("Quantité à vendre").setRequired(true).setMinValue(1))
  .addIntegerOption(option =>
    option.setName('prix').setDescription("Prix de vente").setRequired(true).setMinValue(1))
  .addStringOption(option =>
    option.setName('devise').setDescription("Devise de la vente").setRequired(true)
      .addChoices(
        { name: '💰 Écus', value: 'ecus' },
        { name: '🔮 Cristaux', value: 'cristaux' },
        { name: '⭐ Points', value: 'points' }
      )),

async execute(interaction) {
  const userId = interaction.user.id;
  const itemName = interaction.options.getString('item');
  const quantite = interaction.options.getInteger('quantite');
  const prix = interaction.options.getInteger('prix');
  const devise = interaction.options.getString('devise');
  const deviseNom = deviseLabels[devise] || devise;

  try {
    const item = await Item.findOne({ name: itemName });
    if (!item) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Item introuvable", "Cet item n'existe pas.")],
        ephemeral: true
      });
    }

    const inventaire = await Inventaire.findOne({ userId });
    if (!inventaire) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Inventaire vide", "Vous ne possédez aucun inventaire.")],
        ephemeral: true
      });
    }

    const itemIndex = inventaire.items.findIndex(i => i.itemId.toString() === item._id.toString());
    if (itemIndex === -1 || inventaire.items[itemIndex].quantity < quantite) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Quantité insuffisante", "Vous n'avez pas assez de cet item en stock.")],
        ephemeral: true
      });
    }

    inventaire.items[itemIndex].quantity -= quantite;
    if (inventaire.items[itemIndex].quantity <= 0) {
      inventaire.items.splice(itemIndex, 1);
    }
    await inventaire.save();

    const vente = new Marketplace({
      sellerId: userId,
      itemId: item._id,
      quantity: quantite,
      price: prix,
      devise
    });
    await vente.save();

    const embed = createSuccessEmbed(
      '✅ Ajout au Marketplace',
      'Votre item a été ajouté avec succès au marketplace !',
      [
        { name: '📦 Item', value: `**${item.name}**`, inline: true },
        { name: '📊 Quantité', value: `**${quantite}**`, inline: true },
        { name: '💰 Prix', value: `**${prix} ${deviseNom}**`, inline: true }
      ]
    ).setFooter({ text: 'Marché mis à jour avec succès !' });

    await interaction.reply({ embeds: [embed] });

  } catch (error) {
    console.error("❌ Erreur Marketplace :", error);
    await interaction.reply({
      embeds: [createErrorEmbed("❌ Erreur interne", "Une erreur est survenue lors de l'ajout au marketplace.")],
      ephemeral: true
    });
  }
}
},

{
  data: new SlashCommandBuilder()
  .setName('acheter_marketplace')
  .setDescription("🛒 Achète un objet depuis le Marketplace")
  .addStringOption(option =>
    option.setName('item').setDescription("Nom de l'item à acheter").setRequired(true))
  .addIntegerOption(option =>
    option.setName('quantite').setDescription("Quantité souhaitée").setRequired(true).setMinValue(1)),

async execute(interaction) {
  const userId = interaction.user.id;
  const itemName = interaction.options.getString('item');
  const quantiteAchat = interaction.options.getInteger('quantite');

  try {
    const item = await Item.findOne({ name: itemName });
    if (!item) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Introuvable", "Cet item n'existe pas dans la base de données.")],
        ephemeral: true
      });
    }

    const vente = await Marketplace.findOne({ itemId: item._id }).populate('itemId');
    if (!vente) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Non en vente", "Cet item n'est pas en vente sur le Marketplace.")],
        ephemeral: true
      });
    }

    if (vente.quantity < quantiteAchat) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Stock insuffisant", `Seulement ${vente.quantity} disponible.`)],
        ephemeral: true
      });
    }

    const acheteurEconomie = await Economie.findOne({ userId });
    if (!acheteurEconomie) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Compte requis", "Vous n'avez pas de compte économique.")],
        ephemeral: true
      });
    }

    const totalPrix = vente.price * quantiteAchat;
    const deviseNom = deviseLabels[vente.devise] || vente.devise;

    if (acheteurEconomie[vente.devise] < totalPrix) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Fonds insuffisants", `Vous n'avez pas assez de ${deviseNom} pour cet achat.`)],
        ephemeral: true
      });
    }

    const vendeurEconomie = await Economie.findOne({ userId: vente.sellerId });
    if (!vendeurEconomie) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Vendeur invalide", "Le vendeur n'a pas de compte économique valide.")],
        ephemeral: true
      });
    }

    
    acheteurEconomie[vente.devise] -= totalPrix;
    vendeurEconomie[vente.devise] += totalPrix;
    await acheteurEconomie.save();
    await vendeurEconomie.save();

    
    let acheteurInventaire = await Inventaire.findOne({ userId });
    if (!acheteurInventaire) {
      acheteurInventaire = new Inventaire({ userId, items: [] });
    }

    const itemIndex = acheteurInventaire.items.findIndex(i => i.itemId.equals(item._id));
    if (itemIndex !== -1) {
      acheteurInventaire.items[itemIndex].quantity += quantiteAchat;
    } else {
      acheteurInventaire.items.push({ itemId: item._id, quantity: quantiteAchat });
    }
    await acheteurInventaire.save();

    
    vente.quantity -= quantiteAchat;
    if (vente.quantity <= 0) {
      await Marketplace.findByIdAndDelete(vente._id);
    } else {
      await vente.save();
    }

    const embed = createSuccessEmbed(
      '🛒 Achat effectué !',
      `Vous avez acheté **${quantiteAchat}x ${vente.itemId.name}** sur le Marketplace.`,
      [
        { name: '💰 Montant payé', value: `${totalPrix} ${deviseNom}`, inline: true },
        { name: '📦 Nouvel Inventaire', value: `L'item a été ajouté à votre inventaire.`, inline: true }
      ]
    ).setFooter({ text: 'Merci pour votre achat sur le Marketplace !' });

    return interaction.reply({ embeds: [embed] });

  } catch (error) {
    console.error("❌ Erreur achat marketplace :", error);
    return interaction.reply({
      embeds: [createErrorEmbed("❌ Erreur interne", "Une erreur est survenue lors de l'achat.")],
      ephemeral: true
    });
  }
}
},

{
  data: new SlashCommandBuilder()
  .setName('retirer_marketplace')
  .setDescription("Retire un item que vous avez mis en vente sur le marketplace.")
  .addStringOption(option =>
    option.setName('item').setDescription("Nom de l'item à retirer").setRequired(true)
  ),

async execute(interaction) {
  const userId = interaction.user.id;
  const itemName = interaction.options.getString('item');

  try {
    const item = await Item.findOne({ name: itemName });
    if (!item) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Introuvable", "Cet item n'existe pas.")],
        ephemeral: true
      });
    }

    const vente = await Marketplace.findOne({ itemId: item._id, sellerId: userId });
    if (!vente) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Pas en vente", "Vous n'avez pas mis cet item en vente.")],
        ephemeral: true
      });
    }

    const economie = await Economie.findOne({ userId });
    if (!economie) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Aucun compte", "Vous n'avez pas de compte économique.")],
        ephemeral: true
      });
    }

    const deviseNom = deviseLabels[vente.devise] || vente.devise;
    const cout = vente.price * 2;

    if (economie[vente.devise] < cout) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Fonds insuffisants", `Il vous faut ${cout} ${deviseNom} pour retirer cette annonce.`)],
        ephemeral: true
      });
    }

    economie[vente.devise] -= cout;
    await economie.save();

    let inventaire = await Inventaire.findOne({ userId });
    if (!inventaire) {
      inventaire = new Inventaire({ userId, items: [] });
    }

    const itemIndex = inventaire.items.findIndex(i => i.itemId.equals(item._id));
    if (itemIndex !== -1) {
      inventaire.items[itemIndex].quantity += vente.quantity;
    } else {
      inventaire.items.push({ itemId: item._id, quantity: vente.quantity });
    }

    await inventaire.save();
    await Marketplace.findByIdAndDelete(vente._id);

    const embed = createSuccessEmbed(
      "✅ Annonce retirée du Marketplace",
      `Vous avez retiré **${item.name}** du marketplace.\n💸 Coût de l'opération : **${cout} ${deviseNom}**.`
    );

    return interaction.reply({ embeds: [embed] });

  } catch (error) {
    console.error("❌ Erreur retrait marketplace :", error);
    return interaction.reply({
      embeds: [createErrorEmbed("❌ Erreur interne", "Une erreur est survenue lors du retrait de l'annonce.")],
      ephemeral: true
    });
  }
}
}

    ]
 }
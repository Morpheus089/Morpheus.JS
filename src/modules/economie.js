const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Stats = require('../database/models/statsModel'); // Importer le modèle pour les stats
const Economie = require('../database/models/economieModel'); // Importer le modèle pour l'économie
const Item = require('../database/models/itemModel'); // Importer le modèle pour la boutique
const Marketplace = require('../database/models/marketplaceModel'); // Importer le modèle pour le Marketplace
const Inventaire = require('../database/models/inventaireModel') // Importer le modèle pour l'inventaire
const Equipement = require('../database/models/equipementModel'); // Assure-toi que le chemin est correct

module.exports = {
    commands: [
        // Commande pour ajouter n'importe quel type de monnaie (seulement pour les admins)
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
                        .setDescription('Type de monnaie à ajouter (écus, cristaux, points)')
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
                // Vérifier si l'utilisateur a les droits d'administrateur
                if (!interaction.member.permissions.has('ADMINISTRATOR')) {
                    const errorEmbed = {
                        color: 0xFF0000,
                        title: 'Erreur ❌',
                        description: "Tu n'as pas les permissions nécessaires pour utiliser cette commande.",
                        timestamp: new Date(),
                        footer: {
                            text: 'Système économique du bot',
                        }
                    };
                    return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }

                const user = interaction.options.getUser('utilisateur');
                const monnaie = interaction.options.getString('monnaie');
                const montant = interaction.options.getInteger('montant');

                if (montant <= 0) {
                    const errorEmbed = {
                        color: 0xFF0000,
                        title: 'Erreur ❌',
                        description: "Le montant doit être supérieur à zéro.",
                        timestamp: new Date(),
                        footer: {
                            text: 'Système économique du bot',
                        }
                    };
                    return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }

                // Trouver l'utilisateur dans la base de données
                let userEconomie = await Economie.findOne({ userId: user.id });
                if (!userEconomie) {
                    userEconomie = new Economie({ userId: user.id });
                }

                // Ajout de la monnaie choisie au solde de l'utilisateur
                if (monnaie === 'ecus') {
                    userEconomie.ecus += montant;
                } else if (monnaie === 'cristaux') {
                    userEconomie.cristauxNoirs += montant;
                } else if (monnaie === 'points') {
                    userEconomie.pointsFidelite += montant;
                }
                
                await userEconomie.save();

                // Créer un embed pour confirmer l'ajout
                const successEmbed = {
                    color: 0x00FF00,
                    title: 'Succès ✅',
                    description: `${montant} ${monnaie} ont été ajoutés au solde de ${user.username}.`,
                    fields: [
                        {
                            name: 'Écus 💰',
                            value: `${userEconomie.ecus}`,
                            inline: true,
                        },
                        {
                            name: 'Cristaux Noirs 🔮',
                            value: `${userEconomie.cristauxNoirs}`,
                            inline: true,
                        },
                        {
                            name: 'Points de Fidélité ⭐',
                            value: `${userEconomie.pointsFidelite}`,
                            inline: true,
                        }
                    ],
                    timestamp: new Date(),
                    footer: {
                        text: 'Système économique du bot',
                    }
                };

                return interaction.reply({ embeds: [successEmbed] });
            }
        },

        // Commande pour enlever n'importe quel type de monnaie (seulement pour les admins)
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
                        .setDescription('Type de monnaie à enlever (écus, cristaux, points)')
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
                // Vérifier si l'utilisateur a les droits d'administrateur
                if (!interaction.member.permissions.has('ADMINISTRATOR')) {
                    const errorEmbed = {
                        color: 0xFF0000,
                        title: 'Erreur ❌',
                        description: "Tu n'as pas les permissions nécessaires pour utiliser cette commande.",
                        timestamp: new Date(),
                        footer: {
                            text: 'Système économique du bot',
                        }
                    };
                    return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }

                const user = interaction.options.getUser('utilisateur');
                const monnaie = interaction.options.getString('monnaie');
                const montant = interaction.options.getInteger('montant');

                if (montant <= 0) {
                    const errorEmbed = {
                        color: 0xFF0000,
                        title: 'Erreur ❌',
                        description: "Le montant doit être supérieur à zéro.",
                        timestamp: new Date(),
                        footer: {
                            text: 'Système économique du bot',
                        }
                    };
                    return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }

                // Trouver l'utilisateur dans la base de données
                let userEconomie = await Economie.findOne({ userId: user.id });
                if (!userEconomie) {
                    const errorEmbed = {
                        color: 0xFF0000,
                        title: 'Erreur ❌',
                        description: "L'utilisateur n'a pas encore de compte économique.",
                        timestamp: new Date(),
                        footer: {
                            text: 'Système économique du bot',
                        }
                    };
                    return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }

                // Vérifier que l'utilisateur a assez de monnaie à enlever
                if (monnaie === 'ecus') {
                    if (userEconomie.ecus < montant) {
                        const errorEmbed = {
                            color: 0xFF0000,
                            title: 'Erreur ❌',
                            description: `${user.username} n'a pas assez d'écus pour cette opération.`,
                            timestamp: new Date(),
                            footer: {
                                text: 'Système économique du bot',
                            }
                        };
                        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }
                    userEconomie.ecus -= montant;
                } else if (monnaie === 'cristaux') {
                    if (userEconomie.cristauxNoirs < montant) {
                        const errorEmbed = {
                            color: 0xFF0000,
                            title: 'Erreur ❌',
                            description: `${user.username} n'a pas assez de cristaux noirs pour cette opération.`,
                            timestamp: new Date(),
                            footer: {
                                text: 'Système économique du bot',
                            }
                        };
                        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }
                    userEconomie.cristauxNoirs -= montant;
                } else if (monnaie === 'points') {
                    if (userEconomie.pointsFidelite < montant) {
                        const errorEmbed = {
                            color: 0xFF0000,
                            title: 'Erreur ❌',
                            description: `${user.username} n'a pas assez de points de fidélité pour cette opération.`,
                            timestamp: new Date(),
                            footer: {
                                text: 'Système économique du bot',
                            }
                        };
                        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }
                    userEconomie.pointsFidelite -= montant;
                }

                await userEconomie.save();

                // Créer un embed pour confirmer la soustraction
                const successEmbed = {
                    color: 0x00FF00,
                    title: 'Succès ✅',
                    description: `${montant} ${monnaie} ont été retirés au solde de ${user.username}.`,
                    fields: [
                        {
                            name: 'Écus 💰',
                            value: `${userEconomie.ecus}`,
                            inline: true,
                        },
                        {
                            name: 'Cristaux Noirs 🔮',
                            value: `${userEconomie.cristauxNoirs}`,
                            inline: true,
                        },
                        {
                            name: 'Points de Fidélité ⭐',
                            value: `${userEconomie.pointsFidelite}`,
                            inline: true,
                        }
                    ],
                    timestamp: new Date(),
                    footer: {
                        text: 'Système économique du bot',
                    }
                };

                return interaction.reply({ embeds: [successEmbed] });
            }
        },

        // Commande pour voir son propre solde économique
        {
            data: new SlashCommandBuilder()
                .setName('solde')
                .setDescription('Vérifie ton solde économique. 💳'),
            async execute(interaction) {
                const userId = interaction.user.id;

                // Trouver les informations économiques de l'utilisateur dans la base de données
                let userEconomie = await Economie.findOne({ userId });

                if (!userEconomie) {
                    // Si l'utilisateur n'a pas encore de données économiques, on les initialise
                    userEconomie = new Economie({ userId });
                    await userEconomie.save();

                    const welcomeEmbed = {
                        color: 0xFFFF00,
                        title: 'Bienvenue ! 👋',
                        description: "Tu n'avais pas de solde, je viens de te créer un compte économique.",
                        timestamp: new Date(),
                        footer: {
                            text: 'Système économique du bot',
                        }
                    };

                    return interaction.reply({ embeds: [welcomeEmbed] });
                }

                // Créer un embed pour afficher le solde de l'utilisateur
                const balanceEmbed = {
                    color: 0x0099FF,
                    title: `${interaction.user.username}, voici ton solde économique ! 💳`,
                    fields: [
                        {
                            name: 'Écus 💰',
                            value: `${userEconomie.ecus}`,
                            inline: true,
                        },
                        {
                            name: 'Cristaux Noirs 🔮',
                            value: `${userEconomie.cristauxNoirs}`,
                            inline: true,
                        },
                        {
                            name: 'Points de Fidélité ⭐',
                            value: `${userEconomie.pointsFidelite}`,
                            inline: true,
                        }
                    ],
                    timestamp: new Date(),
                    footer: {
                        text: 'Système économique du bot',
                    }
                };

                return interaction.reply({ embeds: [balanceEmbed] });
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
        option.setName('bonus').setDescription("Bonus des statistiques (ex : 'force:10,dexterite:20')").setRequired(false))
    .addStringOption(option =>
        option.setName('malus').setDescription("Malus des statistiques (ex : 'force:-10,dexterite:-20')").setRequired(false)),

async execute(interaction) {
    // Vérification du rôle administrateur
    if (!interaction.member.permissions.has('Administrator')) {
        return interaction.reply({ 
            content: "❌ Vous n'avez pas la permission d'utiliser cette commande.", 
            ephemeral: true 
        });
    }

    const statsList = ['force', 'agilite', 'vitesse', 'intelligence', 'dexterite', 'vitalite', 'charisme', 'chance'];

    const parseStats = (str) => {
        const parsed = {};
        if (str) {
            str.split(',').forEach(pair => {
                const [key, value] = pair.split(':').map(p => p.trim().toLowerCase());
                if (statsList.includes(key) && !isNaN(parseInt(value))) {
                    parsed[key] = parseInt(value, 10);
                }
            });
        }
        return parsed;
    };

    const bonusParsed = parseStats(interaction.options.getString('bonus'));
    const malusParsed = parseStats(interaction.options.getString('malus'));

    const stats = {};
    statsList.forEach(stat => {
        stats[stat] = {
            bonus: bonusParsed[stat] || 0,
            malus: malusParsed[stat] || 0
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

        const embed = {
            color: 0x00FF00,
            title: `✅ Article créé avec succès : ${itemData.name}`,
            description: itemData.description,
            fields: [
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
            ],
            timestamp: new Date(),
            footer: { text: 'Système économique du bot' },
            image: itemData.image ? { url: itemData.image } : undefined
        };

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: "❌ Il y a eu une erreur dans la création de l'objet.",
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
        await interaction.deferReply(); // Permet de signaler que la commande est en cours de traitement

        try {
            const boutique = interaction.options.getString('boutique');

            // Recherche des articles dans la boutique sélectionnée
            const items = await Item.find({ boutique });

            if (!items || items.length === 0) {
                return interaction.editReply({ content: '❌ Aucun article disponible dans cette boutique.' });
            }

            // Couleurs personnalisées selon la boutique
            const boutiqueColors = {
                boutique: 0x0099FF, // Bleu pour la boutique standard
                dark_boutique: 0x990000, // Rouge foncé pour la Dark Boutique
                boutique_vip: 0xFFD700 // Doré pour la VIP Boutique
            };

            // Création de l'embed principal
            const embed = new EmbedBuilder()
                .setColor(boutiqueColors[boutique])
                .setTitle(`🛒 Articles de la ${boutique === 'dark_boutique' ? 'Dark Boutique 🌑' : boutique === 'boutique_vip' ? 'Boutique VIP 💎' : 'Boutique Standard 🏪'}`)
                .setDescription("Voici la liste des articles disponibles dans cette boutique :")
                .setTimestamp()
                .setFooter({ text: 'Système économique du bot' });

            // Ajout des articles avec description
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
        option.setName('nom')
            .setDescription("Nom de l'article à acheter")
            .setRequired(true))
    .addIntegerOption(option =>
        option.setName('quantite')
            .setDescription("Quantité souhaitée")
            .setRequired(true)),

async execute(interaction) {
    await interaction.deferReply();

    const userId = interaction.user.id;
    const itemName = interaction.options.getString('nom');
    const quantity = interaction.options.getInteger('quantite');

    if (quantity <= 0) {
        return interaction.editReply({ content: '❌ La quantité doit être supérieure à zéro.' });
    }

    // Vérifier si l'objet existe
    const item = await Item.findOne({ name: itemName });
    if (!item) {
        return interaction.editReply({ content: '❌ Cet article n’existe pas dans la boutique.' });
    }

    // Vérifier si l'utilisateur a assez de monnaie
    const userEconomie = await Economie.findOne({ userId });
    if (!userEconomie || userEconomie[item.devise] < item.price * quantity) {
        return interaction.editReply({ content: `❌ Tu n'as pas assez de ${item.devise} pour acheter cet article.` });
    }

    // Vérifier le stock
    if (item.stock < quantity) {
        return interaction.editReply({ content: `❌ Il n'y a pas assez de stock pour cet article. (Stock disponible: ${item.stock})` });
    }

    // Déduire la monnaie et mettre à jour l'inventaire
    userEconomie[item.devise] -= item.price * quantity;
    await userEconomie.save();

    item.stock -= quantity;
    await item.save();

    let userInventaire = await Inventaire.findOne({ userId });
    if (!userInventaire) {
        userInventaire = new Inventaire({ userId, items: [] });
    }

    // Ajouter ou mettre à jour l'item dans l'inventaire
    const existingItem = userInventaire.items.find(i => i.itemId.equals(item._id));
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        userInventaire.items.push({ itemId: item._id, quantity });
    }

    await userInventaire.save();

    // Répondre avec un embed
    const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('🛍️ Achat réussi !')
        .setDescription(`Tu as acheté **${quantity}x ${item.name}** pour **${item.price * quantity} ${item.devise}**.`)
        .setTimestamp()
        .setFooter({ text: 'Système économique du bot' });

    return interaction.editReply({ embeds: [embed] });
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
            // Récupérer l'inventaire de l'utilisateur et peupler les objets
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

            // Liste des emojis pour les catégories
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

            // Liste des emojis pour les devises
            const currencyEmojis = {
                ecus: "💰",
                cristaux: "🔮",
                points: "⭐"
            };

            // Construire l'affichage des objets
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

            // Limiter à 25 champs max (Discord limite les embeds à 25 fields)
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
                .setRequired(true)),

    async execute(interaction) {
        const userId = interaction.user.id;
        const itemName = interaction.options.getString('objet');

        try {
            console.log(`🔎 Recherche de l'objet à revendre : ${itemName}`);

            // Vérifier si l'objet existe dans la boutique
            const item = await Item.findOne({ name: { $regex: new RegExp(`^${itemName}$`, 'i') } });
            if (!item) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setTitle("❌ Objet introuvable !")
                            .setDescription(`L'objet **${itemName}** n'existe pas.`)
                            .setTimestamp()
                            .setFooter({ text: "Système économique du bot" })
                    ],
                    ephemeral: true
                });
            }

            console.log(`✅ Objet trouvé : ${item.name} (ID: ${item._id})`);

            // Vérifier si l'utilisateur possède cet objet
            const userInventaire = await Inventaire.findOne({ userId });
            if (!userInventaire || !userInventaire.items.some(i => i.itemId.equals(item._id))) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setTitle("❌ Vente impossible !")
                            .setDescription(`Tu ne possèdes pas **${item.name}** dans ton inventaire.`)
                            .setTimestamp()
                            .setFooter({ text: "Système économique du bot" })
                    ],
                    ephemeral: true
                });
            }

            // Définir la valeur de revente (50% du prix d'achat)
            const resaleValue = Math.floor(item.price * 0.5);

            // Vérifier que l'utilisateur a un compte économique
            let userEconomie = await Economie.findOne({ userId });
            if (!userEconomie) {
                userEconomie = new Economie({ userId, ecus: 0, cristauxNoirs: 0, pointsFidelite: 0 });
            }

            // Ajouter la monnaie correspondante
            userEconomie[item.devise] += resaleValue;
            await userEconomie.save();

            console.log(`✅ ${resaleValue} ${item.devise} ajoutés au compte de ${interaction.user.username}`);

            // Supprimer l'item de l'inventaire
            userInventaire.items = userInventaire.items.filter(i => !i.itemId.equals(item._id));
            await userInventaire.save();

            console.log(`✅ Objet supprimé de l'inventaire`);

            // Définition des émojis pour chaque catégorie
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

            // Émoji de la catégorie de l'objet
            const itemEmoji = categoryEmojis[item.categorie] || "📦";

            // Répondre avec un embed
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle(`✅ Vente réussie !`)
                .setDescription(`Tu as vendu **${itemEmoji} ${item.name}** pour **${resaleValue} ${item.devise}**.`)
                .addFields(
                    { name: "📜 Description", value: item.description, inline: false },
                    { name: "💰 Valeur de revente", value: `${resaleValue} ${item.devise}`, inline: true },
                    { name: "🗑️ Supprimé de l'inventaire", value: "✅ Oui", inline: true }
                )
                .setTimestamp()
                .setFooter({ text: "Système économique du bot" });

            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(`❌ Erreur lors de la vente :`, error);
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle("❌ Erreur interne")
                        .setDescription("Une erreur est survenue lors de la vente.")
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

            // Récupérer l'objet par son nom (insensible à la casse)
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

            // Définition des émojis pour chaque catégorie
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

            // Définition des couleurs selon la rareté
            const rarityColors = {
                Commun: 0xA0A0A0,       // Gris
                Rare: 0x0084FF,         // Bleu
                Épique: 0x800080,       // Violet
                Légendaire: 0xFFD700    // Or
            };

            // Définition des émojis pour les devises
            const currencyEmojis = {
                ecus: "💰",
                cristaux: "🔮",
                points: "⭐"
            };

            // Définition des émojis pour les boutiques
            const shopEmojis = {
                boutique: "🏪",
                dark_boutique: "🌑",
                boutique_vip: "💎"
            };

            // Émoji de la catégorie de l'objet
            const itemEmoji = categoryEmojis[item.categorie] || "📦";

            // Construire les stats sous forme de texte
            let statsText = "Aucune statistique.";
            if (item.stats && Object.keys(item.stats).length > 0) {
                statsText = Object.entries(item.stats)
                    .map(([stat, values]) => `**${stat}**: +${values.bonus} | -${values.malus}`)
                    .join("\n");
            }

            // Embed d'affichage des informations de l'item
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

            // Ajouter une image si disponible
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
            // Vérifier si l'objet existe
            const item = await Item.findOne({ name: itemName });
            if (!item) {
                return interaction.reply({ content: "❌ Cet objet n'existe pas.", ephemeral: true });
            }

            // Vérifier si l'objet est équipable
            if (!item.equipable) {
                return interaction.reply({ content: "❌ Cet objet ne peut pas être équipé.", ephemeral: true });
            }

            // Vérifier si l'utilisateur possède cet objet dans son inventaire
            const userInventaire = await Inventaire.findOne({ userId });
            if (!userInventaire) {
                return interaction.reply({ content: "❌ Tu ne possèdes pas d'inventaire.", ephemeral: true });
            }

            // Vérifier si l'objet est présent et récupérer son index
            const itemIndex = userInventaire.items.findIndex(i => i.itemId.equals(item._id));
            if (itemIndex === -1 || userInventaire.items[itemIndex].quantity <= 0) {
                return interaction.reply({ content: "❌ Tu ne possèdes pas cet objet en quantité suffisante.", ephemeral: true });
            }

            // Vérifier et charger l'équipement du joueur
            let userEquipement = await Equipement.findOne({ userId });
            if (!userEquipement) {
                userEquipement = new Equipement({ userId, equipement: {} });
            }

            // Vérifier si un objet est déjà équipé dans ce slot
            const slot = item.categorie; // Exemple: casque, armeD, anneaux, etc.
            const equipementActuel = userEquipement.equipement[slot];

            // Récupérer les stats du joueur
            let userStats = await Stats.findOne({ userId });
            if (!userStats) {
                userStats = new Stats({ userId });
            }

            // Si un objet est déjà équipé, le remettre dans l'inventaire
            if (equipementActuel) {
                const oldItem = await Item.findById(equipementActuel);
                if (oldItem) {
                    // Vérifier si l'objet était déjà présent dans l'inventaire
                    const existingIndex = userInventaire.items.findIndex(i => i.itemId.equals(oldItem._id));
                    if (existingIndex !== -1) {
                        userInventaire.items[existingIndex].quantity += 1; // Ajouter 1 en stock
                    } else {
                        userInventaire.items.push({ itemId: oldItem._id, quantity: 1 }); // Ajouter un nouvel item
                    }
                }
            }

            // Mettre à jour l'équipement du joueur avec le nouvel item
            userEquipement.equipement[slot] = item._id;

            // Retirer seulement **1 exemplaire** de l'inventaire
            userInventaire.items[itemIndex].quantity -= 1;
            if (userInventaire.items[itemIndex].quantity <= 0) {
                userInventaire.items.splice(itemIndex, 1); // Supprime l'item si la quantité tombe à 0
            }

            // Sauvegarder les modifications
            await userInventaire.save();
            await userEquipement.save();

            // Créer un embed pour confirmer l'équipement
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

            // Récupérer l'objet par son nom (insensible à la casse)
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

            // Vérifier si l'utilisateur a cet objet équipé
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

            // Trouver l'emplacement où l'objet est équipé en comparant les IDs
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

            // Retirer l'objet de l'équipement avec une mise à jour explicite
            await Equipement.updateOne(
                { userId },
                { $unset: { [`equipement.${slot}`]: 1 } }
            );

            console.log(`✅ Objet retiré de l'équipement !`);

            // Ajouter l'objet à l'inventaire
            let userInventaire = await Inventaire.findOne({ userId });

            if (!userInventaire) {
                userInventaire = new Inventaire({ userId, items: [] });
            }

            // Vérifier si l'utilisateur a déjà cet objet dans son inventaire
            const existingItem = userInventaire.items.find(i => i.itemId.equals(item._id));
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                userInventaire.items.push({ itemId: item._id, quantity: 1 });
            }

            await userInventaire.save();

            console.log(`✅ Objet déséquipé et ajouté à l'inventaire.`);

            // Définition des émojis pour chaque catégorie
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

            // Émoji de la catégorie de l'objet
            const itemEmoji = categoryEmojis[item.categorie] || "📦";

            // Répondre avec un embed
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
            // Récupérer tous les items en vente
            const itemsEnVente = await Marketplace.find().populate('itemId');

            if (!itemsEnVente.length) {
                return interaction.reply({ content: "🛒 Aucun item n'est disponible sur le marketplace pour le moment.", ephemeral: true });
            }

            // Créer un embed
            const embed = new EmbedBuilder()
                .setColor('#FFD700') // Couleur or
                .setTitle('🛒 Marketplace - Articles en vente')
                .setDescription('Voici les articles actuellement disponibles sur le marketplace :')
                .setTimestamp();

            itemsEnVente.forEach(vente => {
                embed.addFields([
                    {
                        name: `🔹 ${vente.itemId.name}`,
                        value: `📦 Quantité : **${vente.quantity}**\n💰 Prix : **${vente.price} ${vente.devise}**\n🛒 Vendeur : <@${vente.sellerId}>`,
                        inline: false
                    }
                ]);
            });

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Une erreur est survenue lors de la récupération du marketplace.", ephemeral: true });
        }
    }
},

{
    data: new SlashCommandBuilder()
        .setName('ajouter-au-marketplace')
        .setDescription("Ajoute un item de votre inventaire au marketplace")
        .addStringOption(option =>
            option.setName('item')
                .setDescription("Nom de l'item à vendre")
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('quantite')
                .setDescription("Quantité à vendre")
                .setRequired(true)
                .setMinValue(1))
        .addIntegerOption(option =>
            option.setName('prix')
                .setDescription("Prix de vente")
                .setRequired(true)
                .setMinValue(1))
        .addStringOption(option =>
            option.setName('devise')
                .setDescription("Devise de la vente")
                .setRequired(true)
                .addChoices(
                    { name: '💰 Écus', value: 'ecus' },
                    { name: '🔮 Cristaux', value: 'cristaux' },
                    { name: '⭐ Points', value: 'points' }
                )
        ),

    async execute(interaction) {
        const userId = interaction.user.id;
        const itemName = interaction.options.getString('item');
        const quantite = interaction.options.getInteger('quantite');
        const prix = interaction.options.getInteger('prix');
        const devise = interaction.options.getString('devise');

        try {
            // Trouver l'item par son nom
            const item = await Item.findOne({ name: itemName });
            if (!item) {
                return interaction.reply({ content: "❌ Cet item n'existe pas.", ephemeral: true });
            }

            // Vérifier si l'utilisateur possède cet item dans son inventaire
            const inventaire = await Inventaire.findOne({ userId });
            if (!inventaire) {
                return interaction.reply({ content: "❌ Vous ne possédez aucun inventaire.", ephemeral: true });
            }

            // Trouver l'item dans l'inventaire de l'utilisateur
            const itemIndex = inventaire.items.findIndex(i => i.itemId.toString() === item._id.toString());

            if (itemIndex === -1 || inventaire.items[itemIndex].quantity < quantite) {
                return interaction.reply({ content: "❌ Vous n'avez pas assez de cet item en stock.", ephemeral: true });
            }

            // Retirer l'item de l'inventaire
            inventaire.items[itemIndex].quantity -= quantite;
            if (inventaire.items[itemIndex].quantity <= 0) {
                inventaire.items.splice(itemIndex, 1); // Supprime l'item s'il n'en reste plus
            }

            await inventaire.save(); // Sauvegarde l'inventaire mis à jour

            // Ajouter l'item au Marketplace
            const vente = new Marketplace({
                sellerId: userId,
                itemId: item._id,
                quantity: quantite,
                price: prix,
                devise: devise
            });
            await vente.save();

            // Créer un embed de confirmation
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Ajout au Marketplace')
                .setDescription(`Votre item a été ajouté avec succès au marketplace !`)
                .addFields([
                    { name: '📦 Item', value: `**${item.name}**`, inline: true },
                    { name: '📊 Quantité', value: `**${quantite}**`, inline: true },
                    { name: '💰 Prix', value: `**${prix} ${devise}**`, inline: true }
                ])
                .setFooter({ text: 'Marché mis à jour avec succès !' });

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Une erreur est survenue lors de l'ajout au marketplace.", ephemeral: true });
        }
    }
},

{
    data: new SlashCommandBuilder()
        .setName('acheter_marketplace')
        .setDescription("🛒 Achète un objet depuis le Marketplace")
        .addStringOption(option =>
            option.setName('item')
                .setDescription("Nom de l'item à acheter")
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('quantite')
                .setDescription("Quantité souhaitée")
                .setRequired(true)
                .setMinValue(1)),

    async execute(interaction) {
        const userId = interaction.user.id;
        const itemName = interaction.options.getString('item');
        const quantiteAchat = interaction.options.getInteger('quantite');

        try {
            // Trouver l'ID de l'item correspondant au nom donné
            const item = await Item.findOne({ name: itemName });
            if (!item) {
                return interaction.reply({ content: "❌ Cet item n'existe pas dans la base de données.", ephemeral: true });
            }

            // Trouver une offre du Marketplace pour cet item
            const vente = await Marketplace.findOne({ itemId: item._id }).populate('itemId');
            if (!vente) {
                return interaction.reply({ content: "❌ Cet item n'est pas en vente sur le Marketplace.", ephemeral: true });
            }

            // Vérifier si la quantité demandée est disponible
            if (vente.quantity < quantiteAchat) {
                return interaction.reply({ content: `❌ Seulement **${vente.quantity}** de cet item sont disponibles.`, ephemeral: true });
            }

            // Vérifier l'économie de l'acheteur
            const acheteurEconomie = await Economie.findOne({ userId });
            if (!acheteurEconomie) {
                return interaction.reply({ content: "❌ Vous n'avez pas de compte économique.", ephemeral: true });
            }

            // Vérifier si l'acheteur a assez d'argent
            const totalPrix = vente.price * quantiteAchat;
            if (acheteurEconomie[vente.devise] < totalPrix) {
                return interaction.reply({ content: `❌ Vous n'avez pas assez de **${vente.devise}** pour acheter cet item.`, ephemeral: true });
            }

            // Vérifier l'économie du vendeur
            const vendeurEconomie = await Economie.findOne({ userId: vente.sellerId });
            if (!vendeurEconomie) {
                return interaction.reply({ content: "❌ Le vendeur n'a pas de compte économique valide.", ephemeral: true });
            }

            // Déduire l'argent de l'acheteur et ajouter au vendeur
            acheteurEconomie[vente.devise] -= totalPrix;
            vendeurEconomie[vente.devise] += totalPrix;

            await acheteurEconomie.save();
            await vendeurEconomie.save();

            // Ajouter l'item dans l'inventaire de l'acheteur
            let acheteurInventaire = await Inventaire.findOne({ userId });
            if (!acheteurInventaire) {
                acheteurInventaire = new Inventaire({ userId, items: [] });
            }

            // Vérifier si l'acheteur possède déjà cet item
            const itemIndex = acheteurInventaire.items.findIndex(i => i.itemId.equals(item._id));
            if (itemIndex !== -1) {
                acheteurInventaire.items[itemIndex].quantity += quantiteAchat;
            } else {
                acheteurInventaire.items.push({ itemId: item._id, quantity: quantiteAchat });
            }

            await acheteurInventaire.save();

            // Mettre à jour ou supprimer l'offre du Marketplace
            vente.quantity -= quantiteAchat;
            if (vente.quantity <= 0) {
                await Marketplace.findByIdAndDelete(vente._id); // Supprime si stock épuisé
            } else {
                await vente.save();
            }

            // Créer un embed de confirmation
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('🛒 Achat effectué !')
                .setDescription(`Vous avez acheté **${quantiteAchat}x ${vente.itemId.name}** sur le Marketplace.`)
                .addFields(
                    { name: '💰 Montant payé', value: `${totalPrix} ${vente.devise}`, inline: true },
                    { name: '📦 Nouvel Inventaire', value: `Vous possédez maintenant cet item !`, inline: true }
                )
                .setFooter({ text: 'Merci pour votre achat sur le Marketplace !' });

            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "❌ Une erreur est survenue lors de l'achat.", ephemeral: true });
        }
    }
},

{
    data: new SlashCommandBuilder()
        .setName('retirer_marketplace')
        .setDescription("Retire un item que vous avez mis en vente sur le marketplace.")
        .addStringOption(option =>
            option.setName('item')
                .setDescription("Nom de l'item à retirer")
                .setRequired(true)),

    async execute(interaction) {
        const userId = interaction.user.id;
        const itemName = interaction.options.getString('item');

        try {
            // Trouver l'item sur le Marketplace
            const item = await Item.findOne({ name: itemName });
            if (!item) {
                return interaction.reply({ content: "❌ Cet item n'existe pas.", ephemeral: true });
            }

            // Trouver l'annonce sur le Marketplace
            const vente = await Marketplace.findOne({ itemId: item._id, sellerId: userId });
            if (!vente) {
                return interaction.reply({ content: "❌ Vous n'avez pas mis cet item en vente.", ephemeral: true });
            }

            // Vérifier l'économie du vendeur (celui qui retire l'annonce)
            const economie = await Economie.findOne({ userId });
            if (!economie) {
                return interaction.reply({ content: "❌ Vous n'avez pas de compte économique.", ephemeral: true });
            }

            // Calcul du coût (2x le prix de vente)
            const cout = vente.price * 2;

            // Vérification du solde
            if (economie[vente.devise] < cout) {
                return interaction.reply({ content: `❌ Vous n'avez pas assez de ${vente.devise} pour retirer cette annonce. (Coût: ${cout} ${vente.devise})`, ephemeral: true });
            }

            // Déduire le coût
            economie[vente.devise] -= cout;
            await economie.save();

            // Remettre l'item dans l'inventaire du vendeur
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

            // Supprimer l'annonce du Marketplace
            await Marketplace.findByIdAndDelete(vente._id);

            // Créer un embed de confirmation
            const embed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('✅ Annonce retirée du Marketplace')
                .setDescription(`Votre annonce pour **${item.name}** a été retirée.\nVous avez payé **${cout} ${vente.devise}** pour cette opération.`)
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "❌ Une erreur est survenue lors du retrait de l'annonce.", ephemeral: true });
        }
    }
}

    ]
 }
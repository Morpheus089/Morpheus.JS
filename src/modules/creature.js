const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const mongoose = require('mongoose');
const Creature = require('../database/models/creatureModel');
const Boss = require('../database/models/bossModel'); 
const Item = require('../database/models/itemModel'); 
const Ressource = require('../database/models/ressourceModel'); 
const Stats = require('../database/models/statsModel'); 
const Equipement = require('../database/models/equipementModel'); 
const Effect = require('../database/models/effetModel'); 
const Attack = require('../database/models/attaqueModel');

module.exports = {
    commands: [
      {
        data: new SlashCommandBuilder()
        .setName('cree_creature')
        .setDescription('Créer une nouvelle créature')
        .addStringOption(option => 
            option.setName('nom')
                .setDescription('Nom de la créature')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('description')
                .setDescription('Description de la créature')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('rarete')
                .setDescription('Rareté de la créature')
                .setRequired(true)
                .addChoices(
                    { name: 'Commun', value: 'Commun' },
                    { name: 'Rare', value: 'Rare' },
                    { name: 'Épique', value: 'Épique' },
                    { name: 'Légendaire', value: 'Légendaire' }
                ))
        .addIntegerOption(option => 
            option.setName('niveau')
                .setDescription('Niveau de la créature')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('force')
                .setDescription('Force de la créature')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('vitalite')
                .setDescription('Vitalité de la créature')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('vitesse')
                .setDescription('Vitesse de la créature')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('chance')
                .setDescription('Chance de la créature')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('attaques')
                .setDescription('Attaques de la créature (format: nom,degats,precision,type|nom,degats,precision,type)')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('drops')
                .setDescription('Drops (ressourceId,quantite_min,quantite_max,probabilite|)')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('honneur')
                .setDescription('Honneur gagné en battant cette créature')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('xp')
                .setDescription('XP gagné en battant cette créature')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('items')
                .setDescription('Items dropés (itemId,probabilite|itemId,probabilite)')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => 
            option.setName('image')
                .setDescription('URL de l\'image de la créature')
                .setRequired(false)),

    async execute(interaction) {
        const nom = interaction.options.getString('nom');
        const description = interaction.options.getString('description');
        const rarete = interaction.options.getString('rarete');
        const niveau = interaction.options.getInteger('niveau');
        const force = interaction.options.getInteger('force');
        const vitalite = interaction.options.getInteger('vitalite');
        const vitesse = interaction.options.getInteger('vitesse');
        const chance = interaction.options.getInteger('chance');
        const attaquesInput = interaction.options.getString('attaques');
        const dropsInput = interaction.options.getString('drops');
        const itemsInput = interaction.options.getString('items');
        const honneur = interaction.options.getInteger('honneur');
        const xp = interaction.options.getInteger('xp');
        const image = interaction.options.getString('image') || '';

        
        const attaques = attaquesInput.split('|').map(attaque => {
            const [nom, degats, precision, type] = attaque.split(',');
            return { nom, degats: parseInt(degats), precision: parseFloat(precision), type };
        });

        
        const ressources = await Promise.all(dropsInput.split('|').map(async (drop) => {
            const [ressourceId, quantite_min, quantite_max, probabilite] = drop.split(',');
            const ressource = await Ressource.findById(ressourceId);
            if (!ressource) throw new Error(`Ressource avec l'ID ${ressourceId} non trouvée`);
            return { ressourceId: ressource._id, quantite_min: parseInt(quantite_min), quantite_max: parseInt(quantite_max), probabilite: parseFloat(probabilite) };
        }));

        
        const items = await Promise.all(itemsInput.split('|').map(async (item) => {
            const [itemId, probabilite] = item.split(',');
            const foundItem = await Item.findById(itemId); 
            if (!foundItem) throw new Error(`Item avec l'ID ${itemId} non trouvé`);
            return { itemId: foundItem._id, probabilite: parseFloat(probabilite) };
        }));

        try {
            const creature = new Creature({
                nom,
                description,
                rarete,
                niveau,
                stats: { force, vitalite, vitesse, chance },
                attaques,
                drops: {
                    ressources,
                    honneur,
                    xp,
                    items
                },
                image
            });
            
            await creature.save();
            
            const embed = new EmbedBuilder()
                .setTitle('Créature créée')
                .setDescription(`La créature **${nom}** a été ajoutée avec succès !`)
                .setColor(0x00ff00);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: `Une erreur est survenue lors de la création de la créature : ${error.message}`, ephemeral: true });
        }
    }
},

{
    data: new SlashCommandBuilder()
        .setName('cree_boss')
        .setDescription('Créer un nouveau boss')
        .addStringOption(option =>
            option.setName('nom')
                .setDescription('Nom du boss')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Description du boss')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('rarete')
                .setDescription('Rareté du boss')
                .setRequired(true)
                .addChoices(
                    { name: 'Rare', value: 'Rare' },
                    { name: 'Épique', value: 'Épique' },
                    { name: 'Légendaire', value: 'Légendaire' },
                    { name: 'Mythique', value: 'Mythique' }
                ))
        .addIntegerOption(option =>
            option.setName('niveau')
                .setDescription('Niveau du boss')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('force')
                .setDescription('Force du boss')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('vitalite')
                .setDescription('Vitalité du boss')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('vitesse')
                .setDescription('Vitesse du boss')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('chance')
                .setDescription('Chance du boss')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('attaques')
                .setDescription('Attaques du boss (nom,degats,precision,type|nom,degats,precision,type)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('drops')
                .setDescription('Drops (ressourceId,quantite_min,quantite_max,probabilite|)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('items')
                .setDescription('Items dropés (itemId,probabilite|itemId,probabilite)')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('honneur')
                .setDescription('Honneur gagné en battant ce boss')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('xp')
                .setDescription('XP gagné en battant ce boss')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('image')
                .setDescription('URL de l\'image du boss')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const nom = interaction.options.getString('nom');
        const description = interaction.options.getString('description');
        const rarete = interaction.options.getString('rarete');
        const niveau = interaction.options.getInteger('niveau');
        const force = interaction.options.getInteger('force');
        const vitalite = interaction.options.getInteger('vitalite');
        const vitesse = interaction.options.getInteger('vitesse');
        const chance = interaction.options.getInteger('chance');
        const attaquesInput = interaction.options.getString('attaques');
        const dropsInput = interaction.options.getString('drops');
        const itemsInput = interaction.options.getString('items');
        const honneur = interaction.options.getInteger('honneur');
        const xp = interaction.options.getInteger('xp');
        const image = interaction.options.getString('image') || '';

        
        const attaques = attaquesInput.split('|').map(attaque => {
            const [nom, degats, precision, type] = attaque.split(',');
            return { nom, degats: parseInt(degats), precision: parseFloat(precision), type };
        });

        
        const ressources = await Promise.all(dropsInput.split('|').map(async (drop) => {
            const [ressourceId, quantite_min, quantite_max, probabilite] = drop.split(',');
            const ressource = await Ressource.findById(ressourceId);
            if (!ressource) throw new Error(`Ressource avec l'ID ${ressourceId} non trouvée`);
            return { ressourceId: ressource._id, quantite_min: parseInt(quantite_min), quantite_max: parseInt(quantite_max), probabilite: parseFloat(probabilite) };
        }));

        
        const items = await Promise.all(itemsInput.split('|').map(async (item) => {
            const [itemId, probabilite] = item.split(',');
            const foundItem = await Item.findById(itemId);
            if (!foundItem) throw new Error(`Item avec l'ID ${itemId} non trouvé`);
            return { itemId: foundItem._id, probabilite: parseFloat(probabilite) };
        }));

        try {
            const boss = new Boss({
                nom,
                description,
                rarete,
                niveau,
                stats: { force, vitalite, vitesse, chance },
                attaques,
                drops: {
                    ressources,
                    honneur,
                    xp,
                    items
                },
                image
            });

            await boss.save();

            const embed = new EmbedBuilder()
                .setTitle('Boss créé')
                .setDescription(`Le boss **${nom}** a été ajouté avec succès !`)
                .setColor(0xff0000);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: `Une erreur est survenue lors de la création du boss : ${error.message}`, ephemeral: true });
        }
    }
},

{
    data: new SlashCommandBuilder()
                .setName('afficher_creature')
                .setDescription('Afficher une créature par son nom')
                .addStringOption(option =>
                    option.setName('nom')
                        .setDescription('Nom de la créature')
                        .setRequired(true)
                ),
            async execute(interaction) {
                const creatureName = interaction.options.getString('nom');

            
                const creature = await Creature.findOne({ nom: creatureName });

                if (!creature) {
                    return interaction.reply(`Aucune créature trouvée avec le nom : **${creatureName}**`);
                }

                
                const embed = new EmbedBuilder()
                    .setTitle(creature.nom)
                    .setDescription(creature.description)
                    .addFields(
                        { name: 'Rareté', value: creature.rarete, inline: true },
                        { name: 'Niveau', value: creature.niveau.toString(), inline: true },
                        { name: 'Force', value: creature.stats.force.toString(), inline: true },
                        { name: 'Vitalité', value: creature.stats.vitalite.toString(), inline: true },
                        { name: 'Vitesse', value: creature.stats.vitesse.toString(), inline: true }
                    )
                    .setColor('#FF9900');

                
                await interaction.reply({ embeds: [embed] });
            }
        },

{
    data: new SlashCommandBuilder()
                .setName('afficher_boss')
                .setDescription('Afficher un boss par son nom')
                .addStringOption(option =>
                    option.setName('nom')
                        .setDescription('Nom du boss')
                        .setRequired(true)
                ),
            async execute(interaction) {
                const bossName = interaction.options.getString('nom');

                
                const boss = await Boss.findOne({ nom: bossName });

                if (!boss) {
                    return interaction.reply(`Aucun boss trouvé avec le nom : **${bossName}**`);
                }

                
                const embed = new EmbedBuilder()
                    .setTitle(boss.nom)
                    .setDescription(boss.description)
                    .addFields(
                        { name: 'Rareté', value: boss.rarete, inline: true },
                        { name: 'Niveau', value: boss.niveau.toString(), inline: true },
                        { name: 'Force', value: boss.stats.force.toString(), inline: true },
                        { name: 'Vitalité', value: boss.stats.vitalite.toString(), inline: true },
                        { name: 'Vitesse', value: boss.stats.vitesse.toString(), inline: true }
                    )
                    .setColor('#FF0000');

                
                await interaction.reply({ embeds: [embed] });
            }
        },

{
    data: new SlashCommandBuilder()
        .setName('creer_attack')
        .setDescription('Crée une attaque avec un effet spécifique')
        .addStringOption(option => 
            option.setName('nom')
                .setDescription('Nom de l\'attaque')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('description')
                .setDescription('Description de l\'attaque')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('rarete')
                .setDescription('Rareté de l\'attaque')
                .setRequired(true)
                .addChoices(
                    { name: 'Commun', value: 'Commun' },
                    { name: 'Rare', value: 'Rare' },
                    { name: 'Épique', value: 'Épique' },
                    { name: 'Légendaire', value: 'Légendaire' }
                ))
        .addStringOption(option => 
            option.setName('type')
                .setDescription('Type de l\'attaque')
                .setRequired(true)
                .addChoices(
                    { name: 'Physique', value: 'Physique' },
                    { name: 'Magique', value: 'Magique' }
                ))
        .addIntegerOption(option => 
            option.setName('energie')
                .setDescription('Coût en points d\'énergie')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('degat')
                .setDescription('Dégâts de l\'attaque')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('precision')
                .setDescription('Précision de l\'attaque')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('effet')
                .setDescription('Nom de l\'effet associé')
                .setRequired(true)),

    async execute(interaction) {
        const nom = interaction.options.getString('nom');
        const description = interaction.options.getString('description');
        const rarete = interaction.options.getString('rarete');
        const type = interaction.options.getString('type');
        const energie = interaction.options.getInteger('energie');
        const degat = interaction.options.getInteger('degat');
        const precision = interaction.options.getInteger('precision');
        const effetNom = interaction.options.getString('effet');

        try {
            
            const effet = await Effect.findOne({ name: effetNom });
            if (!effet) {
                return interaction.reply({ content: `L'effet **${effetNom}** n'existe pas !`, ephemeral: true });
            }

            
            const attaque = new Attack({
                name: nom,
                description,
                rarity: rarete,
                type,
                energyCost: energie,
                damage: degat,
                accuracy: precision,
                effects: [effet._id]
            });

            
            await attaque.save();

            
            const embed = new EmbedBuilder()
                .setTitle('Attaque créée')
                .setDescription(`L'attaque **${nom}** a été ajoutée avec succès avec l'effet **${effetNom}** !`)
                .setColor(0x00ff00);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: `Une erreur est survenue : ${error.message}`, ephemeral: true });
        }
    }
},

{
    data: new SlashCommandBuilder()
        .setName('creer_effet')
        .setDescription('Crée un effet pouvant être appliqué aux attaques')
        .addStringOption(option => 
            option.setName('nom')
                .setDescription('Nom de l\'effet')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('description')
                .setDescription('Description de l\'effet')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('duree')
                .setDescription('Durée en tours')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('puissance')
                .setDescription('Intensité de l\'effet')),

    async execute(interaction) {
        const nom = interaction.options.getString('nom');
        const description = interaction.options.getString('description');
        const duree = interaction.options.getInteger('duree');
        const puissance = interaction.options.getInteger('puissance') || 0;

        try {
            const effet = new Effect({
                name: nom,
                description,
                duration: duree,
                potency: puissance
            });

            await effet.save();

            const embed = new EmbedBuilder()
                .setTitle('Effet créé')
                .setDescription(`L'effet **${nom}** a été ajouté avec succès !`)
                .setColor(0x00ff00);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: `Une erreur est survenue : ${error.message}`, ephemeral: true });
        }
    }
}

    ]
  }
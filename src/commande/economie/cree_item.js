const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Stats = require('../../database/models/statsModel');
const Economie = require('../../database/models/economieModel');
const Item = require('../../database/models/itemModel'); 
const Marketplace = require('../../database/models/marketplaceModel'); 
const Inventaire = require('../../database/models/inventaireModel') 
const Equipement = require('../../database/models/equipementModel'); 

const { createSuccessEmbed, createErrorEmbed, createBalanceEmbed } = require('../../utils/embeds');
const { modifierSolde, deviseLabels } = require('../../utils/devise');
const { isAdmin } = require('../../utils/permissions');
const parseStats = require('../../utils/parseStats');

module.exports = {
    commands: [

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
}

    ]
}
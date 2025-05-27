const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const mongoose = require('mongoose');
const Recette = require('../database/models/recetteModel');
const Metier = require('../database/models/metierModel.js');
const MetierUtilisateur = require('../database/models/metierUtilisateurModel')

const { createSuccessEmbed, createErrorEmbed } = require('../utils/embeds');
const { parseRecettesString, validateRecettesExist, getUserMetierData } = require('../utils/metierUtils');

module.exports = {
    commands: [
        {
            data: new SlashCommandBuilder()
    .setName('creer_metier')
    .setDescription('Crée un nouveau métier avec un niveau de base de 1.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option.setName('nom')
        .setDescription('Le nom du métier')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Description du métier')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('recettes')
        .setDescription("IDs des recettes à associer avec niveaux requis (ex: id1:10,id2:20)")
        .setRequired(true)
    ),

  async execute(interaction) {
    const nom = interaction.options.getString('nom');
    const description = interaction.options.getString('description');
    const recettesStr = interaction.options.getString('recettes');

    try {
      const recettes = await parseRecettesString(recettesStr);
      const recettesIds = recettes.map(r => r.recetteId);

      const recettesValides = await validateRecettesExist(recettesIds);
      if (recettesValides.length !== recettesIds.length) {
        return interaction.reply({
          embeds: [createErrorEmbed("❌ Recettes invalides", "Une ou plusieurs recettes spécifiées sont introuvables.")],
          ephemeral: true
        });
      }

      const existe = await Metier.findOne({ name: nom });
      if (existe) {
        return interaction.reply({
          embeds: [createErrorEmbed("❌ Métier existant", `Le métier nommé ${nom} existe déjà.`)],
          ephemeral: true
        });
      }

      const nouveauMetier = new Metier({
        name: nom,
        description,
        niveauDeBase: 1,
        niveauMax: 100,
        xpParNiveau: 100,
        recettes
      });

      await nouveauMetier.save();

      const embed = createSuccessEmbed(
        "🛠️ Nouveau Métier Créé",
        `Le métier ${nom} a été créé avec un niveau de base de 1.`
      );

      embed.addFields(
        { name: '📄 Description', value: description },
        { name: '📈 Niveau de Base', value: '1', inline: true },
        { name: '🔝 Niveau Maximum', value: '100', inline: true },
        {
          name: '🧪 Recettes liées',
          value: recettesValides.map(r => `• ${r.name}`).join('\n') || 'Aucune',
          inline: false
        }
      );

      return interaction.reply({ embeds: [embed] });

    } catch (err) {
      console.error("Erreur création métier :", err);
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Erreur serveur", "Une erreur est survenue lors de la création du métier.")],
        ephemeral: true
      });
    }
  }
},

{
  data: new SlashCommandBuilder()
  .setName('attribuer_metier')
  .setDescription("Attribue un métier à un utilisateur.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addUserOption(option =>
    option.setName('utilisateur')
      .setDescription("Utilisateur à qui attribuer le métier")
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('metier')
      .setDescription("Nom du métier à attribuer")
      .setRequired(true)
  ),

async execute(interaction) {
  const user = interaction.options.getUser('utilisateur');
  const metierNom = interaction.options.getString('metier');

  try {
    const metier = await Metier.findOne({ name: metierNom });
    if (!metier) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Métier introuvable", `Aucun métier nommé "${metierNom}" n’a été trouvé.`)],
        ephemeral: true
      });
    }

    let userMetier = await MetierUtilisateur.findOne({ userId: user.id });
    if (!userMetier) {
      userMetier = new MetierUtilisateur({ userId: user.id, metiers: [] });
    }

    const dejaAttribue = userMetier.metiers.some(m => m.metierId.equals(metier._id));
    if (dejaAttribue) {
      return interaction.reply({
        embeds: [createErrorEmbed("⛔ Métier déjà attribué", `${user.username} possède déjà le métier "${metierNom}".`)],
        ephemeral: true
      });
    }

    userMetier.metiers.push({
      metierId: metier._id,
      niveau: 1,
      xp: 0
    });

    await userMetier.save();

    return interaction.reply({
      embeds: [createSuccessEmbed(
        "✅ Métier attribué",
        `Le métier ${metier.name} a été attribué à ${user.username} (niveau de départ : 1).`
      )]
    });

  } catch (err) {
    console.error("Erreur attribution métier :", err);
    return interaction.reply({
      embeds: [createErrorEmbed("❌ Erreur", "Une erreur est survenue lors de l’attribution du métier.")],
      ephemeral: true
    });
  }
}
},

{
  data: new SlashCommandBuilder()
  .setName('mon_metier')
  .setDescription("Affiche ton niveau et ton XP dans un métier.")
  .addStringOption(option =>
    option.setName('metier')
      .setDescription("Nom du métier à consulter")
      .setRequired(true)
  ),

async execute(interaction) {
  const userId = interaction.user.id;
  const metierNom = interaction.options.getString('metier');

  try {
    const metier = await Metier.findOne({ name: metierNom });
    if (!metier) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Métier introuvable", `Le métier "${metierNom}" n'existe pas.`)],
        ephemeral: true
      });
    }

    const metierData = await getUserMetierData(userId, metier._id);
    if (!metierData) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Non débloqué", `Tu n'as pas encore progressé dans "${metierNom}".`)],
        ephemeral: true
      });
    }

    const xpMax = 100 * metierData.niveau;
    const progression = Math.round((metierData.xp / xpMax) * 10);
    const barre = '🟧'.repeat(progression) + '⬜'.repeat(10 - progression);

    const embed = {
      color: 0xFFA500,
      title: `📜 Métier : ${metier.name}`,
      description: `**Niveau :** ${metierData.niveau}\n**XP :** ${metierData.xp} / ${xpMax}\n\n${barre}`,
      timestamp: new Date()
    };

    return interaction.reply({ embeds: [embed] });

  } catch (error) {
    console.error("Erreur lors de la consultation du métier :", error);
    return interaction.reply({
      embeds: [createErrorEmbed("❌ Erreur", "Une erreur est survenue en consultant ton métier.")],
      ephemeral: true
    });
  }
}
}

    ]
}
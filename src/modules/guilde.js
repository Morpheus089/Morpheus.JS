const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const mongoose = require('mongoose');
const Guilde = require('../src/database/models/guildeModel');


const { createSuccessEmbed, createErrorEmbed } = require('../src/utils/embeds');
const { createGuildeEmbed } = require('../src/utils/guildeEmbeds');

const {
  getGuildeByOwner,
  getGuildeByName,
  createNewGuilde,
  userHasGuilde,
  isMember,
  isOwner,
  hasMemberSlot
} = require('../src/utils/guildeUtils');

const {
  canJoinGuilde,
  canLeaveGuilde,
  canKickMember
} = require('../src/utils/guildeChecks');

const { isAdmin } = require('../src/utils/permissions');

module.exports = {
    commands: [
        {
            data: new SlashCommandBuilder()
    .setName('creer_guilde')
    .setDescription('Crée une nouvelle guilde')
    .addStringOption(option =>
      option.setName('nom')
        .setDescription('Nom unique de la guilde')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type (classe) de la guilde (valeur libre)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Description de la guilde')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('image')
        .setDescription("URL ou chemin de l'image de la guilde")
        .setRequired(false)
    ),

  async execute(interaction) {
    const nom = interaction.options.getString('nom').trim();
    const type = interaction.options.getString('type').trim();
    const description = interaction.options.getString('description') || '';
    const image = interaction.options.getString('image') || '';
    const creatorId = interaction.user.id;

    try {
      const alreadyExists = await getGuildeByName(nom);
      if (alreadyExists) {
        return interaction.reply({
          embeds: [createErrorEmbed("❌ Erreur", `⚠️ Une guilde portant le nom ${nom} existe déjà.`)],
          ephemeral: true
        });
      }

      const dejaChef = await userHasGuilde(creatorId);
      if (dejaChef) {
        return interaction.reply({
          embeds: [createErrorEmbed("❌ Déjà chef", "Tu diriges déjà une guilde.")],
          ephemeral: true
        });
      }

      const nouvelleGuilde = new Guilde({
        nom,
        type,
        description,
        niveau: 1,
        image,
        ownerId: creatorId,
        membres: [creatorId],
        subGuilds: [],
        activities: []
      });

      await nouvelleGuilde.save();

      return interaction.reply({
        embeds: [createSuccessEmbed("✅ Guilde créée", `🎉 La guilde ${nom} a été créée avec succès !`)]
      });

    } catch (error) {
      console.error("Erreur lors de la création de la guilde :", error);
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Erreur", "Une erreur est survenue lors de la création de la guilde.")],
        ephemeral: true
      });
    }
  }
},
        {
            data: new SlashCommandBuilder()
    .setName('guilde_invite')
    .setDescription('Invite un joueur à rejoindre votre guilde')
    .addUserOption(option =>
      option.setName('utilisateur')
        .setDescription('Le joueur à inviter')
        .setRequired(true)
    ),

  async execute(interaction) {
    const inviter = interaction.user;
    const invitedUser = interaction.options.getUser('utilisateur');

    if (invitedUser.id === inviter.id) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Erreur", "🚫 Vous ne pouvez pas vous inviter vous-même.")],
        ephemeral: true
      });
    }

    try {
      const guilde = await Guilde.findOne({ ownerId: inviter.id });
      if (!guilde) {
        return interaction.reply({
          embeds: [createErrorEmbed("❌ Pas de guilde", "Vous ne dirigez aucune guilde. Créez-en une avec /creer_guilde.")],
          ephemeral: true
        });
      }

      const dejaDansUneGuilde = await Guilde.findOne({ membres: invitedUser.id });
      if (dejaDansUneGuilde) {
        return interaction.reply({
          embeds: [createErrorEmbed("❌ Déjà membre", `${invitedUser.username} fait déjà partie d'une guilde.`)],
          ephemeral: true
        });
      }

      if (!canJoinGuilde(guilde, invitedUser.id)) {
        return interaction.reply({
          embeds: [createErrorEmbed("❌ Guilde pleine", "Il n’y a plus de place dans la guilde.")],
          ephemeral: true
        });
      }

      const dmEmbed = createSuccessEmbed(
        "💌 Invitation à rejoindre une Guilde",
        `🎉 Tu as été invité(e) par **${inviter.tag}** à rejoindre la guilde **${guilde.nom}**.\n\nClique sur Accepter pour rejoindre cette aventure !`
      );

      const acceptButton = new ButtonBuilder()
        .setCustomId('accept_invite')
        .setLabel('Accepter')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✅');

      const row = new ActionRowBuilder().addComponents(acceptButton);

      let dmMessage;
      try {
        dmMessage = await invitedUser.send({ embeds: [dmEmbed], components: [row] });
      } catch {
        return interaction.reply({
          embeds: [createErrorEmbed("❌ Impossible d'inviter", "L'utilisateur n'autorise pas les messages privés.")],
          ephemeral: true
        });
      }

      await interaction.reply({
        embeds: [createSuccessEmbed("📩 Invitation envoyée", `Invitation envoyée à ${invitedUser.tag}, en attente de réponse...`)],
        ephemeral: true
      });

      const filter = i => i.customId === 'accept_invite' && i.user.id === invitedUser.id;
      const collector = await dmMessage.awaitMessageComponent({ filter, time: 60000 }).catch(() => null);

      if (!collector) {
        if (dmMessage.edit) {
          const timeoutEmbed = createErrorEmbed("⏰ Temps écoulé", "Tu n'as pas répondu à temps à l'invitation.");
          await dmMessage.edit({ embeds: [timeoutEmbed], components: [] });
        }
        return;
      }

      guilde.membres.push(invitedUser.id);
      await guilde.save();

      await collector.update({
        embeds: [createSuccessEmbed("✅ Invitation acceptée", `🎉 Tu as rejoint la guilde ${guilde.nom} avec succès !`)],
        components: []
      });

      await interaction.followUp({
        embeds: [createSuccessEmbed("🎉 Invitation confirmée", `${invitedUser.tag} a rejoint la guilde ${guilde.nom}.`)],
        ephemeral: true
      });

    } catch (err) {
      console.error("❌ Erreur lors de l'invitation :", err);
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Erreur", "Une erreur est survenue lors de l'invitation.")],
        ephemeral: true
      });
    }
  }
},

{
    data: new SlashCommandBuilder()
                .setName('ma_guilde')
                .setDescription('Affiche toutes les informations de votre guilde'),

            async execute(interaction) {
                const userId = interaction.user.id;

                try {
                    
                    const guilde = await Stats.findOne({ "members.user": userId }).populate('subGuilds');

                    if (!guilde) {
                        const embedErreur = new EmbedBuilder()
                            .setTitle("❌ Aucune guilde trouvée")
                            .setDescription("🚫 Vous n'appartenez à aucune guilde. Créez-en une avec `/creer_guilde`.")
                            .setColor(0xFF0000)
                            .setTimestamp();
                        return interaction.reply({ embeds: [embedErreur], ephemeral: true });
                    }

                    const membre = guilde.members.find(m => m.user === userId);
                    const membresListe = guilde.members
                        .map(m => `• <@${m.user}> - **${m.rank}**${m.position ? ` (${m.position})` : ''}`)
                        .join('\n');

                    const sousGuildesListe = guilde.subGuilds.length > 0
                        ? guilde.subGuilds.map(sg =>
                            `🏰 **${sg.name}** — *${sg.type}*\n📝 ${sg.description || "Pas de description"}`
                        ).join('\n\n')
                        : "Aucune sous-guilde affiliée.";

                    const embedGuilde = new EmbedBuilder()
                        .setTitle(`🏰 Guilde : ${guilde.name}`)
                        .setDescription(guilde.description || "*Aucune description*")
                        .setColor(0x0099FF)
                        .setThumbnail(guilde.image || 'https://i.imgur.com/yW2W9SC.png')
                        .addFields(
                            { name: "👑 Créateur", value: `<@${guilde.creator}>`, inline: true },
                            { name: "📜 Type", value: guilde.type, inline: true },
                            { name: "🏆 Niveau", value: `${guilde.level}`, inline: true },
                            { name: "🏗️ Bâtiment", value: `${guilde.buildingLevel}`, inline: true },
                            { name: "📅 Création", value: `<t:${Math.floor(guilde.createdAt.getTime() / 1000)}:F>`, inline: true },
                            { name: "🎭 Votre rôle", value: `${membre.rank}${membre.position ? ` (${membre.position})` : ''}`, inline: true },
                            { name: "👥 Membres", value: `${guilde.members.length} membres`, inline: true },
                            { name: "📌 Activités", value: guilde.activities.length > 0 ? guilde.activities.join(', ') : "Aucune activité", inline: false },
                            { name: "📚 Membres", value: membresListe.substring(0, 1024), inline: false },
                            { name: "🔗 Sous-Guildes affiliées", value: sousGuildesListe.substring(0, 1024), inline: false }
                        )
                        .setTimestamp();

                    return interaction.reply({ embeds: [embedGuilde] });

                } catch (error) {
                    console.error("Erreur lors de la récupération de la guilde :", error);
                    const embedErreur = new EmbedBuilder()
                        .setTitle("❌ Erreur")
                        .setDescription("🚫 Une erreur est survenue lors de la récupération des informations de la guilde.")
                        .setColor(0xFF0000)
                        .setTimestamp();
                    return interaction.reply({ embeds: [embedErreur], ephemeral: true });
                }
            }
        },

{
    data: new SlashCommandBuilder()
    .setName('quitter_guilde')
    .setDescription('Permet de quitter votre guilde actuelle'),

  async execute(interaction) {
    const userId = interaction.user.id;

    try {
      const guilde = await Guilde.findOne({ membres: userId });

      if (!guilde) {
        return interaction.reply({
          embeds: [createErrorEmbed("❌ Aucune guilde trouvée", "🚫 Vous n'appartenez à aucune guilde.")],
          ephemeral: true
        });
      }

      if (!canLeaveGuilde(guilde, userId)) {
        return interaction.reply({
          embeds: [createErrorEmbed("⚠️ Impossible de quitter", "👑 Vous êtes le chef de cette guilde. Supprimez-la ou transférez la propriété pour pouvoir la quitter.")],
          ephemeral: true
        });
      }

      const membresAvant = guilde.membres.length;
      guilde.membres = guilde.membres.filter(m => m !== userId);

      if (guilde.membres.length === membresAvant) {
        return interaction.reply({
          embeds: [createErrorEmbed("❌ Erreur", "🚫 Vous n'avez pas pu être retiré de la guilde. Contactez un administrateur.")],
          ephemeral: true
        });
      }

      await guilde.save();

      return interaction.reply({
        embeds: [createSuccessEmbed("👋 Vous avez quitté la guilde", `✅ Vous avez quitté **${guilde.nom}** avec succès.`)],
        ephemeral: true
      });

    } catch (error) {
      console.error("❌ Erreur lors de la tentative de quitter la guilde :", error);
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Erreur", "🚫 Une erreur est survenue en quittant la guilde.")],
        ephemeral: true
      });
    }
  }
},

{
    data: new SlashCommandBuilder()
    .setName('affilier_guilde')
    .setDescription('Demande d’affiliation de votre guilde à une autre guilde.')
    .addUserOption(option =>
      option.setName('chef_cible')
        .setDescription('Chef de la guilde que vous voulez rejoindre')
        .setRequired(true)
    ),

  async execute(interaction) {
    const demandeur = interaction.user;
    const cibleUser = interaction.options.getUser('chef_cible');

    if (demandeur.id === cibleUser.id) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Erreur", "🚫 Vous ne pouvez pas vous affilier à votre propre guilde.")],
        ephemeral: true
      });
    }

    try {
      const guildeDemandeur = await Guilde.findOne({ ownerId: demandeur.id });
      const guildeCible = await Guilde.findOne({ ownerId: cibleUser.id });

      if (!guildeDemandeur || !guildeCible) {
        return interaction.reply({
          embeds: [createErrorEmbed("❌ Erreur", "🚫 L’un de vous n’est pas chef de guilde.")],
          ephemeral: true
        });
      }

      if (guildeCible.subGuilds.includes(guildeDemandeur._id)) {
        return interaction.reply({
          embeds: [createSuccessEmbed("⚠️ Déjà affiliée", "✅ Votre guilde est déjà affiliée à cette guilde.")],
          ephemeral: true
        });
      }

      // 💌 Envoi d’une invitation par MP
      const embedDemande = createSuccessEmbed(
        "🤝 Demande d'affiliation de guilde",
        `🔗 **${demandeur.tag}** (Chef de **${guildeDemandeur.nom}**) souhaite affilier sa guilde à la vôtre (**${guildeCible.nom}**).\n\nCliquez sur Accepter pour confirmer cette alliance.`
      );

      const boutonAccepter = new ButtonBuilder()
        .setCustomId('accepter_affiliation')
        .setLabel('Accepter l’affiliation')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✅');

      const row = new ActionRowBuilder().addComponents(boutonAccepter);

      let dmMessage;
      try {
        dmMessage = await cibleUser.send({
          embeds: [embedDemande],
          components: [row]
        });
      } catch {
        return interaction.reply({
          embeds: [createErrorEmbed("📪 Échec", "❌ Impossible d’envoyer un MP à cet utilisateur.")],
          ephemeral: true
        });
      }

      await interaction.reply({
        embeds: [createSuccessEmbed("📨 Demande envoyée", `Votre demande d'affiliation à **${guildeCible.nom}** a été envoyée à **${cibleUser.tag}**.`)],
        ephemeral: true
      });

      // ⏳ Attente de validation
      const filter = i => i.customId === 'accepter_affiliation' && i.user.id === cibleUser.id;
      const collector = await dmMessage.awaitMessageComponent({ filter, time: 60000 }).catch(() => null);

      if (!collector) {
        const expiredEmbed = createErrorEmbed("⏰ Temps écoulé", "🔕 La demande d'affiliation a expiré.");
        return dmMessage.edit({ embeds: [expiredEmbed], components: [] });
      }

      // ✅ Mise à jour de la guilde cible
      guildeCible.subGuilds.push(guildeDemandeur._id);
      await guildeCible.save();

      const acceptedEmbed = createSuccessEmbed(
        "✅ Affiliation acceptée",
        `🎉 Votre guilde est désormais affiliée à **${guildeCible.nom}** !`
      );

      await collector.update({ embeds: [acceptedEmbed], components: [] });

      await interaction.followUp({
        embeds: [createSuccessEmbed("🤝 Affiliation confirmée", `🎉 **${guildeDemandeur.nom}** est maintenant affiliée à **${guildeCible.nom}**.`)],
        ephemeral: true
      });

    } catch (error) {
      console.error("❌ Erreur d'affiliation :", error);
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Erreur", "🚫 Une erreur est survenue pendant la demande d’affiliation.")],
        ephemeral: true
      });
    }
  }
},

{
  data: new SlashCommandBuilder()
  .setName('desaffilier_guilde')
  .setDescription('Met fin à l’affiliation entre votre guilde et une autre')
  .addUserOption(option =>
    option.setName('chef_cible')
      .setDescription("Chef de la guilde à laquelle vous êtes affilié")
      .setRequired(true)
  ),

async execute(interaction) {
  const userId = interaction.user.id;
  const cibleUser = interaction.options.getUser('chef_cible');

  try {
    const guildeSource = await Guilde.findOne({ ownerId: userId });
    const guildeCible = await Guilde.findOne({ ownerId: cibleUser.id });

    if (!guildeSource || !guildeCible) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Introuvable", "🚫 Impossible de trouver l’une des deux guildes.")],
        ephemeral: true
      });
    }

    if (!guildeCible.subGuilds.includes(guildeSource._id)) {
      return interaction.reply({
        embeds: [createErrorEmbed("⚠️ Non affiliée", `🚫 Votre guilde n'est pas affiliée à ${guildeCible.nom}.`)],
        ephemeral: true
      });
    }

    guildeCible.subGuilds = guildeCible.subGuilds.filter(id => !id.equals(guildeSource._id));
    await guildeCible.save();

    return interaction.reply({
      embeds: [
        createSuccessEmbed(
          "🔓 Désaffiliation réussie",
          `❌ Votre guilde ${guildeSource.nom} n'est plus affiliée à ${guildeCible.nom}.`
        )
      ],
      ephemeral: true
    });

  } catch (error) {
    console.error("❌ Erreur de désaffiliation :", error);
    return interaction.reply({
      embeds: [createErrorEmbed("❌ Erreur", "🚫 Une erreur est survenue lors de la désaffiliation.")],
      ephemeral: true
    });
  }
}
},

{
  data: new SlashCommandBuilder()
    .setName('supprimer_guilde')
    .setDescription('Supprime définitivement votre guilde (Chef uniquement)'),

  async execute(interaction) {
    const userId = interaction.user.id;

    try {
      const guilde = await Guilde.findOne({ creator: userId });

      if (!guilde) {
        return interaction.reply({
          embeds: [
            createErrorEmbed(
              "❌ Aucune guilde trouvée",
              "🚫 Vous n’êtes pas le créateur d’une guilde ou elle n'existe pas."
            )
          ],
          ephemeral: true
        });
      }

      const nom = guilde.name;
      await Guilde.deleteOne({ _id: guilde._id });

      return interaction.reply({
        embeds: [
          createSuccessEmbed(
            "🗑️ Guilde supprimée",
            `❌ La guilde ${nom} a été définitivement supprimée.`
          )
        ],
        ephemeral: false
      });

    } catch (error) {
      console.error("❌ Erreur lors de la suppression de la guilde :", error);
      return interaction.reply({
        embeds: [
          createErrorEmbed(
            "❌ Erreur",
            "🚫 Une erreur est survenue lors de la suppression de la guilde."
          )
        ],
        ephemeral: true
      });
    }
  }
},

{
  data: new SlashCommandBuilder()
  .setName('promouvoir_membre')
  .setDescription('Promouvoir un membre de votre guilde à un rang supérieur.')
  .addUserOption(option =>
    option.setName('membre')
      .setDescription("Membre de votre guilde à promouvoir")
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('nouveau_grade')
      .setDescription('Nouveau grade à attribuer')
      .setRequired(true)
      .addChoices(
        { name: 'Sous-Chef', value: 'Sous-Chef' },
        { name: 'Commandant', value: 'Commandant' },
        { name: 'Membre', value: 'Membre' },
        { name: 'Recrue', value: 'Recrue' }
      )
  ),

async execute(interaction) {
  const auteurId = interaction.user.id;
  const membreCible = interaction.options.getUser('membre');
  const nouveauGrade = interaction.options.getString('nouveau_grade');

  try {
    const guilde = await Guilde.findOne({ "members.user": auteurId });
    if (!guilde) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Aucune guilde trouvée", "🚫 Vous n'appartenez à aucune guilde.")],
        ephemeral: true
      });
    }

    const auteur = guilde.members.find(m => m.user === auteurId);
    if (!["Chef", "Sous-Chef"].includes(auteur.rank)) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Permission refusée", "🚫 Seuls le Chef ou un Sous-Chef peuvent promouvoir un membre.")],
        ephemeral: true
      });
    }

    const cible = guilde.members.find(m => m.user === membreCible.id);
    if (!cible) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Membre introuvable", "🚫 Ce membre ne fait pas partie de votre guilde.")],
        ephemeral: true
      });
    }

    if (cible.rank === "Chef") {
      return interaction.reply({
        embeds: [createErrorEmbed("⚠️ Action interdite", "👑 Vous ne pouvez pas modifier le rang du Chef de guilde.")],
        ephemeral: true
      });
    }

    cible.rank = nouveauGrade;
    await guilde.save();

    return interaction.reply({
      embeds: [
        createSuccessEmbed(
          "📈 Promotion effectuée",
          `✅ <@${membreCible.id}> a été promu **${nouveauGrade}** dans la guilde **${guilde.name}**.`
        )
      ],
      ephemeral: false
    });

  } catch (error) {
    console.error("Erreur lors de la promotion :", error);
    return interaction.reply({
      embeds: [createErrorEmbed("❌ Erreur", "🚫 Une erreur est survenue lors de la promotion.")],
      ephemeral: true
    });
  }
}
},

{
  data: new SlashCommandBuilder()
  .setName('retrograder_membre')
  .setDescription('Rétrograde un membre de votre guilde à un rang inférieur.')
  .addUserOption(option =>
    option.setName('membre')
      .setDescription("Membre à rétrograder")
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('nouveau_grade')
      .setDescription('Nouveau grade (inférieur) à attribuer')
      .setRequired(true)
      .addChoices(
        { name: 'Commandant', value: 'Commandant' },
        { name: 'Membre', value: 'Membre' },
        { name: 'Recrue', value: 'Recrue' }
      )
  ),

async execute(interaction) {
  const auteurId = interaction.user.id;
  const membreCible = interaction.options.getUser('membre');
  const nouveauGrade = interaction.options.getString('nouveau_grade');

  try {
    const guilde = await Guilde.findOne({ "members.user": auteurId });
    if (!guilde) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Aucune guilde trouvée", "🚫 Vous n'appartenez à aucune guilde.")],
        ephemeral: true
      });
    }

    const auteur = guilde.members.find(m => m.user === auteurId);
    if (!["Chef", "Sous-Chef"].includes(auteur.rank)) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Permission refusée", "🚫 Seuls le Chef ou un Sous-Chef peuvent rétrograder un membre.")],
        ephemeral: true
      });
    }

    const cible = guilde.members.find(m => m.user === membreCible.id);
    if (!cible) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Membre introuvable", "🚫 Ce membre ne fait pas partie de votre guilde.")],
        ephemeral: true
      });
    }

    if (cible.user === auteurId) {
      return interaction.reply({
        embeds: [createErrorEmbed("🚫 Action non autorisée", "⚠️ Vous ne pouvez pas modifier votre propre rang.")],
        ephemeral: true
      });
    }

    if (cible.rank === "Chef") {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ Interdit", "👑 Vous ne pouvez pas rétrograder le Chef de guilde.")],
        ephemeral: true
      });
    }

    cible.rank = nouveauGrade;
    await guilde.save();

    return interaction.reply({
      embeds: [
        createSuccessEmbed(
          "⬇️ Rétrogradation effectuée",
          `📉 <@${membreCible.id}> a été rétrogradé au rang de **${nouveauGrade}** dans la guilde **${guilde.name}**.`
        )
      ],
      ephemeral: false
    });

  } catch (error) {
    console.error("Erreur de rétrogradation :", error);
    return interaction.reply({
      embeds: [createErrorEmbed("❌ Erreur", "🚫 Une erreur est survenue lors de la rétrogradation.")],
      ephemeral: true
    });
  }
}
}

    ]
}
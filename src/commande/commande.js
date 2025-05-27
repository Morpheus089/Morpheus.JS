const Craft = require('./craft/craft.js');
const CreerRecette = require('./craft/creer_recette.js');
const CreerRessource = require('./craft/creer_ressource.js');
const DonnerRessource = require('./craft/donner_ressource.js');
const VoirRessource = require('./craft/voir_ressoruce.js');

const Acheter = require('./economie/acheter.js');
const AcheterMarketplace = require('./economie/acheter_marketplace.js');
const AjouterAuMarketplace = require('./economie/ajouter-au-marketplace.js');
const AjouteDevise = require('./economie/ajoute_devise.js');
const CreeItem = require('./economie/cree_item.js');
const Desequiper = require('./economie/desequiper.js');
const EnleveDevise = require('./economie/enleve_devise.js');
const Equiper = require('./economie/equiper.js');
const InfosItem = require('./economie/infos_item.js');
const Inventaire = require('./economie/inventaire.js');
const Marketplace = require('./economie/marketplace.js');
const RetirerMarketplace = require('./economie/retirer_marketplace.js');
const Revendre = require('./economie/revendre.js');
const Solde = require('./economie/solde.js');
const VoirBoutique = require('./economie/voir_boutique.js');

const AffilierGuilde = require('./guilde/affilier_guilde.js');
const CreerGuilde = require('./guilde/creer_guilde.js');
const DesaffilierGuilde = require('./guilde/desaffilier_guilde.js');
const GuildeInvite = require('./guilde/guilde_invite.js');
const MaGuilde = require('./guilde/ma_guilde.js');
const PromouvoirMembre = require('./guilde/promouvoir_membre.js');
const QuitterGuilde = require('./guilde/quitter_guilde.js');
const RetrograderMembre = require('./guilde/retrograder_membre.js');
const SupprimerGuilde = require('./guilde/supprimer_guilde.js');

const AttribuerMetier = require('./metier/attribuer_metier.js');
const CreerMetier = require('./metier/creer_metier.js');
const MonMetier = require('./metier/mon_metier.js');

const AjouterStats = require('./stats/ajouter_stats.js');
const Distribuer = require('./stats/distribuer.js');
const ResetStats = require('./stats/reset_stats.js');
const RetirerStats = require('./stats/retirer_stats.js');
const Stats = require('./stats/stats.js');

const AjouterNiveaux = require('./xp/ajouter_niveaux.js');
const Niveau = require('./xp/niveau.js');
const RetirerNiveaux = require('./xp/retirer_niveaux.js');

module.exports = {
    commands: [
        ...Craft.commands,
        ...CreerRecette.commands,
        ...CreerRessource.commands,
        ...DonnerRessource.commands,
        ...VoirRessource.commands,

        ...Acheter.commands,
        ...AcheterMarketplace.commands,
        ...AjouterAuMarketplace.commands,
        ...AjouteDevise.commands,
        ...CreeItem.commands,
        ...Desequiper.commands,
        ...EnleveDevise.commands,
        ...Equiper.commands,
        ...InfosItem.commands,
        ...Inventaire.commands,
        ...Marketplace.commands,
        ...RetirerMarketplace.commands,
        ...Revendre.commands,
        ...Solde.commands,
        ...VoirBoutique.commands,

        ...AffilierGuilde.commands,
        ...CreerGuilde.commands,
        ...DesaffilierGuilde.commands,
        ...GuildeInvite.commands,
        ...MaGuilde.commands,
        ...PromouvoirMembre.commands,
        ...QuitterGuilde.commands,
        ...RetrograderMembre.commands,
        ...SupprimerGuilde.commands,

        ...AttribuerMetier.commands,
        ...CreerMetier.commands,
        ...MonMetier.commands,

        ...AjouterStats.commands,
        ...Distribuer.commands,
        ...ResetStats.commands,
        ...RetirerStats.commands,
        ...Stats.commands,

        ...AjouterNiveaux.commands,
        ...Niveau.commands,
        ...RetirerNiveaux.commands,
    ]
};
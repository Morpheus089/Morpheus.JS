const deviseLabels = {
    ecus: 'Écus 💰',
    cristaux: 'Cristaux Noirs 🔮',
    points: 'Points de Fidélité ⭐'
  };
  
  function modifierSolde(economie, devise, montant) {
    if (devise === 'ecus') economie.ecus += montant;
    else if (devise === 'cristaux') economie.cristauxNoirs += montant;
    else if (devise === 'points') economie.pointsFidelite += montant;
  }
  
  module.exports = {
    modifierSolde,
    deviseLabels
  };  
function calculerXpPourNiveau(niveau) {
    if (niveau <= 0) return 0;
    return 2000 * Math.pow(2, niveau - 1);
  }
  
  module.exports = calculerXpPourNiveau;  
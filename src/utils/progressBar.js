function generateProgressBar(pourcentage) {
    const totalBar = 20;
    const filledBar = Math.round((pourcentage / 100) * totalBar);
    return '🟩'.repeat(filledBar) + '⬜'.repeat(totalBar - filledBar);
  }
  
  module.exports = generateProgressBar;  
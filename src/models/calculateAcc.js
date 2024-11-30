function calculateAccuracy(numberOf300s, numberOf100s, numberOf50s, totalHitObjects) {
    const totalPoints = numberOf300s * 300 + numberOf100s * 100 + numberOf50s * 50;
    const maxPossiblePoints = 300 * totalHitObjects;
  
    const accuracy = (totalPoints / maxPossiblePoints) * 100;
    return accuracy;
  }
  
  module.exports = calculateAccuracy;
  
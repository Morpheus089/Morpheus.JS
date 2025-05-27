function canJoinGuilde(guilde, userId) {
    if (!guilde) return false;
    if (guilde.membres.includes(userId)) return false;
    return guilde.membres.length < guilde.niveau * 5;
  }
  
  function canLeaveGuilde(guilde, userId) {
    return guilde && guilde.membres.includes(userId) && guilde.ownerId !== userId;
  }
  
  function canKickMember(guilde, issuerId, targetId) {
    return guilde.ownerId === issuerId && guilde.membres.includes(targetId);
  }
  
  module.exports = {
    canJoinGuilde,
    canLeaveGuilde,
    canKickMember
  };  
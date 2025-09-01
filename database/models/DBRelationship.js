class DBRelationship {
  score;
  states;

  hasCommonFrontier = false;
  inWar = false;
  
  constructor(rawObj) {
    this.score = typeof(rawObj?.score) === 'number' ? rawObj.score : 0;
    this.states = Array.isArray(rawObj.states) ? rawObj.states : [];
  }
}
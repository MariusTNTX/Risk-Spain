class DBRelationship {
  hasCommonFrontier;
  states;
  score;

  inWar = false;
  
  constructor(rawObj) {
    this.hasCommonFrontier = typeof(rawObj?.hasCommonFrontier) === 'boolean' ? rawObj.hasCommonFrontier : null;
    this.states = Array.isArray(rawObj.states) ? rawObj.states : [];
    this.score = Math.floor(Math.random() * ENV.inflexRelationshipScore) + (ENV.maxRelationshipScore - ENV.inflexRelationshipScore + 1);
  }

  initStatesRelationshipFromDB(){
    DB.states.find(s => s.name === this.states[0]).addDataFromDBRelationship(this);
    DB.states.find(s => s.name === this.states[1]).addDataFromDBRelationship(this);
  }
}
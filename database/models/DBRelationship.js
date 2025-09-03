class DBRelationship {
  score;
  
  /* Many to Many */ states;
  
  hasCommonFrontier = false;
  inWar = false;
  
  constructor(rawObj) {
    this.states = Array.isArray(rawObj.states) ? rawObj.states : [];
    this.score = Math.floor(Math.random() * ENV.inflexRelationshipScore) + (ENV.maxRelationshipScore - ENV.inflexRelationshipScore + 1);
  }

  calcProperties(){
    this.hasCommonFrontier = DB.links.some(link => 
      link.locations.some(location => location.province.state === this.states[0]) &&
      link.locations.some(location => location.province.state === this.states[1])
    );
  }
}
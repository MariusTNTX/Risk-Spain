class DBRelationship {
  score;
  
  /* Many to Many */ states;
  
  hasCommonFrontier = false;
  inWar = false;
  
  constructor(rawObj) {
    this.states = Array.isArray(rawObj.states) ? rawObj.states : [];
    this.score = Math.floor(Math.random() * (ENV.maxInitialRelationshipScore - ENV.minInitialRelationshipScore + 1)) + ENV.minInitialRelationshipScore;
  }

  calcProperties(){
    this.hasCommonFrontier = DB.links.some(link => 
      link.locations.some(location => location.province.state === this.states[0]) &&
      link.locations.some(location => location.province.state === this.states[1])
    );
  }

  updateScore(){
    let previousScore = this.score;
    if(!!Math.round(Math.random()) && previousScore < 100) {
      this.score++;
    } else if(previousScore > 0) {
      this.score--;
    }

    if(this.hasCommonFrontier && this.score < ENV.inflexRelationshipScore && previousScore >= ENV.inflexRelationshipScore) {
      this.declareWar();
    } else if(this.hasCommonFrontier && this.score >= ENV.inflexRelationshipScore && previousScore < ENV.inflexRelationshipScore) {
      this.declarePeace();
    }
  };

  declareWar(){
    this.score = ENV.averageWarRelationshipScore;
    this.inWar = true;
    console.log(`Se declara la guerra entre ${this.states[0].name} y ${this.states[1].name}:`);
    this.states.map(s => s.checkConflictSituation());
  }
  
  declarePeace(){
    this.score = ENV.averagePeaceRelationshipScore;
    this.inWar = false;
    console.log(`Se declara la paz entre ${this.states[0].name} y ${this.states[1].name}:`);
    this.states.map(s => s.checkConflictSituation());
  }
}
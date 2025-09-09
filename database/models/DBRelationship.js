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
    console.log(`A war has been declared between ${this.states[0].name} and ${this.states[1].name}:`, this);
    this.states.map(s => s.checkConflictSituation());
  }
  
  declarePeace(){
    this.score = ENV.averagePeaceRelationshipScore;
    this.inWar = false;
    console.log(`Peace has been declared between ${this.states[0].name} and ${this.states[1].name}:`, this);
    this.states.map(s => s.checkConflictSituation());
  }
}
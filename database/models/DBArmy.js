class DBArmy {
  state;
  departureLocation;
  originalTargetLocation;
  originalTroops;
  fullRoute;
  
  enemyState;
  currentElement;
  currentTargetLocation;
  currentTroops;
  currentRouteIndex = -1;
  inBattle = false;
  polygon = null;
  
  constructor(rawObj) {
    this.state = rawObj.state || null;
    this.departureLocation = rawObj.departureLocation || null;
    this.originalTargetLocation = rawObj.targetLocation || null;
    this.fullRoute = rawObj.fullRoute || [];
    this.originalTroops = rawObj.troops || 0;
    
    this.enemyState = this.originalTargetLocation.currentState;
    this.currentMapElement = this.departureLocation.circle;
    this.currentTargetLocation = this.originalTargetLocation;
    this.currentTroops = this.originalTroops;
    this.currentElement = this.departureLocation.circle;
  }

  moveArmy = () => {
    if(!this.inBattle){
      if(this.currentRouteIndex >= 0){
        let previousRouteStep = this.fullRoute[this.currentRouteIndex];
        previousRouteStep.currentArmies = previousRouteStep.currentArmies.filter(a => a !== this);
      }
      this.currentRouteIndex++;
      let currentRouteStep = this.fullRoute[this.currentRouteIndex];
      currentRouteStep.currentArmies.push(this);
      this.currentElement = this.currentRouteIndex % 2 ? currentRouteStep.line : currentRouteStep.circle;
      renderArmySquare(this);
      if(this.currentRouteIndex + 1 < this.fullRoute.length && !currentRouteStep.currentArmies.some(a => a.state === this.enemyState)){
        const tics = this.currentRouteIndex % 2 
        ? Math.ceil(currentRouteStep.distance * (1 / (currentRouteStep.isMaritim ? ENV.armySeaMetersPerTic : ENV.armyLandMetersPerTic))) 
        : ENV.armyLocationRestTics;
        addEvent(tics, this.moveArmy);
      } else {
        addEvent(1, this.initAttack);
      }
    }
  };
  
  initAttack = () => {
    console.log('initAttack');
    this.inBattle = true;
    let enemyArmies = this.fullRoute[this.currentRouteIndex].currentArmies.filter(a => a.state === this.enemyState);
    enemyArmies.map(a => {
      a.inBattle = true;
      renderArmySquare(a);
      return a;
    });
    renderArmySquare(this);
  }
}
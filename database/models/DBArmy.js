class DBArmy {
  state;
  departureLocation;
  originalTargetLocation;
  originalTroops;
  routeLocations;
  
  enemyState;
  isBetweenLocations = false;
  currentElement;
  currentTargetLocation;
  currentTroops;
  inBattle = false;
  
  constructor(rawObj) {
    this.state = rawObj.state || null;
    this.departureLocation = rawObj.departureLocation || null;
    this.originalTargetLocation = rawObj.targetLocation || null;
    this.routeLocations = rawObj.routeLocations || [];
    this.originalTroops = rawObj.troops || 0;
    
    this.enemyState = this.originalTargetLocation.currentState;
    this.currentMapElement = this.departureLocation.circle;
    this.currentTargetLocation = this.originalTargetLocation;
    this.currentTroops = this.originalTroops;
    this.currentElement = this.departureLocation.circle;
  }
}
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
  number;
  
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
    this.state.armyCount++;
    this.number = this.state.armyCount;
  }

  moveArmy = () => {
    if(!this.inBattle){
      if(this.currentRouteIndex >= 0){
        const previousRouteStep = this.fullRoute[this.currentRouteIndex];
        previousRouteStep.currentArmies = previousRouteStep.currentArmies.filter(a => a !== this);
      }
      if(this.currentRouteIndex >= this.fullRoute.length -1){
        this.increaseRoute();
      }
      this.currentRouteIndex++;
      const currentStepIsLine = this.currentRouteIndex % 2;
      const currentRouteStep = this.fullRoute[this.currentRouteIndex];
      currentRouteStep.currentArmies.push(this);
      this.currentElement = currentStepIsLine ? currentRouteStep.line : currentRouteStep.circle;
      renderArmySquare(this);
      /* !currentStepIsLine && console.log(`El ejército ${this.number} de ${this.state.name} llega a ${currentRouteStep.name} (${currentRouteStep.currentState.name})`); */

      let routeHasFinished = this.currentRouteIndex + 1 >= this.fullRoute.length;
      const currentStepIsEnemy = !currentStepIsLine ? currentRouteStep.currentState === this.enemyState : false;
      const enemiesInCurrentStep = currentRouteStep.currentArmies.some(a => a.state === this.enemyState);

      /* INCREASE ROUTE = Actual es el objetivo pero es amigo (después "move army") */
      if(routeHasFinished && !currentStepIsEnemy){
        if(!!this.increaseRoute()){
          routeHasFinished = false;
        } else {
          /* TODO DISOLVE = No hay más enemigos */
        }
      }

      /* MOVE ARMY = Actual no es objetivo, es amigo y no hay ejército enemigo */
      if(!routeHasFinished && !currentStepIsEnemy && !enemiesInCurrentStep){
        this.sendMoveArmyEvent();
        return;
      }

      /* INIT ATTACK */
      /* Actual es el objetivo y es enemigo */
      /* Actual no es objetivo pero es enemigo */
      /* Actual no es objetivo, es amigo, pero hay un ejército enemigo */
      if((routeHasFinished && currentStepIsEnemy) || 
        (!routeHasFinished && currentStepIsEnemy) || 
        (!routeHasFinished && !currentStepIsEnemy && enemiesInCurrentStep)){
        currentRouteStep.initAttack();
        return;
      }
    }
  };

  sendMoveArmyEvent(){
    /* console.log(`Enviando evento de movimiento al ejército ${this.number} de ${this.state.name}`); */
    const currentStepIsLine = this.currentRouteIndex % 2;
    const currentRouteStep = this.fullRoute[this.currentRouteIndex];
    const tics = currentStepIsLine
      ? Math.ceil(currentRouteStep.distance * (1 / (currentRouteStep.isMaritim ? ENV.armySeaMetersPerTic : ENV.armyLandMetersPerTic))) 
      : ENV.armyLocationRestTics;
    addEvent(tics, this.moveArmy);
  }

  increaseRoute(){
    console.log(`Incrementando la ruta del ejército ${this.number} de ${this.state.name}`);
    const currentRouteStep = this.fullRoute[this.currentRouteIndex];
    const newRouteFragment = getArmyRoute(currentRouteStep, [...this.state.locations, ...this.enemyState.locations], (l) => l.currentState === this.enemyState)?.reverse();
    !newRouteFragment && console.warn(`Imposible ampliar la ruta`);
    if(newRouteFragment.length){
      const fullNewRouteFragment = newRouteFragment.reduce((route, location, i) => {
        route.push(location);
        if(i + 1 < newRouteFragment.length){
          route.push(location.links.find(link => link.locations.includes(location) && link.locations.includes(newRouteFragment[i+1])));
        }
        return route;
      }, []);
      fullNewRouteFragment.shift();
      this.fullRoute.push(...fullNewRouteFragment);
      this.currentTargetLocation = fullNewRouteFragment[fullNewRouteFragment.length - 1];
      console.log(`Ruta ampliada hacia ${this.currentTargetLocation.name} (${this.currentTargetLocation.currentState.name}):`, this.fullRoute);
      return fullNewRouteFragment;
    }
    return null;
  }

  die(){
    console.log(`Desaparece el ejército ${this.number} de ${this.state.name}`);
    let index = this.state.currentArmies.findIndex(a => a === this);
    if(index >= 0){
      this.state.currentArmies.splice(index, 1);
    }
    DB.armies.deleteArmy(this);
    STORAGE.map.removeLayer(this.polygon);
  }
}
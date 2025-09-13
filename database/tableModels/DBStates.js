class DBStates extends DBTable {
  constructor(){
    super(STATE_LIST.map(rawObj => new DBState(rawObj)));
  }

  calcProperties(){
    this.updateTargetLocations();
    this.list.map(state => state.calcProperties());
  }

  updateTargetLocations(){
    this.forEach(state => {
      state.currentTargetLocations = [];
      return state;
    });
    DB.links.map(link => {
      const loc0 = link.locations[0];
      const loc1 = link.locations[1];
      if(loc0.currentState.name !== loc1.currentState.name){
        if(!loc0.currentState.currentTargetLocations.includes(loc1)){
          loc0.currentState.currentTargetLocations.push(loc1);
        }
        if(!loc1.currentState.currentTargetLocations.includes(loc0)){
          loc1.currentState.currentTargetLocations.push(loc0);
        }
      }
    });
  }
}
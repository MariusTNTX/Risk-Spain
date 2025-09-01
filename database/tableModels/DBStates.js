class DBStates extends DBTable {
  constructor(){
    super(STATE_LIST.map(rawObj => new DBState(rawObj)));
  }

  init(){
    this.list.forEach(state => {
      state.provinces = state.provinces.map(provinceName => {
        let provinceObject = BBDD.provinces.find(province => province.name === provinceName);
        provinceObject.state = state;
        return provinceObject;
      });
      this.list.map(targetState => {
        if(state !== targetState){
          let relationship = new DBRelationship({ 
            states: [ state, targetState ], 
            score: Math.floor(Math.random() * ENV.inflexRelationshipScore) + (ENV.maxRelationshipScore - ENV.inflexRelationshipScore + 1)
          });
          state.relationships.push(relationship);
          if(!BBDD.relationships.some(r => r.states.includes(state) && r.states.includes(targetState))){
            BBDD.relationships.push(relationship);
          }
        }
      });
      return state;
    });
  }
}
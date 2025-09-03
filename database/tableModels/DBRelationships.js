class DBRelationships extends DBTable {
  constructor(){
    super(
      STATE_LIST.reduce((result, originState) => {
        STATE_LIST.map(targetState => {
          if(originState !== targetState && !result.some(r => r.states.includes(originState) && r.states.includes(targetState))){
            result.push(new DBRelationship({ states: [originState, targetState] }));
          }
        });
        return result;
      }, [])
    );
  }
  
  setRelationshipStateRelations(){
    this.list.forEach(relationship => {
      relationship.states = DB.states.filter(state => relationship.states.some(s => s.name === state.name));
      relationship.states.map(state => state.relationships.push(relationship));
      return relationship;
    });
  }

  calcProperties(){
    this.list.map(relationship => relationship.calcProperties());
  }

  getRawData(){
    return this.list.map(relationship => {
      let result = { ...relationship };
      result.states = result.states.map(s => s.name);
      delete result.score;
      delete result.inWar;
      return result;
    });
  }
}
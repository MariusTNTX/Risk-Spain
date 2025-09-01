class DBRelationships extends DBTable {
  constructor(){
    super([]);
  }

  init(){
    this.list.forEach(relationship => {
      relationship.hasCommonFrontier = BBDD.links.some(link => 
        link.locations.some(l => l.currentState.name === relationship.states[0].name) && 
        link.locations.some(l => l.currentState.name === relationship.states[1].name)
      );
      return relationship;
    });
  }
}
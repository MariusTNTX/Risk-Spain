class DBRelationships extends DBTable {
  constructor(){
    super(RELATIONSHIP_LIST.map(rawObj => new DBRelationship(rawObj)));
  }

  init(){
    this.list.forEach(relationship => {
      relationship.initStatesRelationshipFromDB();
      return relationship;
    });
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
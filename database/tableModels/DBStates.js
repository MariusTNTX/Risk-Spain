class DBStates extends DBTable {
  constructor(){
    super(STATE_LIST.map(rawObj => new DBState(rawObj)));
  }

  calcProperties(){
    this.list.map(state => state.calcProperties());
  }
}
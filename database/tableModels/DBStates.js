class DBStates extends DBTable {
  constructor(){
    super(STATE_LIST.map(rawObj => new DBState(rawObj)));
  }

  init(){
    this.list.forEach(state => {
      state.initProvincesFromDB();
      return state;
    });
  }
}
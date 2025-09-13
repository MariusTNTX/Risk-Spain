class DBArmies extends DBTable {
  constructor(){
    super([]);
  }

  deleteArmy(army){
    let index = this.list.findIndex(a => a === army);
    if(index >= 0){
      this.splice(index, 1);
    }
  }
}
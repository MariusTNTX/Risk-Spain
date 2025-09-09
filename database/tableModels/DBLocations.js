class DBLocations extends DBTable {

  totalDefaultTroops = 0;
  troopsPerDeployment = 0;

  constructor(){
    super(LOCATION_LIST.map(rawObj => new DBLocation(rawObj)));
  }

  setLocationProvinceRelations(){
    this.list.forEach(location => {
      location.province = DB.provinces.find(province => province.name === location.province);
      location.province.locations.push(location);
      return location;
    });
  }

  calcProperties(){
    this.list.map(location => {
      location.calcProperties();
      this.totalDefaultTroops += location.defaultTroops;
    });
    this.troopsPerDeployment = Math.ceil(this.totalDefaultTroops * ENV.defaultTroopPercentPerTroopDeployment);
  }

  createNewTroopDeployment = () => {
    let newTroops = [];
    for(let i = 0; i < this.troopsPerDeployment; i++){
      newTroops.push(Math.floor(Math.random() * this.totalDefaultTroops) + 1);
    }
    console.log('New troops:', this.troopsPerDeployment);
    let currentTroopsAccumulated = 0;
    this.list.map(location => {
      currentTroopsAccumulated += location.currentTroops;
      let originalNewTroopLength = newTroops.length;
      newTroops = newTroops.filter(troopNumber => troopNumber > currentTroopsAccumulated);
      let newTroopNumber = originalNewTroopLength - newTroops.length;
      if(location.currentTroops < location.maxTroops && originalNewTroopLength !== newTroops.length){
        location.currentTroops = (location.currentTroops + newTroopNumber > location.maxTroops)
          ? location.maxTroops 
          : location.currentTroops + newTroopNumber;
        renderLocationCircle(location);
      }
      return location;
    });
    addEvent(ENV.ticsPerTroopDeployment, this.createNewTroopDeployment);
  }
}
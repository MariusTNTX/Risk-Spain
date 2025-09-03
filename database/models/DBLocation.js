class DBLocation {
  height;
  id;
  latitude;
  longitude;
  name;
  population;

  /* Many to One */ province;
  
  /* Many to Many */ links = [];
  
  /* CALC */ currentState = null;
  
  circle = null;
  currentTroops = 0;
  defaultTroops = 0;
  maxTroops = 0;
  
  constructor(rawObj) {
    this.height = typeof(rawObj?.height) === 'number' ? rawObj.height : null;
    this.id = typeof(rawObj?.id) === 'string' ? rawObj.id : null;
    this.latitude = typeof(rawObj?.latitude) === 'number' ? rawObj.latitude : null;
    this.longitude = typeof(rawObj?.longitude) === 'number' ? rawObj.longitude : null;
    this.name = typeof(rawObj?.name) === 'string' ? rawObj.name : null;
    this.population = typeof(rawObj?.population) === 'number' ? rawObj.population : null;
    this.province = typeof(rawObj?.province) === 'string' ? rawObj.province : null;

    let defaultTroops = Math.round(this.population * ENV.troopsPerInhabitant);
    this.defaultTroops = defaultTroops > ENV.minDefaultTroopsByLocation ? defaultTroops : ENV.minDefaultTroopsByLocation;
    this.currentTroops = this.defaultTroops;
    this.maxTroops = this.defaultTroops * ENV.maxTroopsPerDefaultTroop;
  }

  calcProperties(){
    this.currentState = this.province.state;
  }
}
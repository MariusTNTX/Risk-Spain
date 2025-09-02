class DBState {
  color;
  name;
  provinces;

  locations = [];
  maxTroops = 0;
  relationships = [];
  totalDefaultTroops = 0;
  totalPopulation = 0;
  
  constructor(rawObj) {
    this.color = typeof(rawObj?.color) === 'string' ? rawObj.color : null;
    this.name = typeof(rawObj?.name) === 'string' ? rawObj.name : null;
    this.provinces = Array.isArray(rawObj?.provinces) ? rawObj.provinces : [];
  }

  initProvincesFromDB(){
    this.provinces = this.provinces.map(provinceName => {
      let province = DB.provinces.find(p => p.name === provinceName);
      province.state = this;
      return province;
    });
  }

  addDataFromDBRelationship(relationship){
    this.relationships.push(relationship);
  }

  addDataFromDBLocation(location){
    this.totalPopulation += location.population;
    this.totalDefaultTroops += location.defaultTroops;
    this.maxTroops += location.maxTroops;
    this.locations.push(location);
  }
}
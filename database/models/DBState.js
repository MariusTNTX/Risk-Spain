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
}
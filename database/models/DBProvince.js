class DBProvince {
  name;
  color;

  /* One to Many */ locations = [];
  /* Many to One */ community;
  /* Many to One */ state = null;

  maxTroops = 0;
  totalDefaultTroops = 0;
  totalPopulation = 0;

  constructor(rawObj) {
    this.community = typeof(rawObj?.community) === 'string' ? rawObj.community : null;
    this.name = typeof(rawObj?.name) === 'string' ? rawObj.name : null;
    this.color = typeof(rawObj?.color) === 'string' ? rawObj.color : null;
  }

  calcProperties(){
    this.locations.map(location => {
      this.maxTroops += location.maxTroops;
      this.totalDefaultTroops += location.defaultTroops;
      this.totalPopulation += location.population;
    })
  }
}
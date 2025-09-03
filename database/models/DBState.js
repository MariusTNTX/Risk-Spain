class DBState {
  color;
  name;

  /* One to Many */ provinces;
  
  /* Many to Many */ relationships = [];
  
  /* CALC */ locations = [];

  maxTroops = 0;
  totalDefaultTroops = 0;
  totalPopulation = 0;
  
  constructor(rawObj) {
    this.color = typeof(rawObj?.color) === 'string' ? rawObj.color : null;
    this.name = typeof(rawObj?.name) === 'string' ? rawObj.name : null;
    this.provinces = Array.isArray(rawObj?.provinces) ? rawObj.provinces : [];
  }

  addDBProvince(province){
    let index = this.provinces.findIndex(p => p === province.name);
    if(index >= 0){
      this.provinces[index] = province;
    }
  }

  calcProperties(){
    this.locations = this.provinces.reduce((result, province) => {
      result.push(...province.locations);
      return result;
    }, []);
    this.locations.map(location => {
      this.maxTroops += location.maxTroops;
      this.totalDefaultTroops += location.defaultTroops;
      this.totalPopulation += location.population;
    });
  }
}
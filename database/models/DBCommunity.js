class DBCommunity {
  color;
  name;
  provinces;
  
  constructor(rawObj) {
    this.color = typeof(rawObj?.color) === 'string' ? rawObj.color : null;
    this.name = typeof(rawObj?.name) === 'string' ? rawObj.name : null;
    this.provinces = Array.isArray(rawObj?.provinces) ? rawObj.provinces : null;
  }

  initProvincesFromDB(){
    this.provinces = this.provinces.map(provinceName => {
      return DB.provinces.find(province => province.name === provinceName);
    });
  }
}
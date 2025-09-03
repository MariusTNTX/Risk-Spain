class DBCommunity {
  color;
  name;

  /* One to Many */ provinces;
  
  constructor(rawObj) {
    this.color = typeof(rawObj?.color) === 'string' ? rawObj.color : null;
    this.name = typeof(rawObj?.name) === 'string' ? rawObj.name : null;
    this.provinces = Array.isArray(rawObj?.provinces) ? rawObj.provinces : null;
  }

  addDBProvince(province){
    let index = this.provinces.findIndex(p => p === province.name);
    if(index >= 0){
      this.provinces[index] = province;
    }
  }
}
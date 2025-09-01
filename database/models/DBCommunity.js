class DBCommunity {
  color;
  name;
  provinces = [];
  
  constructor(rawObj) {
    this.color = typeof(rawObj?.color) === 'string' ? rawObj.color : null;
    this.name = typeof(rawObj?.name) === 'string' ? rawObj.name : null;
  }
}
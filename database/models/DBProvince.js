class DBProvince {
  name;
  community;
  color;
  
  constructor(rawObj) {
    this.community = typeof(rawObj?.community) === 'string' ? rawObj.community : null;
    this.name = typeof(rawObj?.name) === 'string' ? rawObj.name : null;
    this.color = typeof(rawObj?.color) === 'string' ? rawObj.color : null;
  }
}
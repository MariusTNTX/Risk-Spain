class DBLocation {
  circle;
  community;
  currentState;
  currentTroops = 0;
  height;
  id;
  latitude;
  links = [];
  longitude;
  maxTroops = 0;
  name;
  population;
  province;
  
  constructor(rawObj) {
    this.community = typeof(rawObj?.community) === 'string' ? rawObj.community : null;
    this.height = typeof(rawObj?.height) === 'number' ? rawObj.height : null;
    this.id = typeof(rawObj?.id) === 'string' ? rawObj.id : null;
    this.latitude = typeof(rawObj?.latitude) === 'number' ? rawObj.latitude : null;
    this.longitude = typeof(rawObj?.longitude) === 'number' ? rawObj.longitude : null;
    this.name = typeof(rawObj?.name) === 'string' ? rawObj.name : null;
    this.population = typeof(rawObj?.population) === 'number' ? rawObj.population : null;
    this.province = typeof(rawObj?.province) === 'string' ? rawObj.province : null;
  }
}
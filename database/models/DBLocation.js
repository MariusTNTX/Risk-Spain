class DBLocation {
  community;
  height;
  id;
  latitude;
  longitude;
  name;
  population;
  province;
  
  circle = null;
  currentState = null;
  currentTroops = 0;
  defaultTroops = 0;
  links = [];
  maxTroops = 0;
  
  constructor(rawObj) {
    this.community = typeof(rawObj?.community) === 'string' ? rawObj.community : null;
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

  initCommunityFromDB(){
    this.community = DB.communities.find(community => community.name === this.community);
  }

  initProvinceFromDB(){
    this.province = DB.provinces.find(province => province.name === this.province);
    this.province.addDataFromDBLocation(this);
  }

  initCurrentStateFromDB(){
    this.currentState = this.province.state;
    this.currentState.addDataFromDBLocation(this);
  }

  addLinkFrom(link){
    this.links.push(link);
  }
}
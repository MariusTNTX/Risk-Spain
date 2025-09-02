class DBProvince {
  name;
  community;
  color;

  community = null;
  maxTroops = 0;
  state = null;
  totalDefaultTroops = 0;
  totalPopulation = 0;

  
  constructor(rawObj) {
    this.community = typeof(rawObj?.community) === 'string' ? rawObj.community : null;
    this.name = typeof(rawObj?.name) === 'string' ? rawObj.name : null;
    this.color = typeof(rawObj?.color) === 'string' ? rawObj.color : null;
  }

  initCommunityFromDB(){
    this.community = DB.communities.find(community => community.name === this.community);
  }

  addDataFromDBLocation(location){
    this.totalPopulation += location.population;
    this.totalDefaultTroops += location.defaultTroops;
    this.maxTroops += location.maxTroops;
  }
}
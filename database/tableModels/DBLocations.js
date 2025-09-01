class DBLocations extends DBTable {
  constructor(){
    super(LOCATION_LIST.map(rawObj => new DBLocation(rawObj)));
  }

  init(){
    this.list.forEach(location => {
      location.community = BBDD.communities.find(community => community.name === location.community);
      location.province = BBDD.provinces.find(province => province.name === location.province);
      let defaultTroops = Math.round(location.population * ENV.troopsPerInhabitant);
      location.defaultTroops = defaultTroops > ENV.minDefaultTroopsByLocation ? defaultTroops : ENV.minDefaultTroopsByLocation;
      location.currentTroops = location.defaultTroops;
      location.maxTroops = location.defaultTroops * ENV.maxTroopsPerDefaultTroop;
      location.province.totalPopulation += location.population;
      location.province.totalDefaultTroops += location.defaultTroops;
      location.province.maxTroops += location.maxTroops;
      location.province.state.totalPopulation += location.population;
      location.province.state.totalDefaultTroops += location.defaultTroops;
      location.province.state.maxTroops += location.maxTroops;
      location.currentState = location.province.state;
      location.currentState.locations.push(location);
      BBDD.links.forEach(link => {
        let index = link.locations.findIndex(id => id === location.id);
        if(index >= 0){
          link.locations[index] = location;
          if(!location.links){
            location.links = [link];
          } else {
            location.links.push(link);
          }
        }
        return link;
      });
      return location;
    });
  }
}
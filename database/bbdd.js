var BBDD = {
  communities: COMMUNITY_LIST,
  provinces: PROVINCE_LIST,
  states: STATE_LIST,
  locations: LOCATION_LIST,
  links: LINK_LIST,
  relationships: [],
  init: () => {
    BBDD.communities.forEach(community => {
      community.provinces = community.provinces.map(provinceName => {
        return BBDD.provinces.find(province => province.name === provinceName);
      });
      return community;
    });
    
    BBDD.provinces.forEach(province => {
      province.community = BBDD.communities.find(community => community.name === province.community);
      province.totalPopulation = 0;
      province.totalDefaultTroops = 0;
      province.maxTroops = 0;
      return province;
    });

    BBDD.states.forEach(state => {
      state.provinces = state.provinces.map(provinceName => {
        let provinceObject = BBDD.provinces.find(province => province.name === provinceName);
        provinceObject.state = state;
        return provinceObject;
      });
      state.relationships = [];
      BBDD.states.map(targetState => {
        if(state !== targetState){
          let relationship = { score: 100, states: [ state, targetState ] };
          state.relationships.push(relationship);
          if(!BBDD.relationships.some(r => r.states.includes(state) && r.states.includes(targetState))){
            BBDD.relationships.push(relationship);
          }
        }
      });
      state.locations = [];
      state.totalPopulation = 0;
      state.totalDefaultTroops = 0;
      state.maxTroops = 0;
      return state;
    });
    
    BBDD.locations.forEach(location => {
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

BBDD.init();
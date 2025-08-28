var BBDD = {
  communities: COMMUNITY_LIST,
  provinces: PROVINCE_LIST,
  states: STATE_LIST,
  locations: LOCATION_LIST,
  links: LINK_LIST,
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
      return province;
    });

    BBDD.states.forEach(state => {
      state.provinces = state.provinces.map(provinceName => {
        let provinceObject = BBDD.provinces.find(province => province.name === provinceName);
        provinceObject.state = state;
        return provinceObject;
      });
      state.totalPopulation = 0;
      state.totalDefaultTroops = 0;
      return state;
    });
    
    BBDD.locations.forEach(location => {
      location.community = BBDD.communities.find(community => community.name === location.community);
      location.province = BBDD.provinces.find(province => province.name === location.province);
      let defaultTroops = Math.round(location.population / 1000);
      location.defaultTroops = defaultTroops > 1 ? defaultTroops : 1;
      location.province.totalPopulation += location.population;
      location.province.totalDefaultTroops += location.defaultTroops;
      location.province.state.totalPopulation += location.population;
      location.province.state.totalDefaultTroops += location.defaultTroops;
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
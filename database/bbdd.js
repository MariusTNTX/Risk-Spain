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
      return province;
    });

    BBDD.states.forEach(state => {
      state.provinces = state.provinces.map(provinceName => {
        let provinceObject = BBDD.provinces.find(province => province.name === provinceName);
        provinceObject.state = state;
        return provinceObject;
      });
      return state;
    });
    
    BBDD.locations.forEach(location => {
      location.community = BBDD.communities.find(community => community.name === location.community);
      location.province = BBDD.provinces.find(province => province.name === location.province);
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
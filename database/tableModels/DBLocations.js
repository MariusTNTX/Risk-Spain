class DBLocations extends DBTable {
  constructor(){
    super(LOCATION_LIST.map(rawObj => new DBLocation(rawObj)));
  }

  init(){
    this.list.forEach(location => {
      location.initCommunityFromDB();
      location.initProvinceFromDB();
      location.initCurrentStateFromDB();
      return location;
    });
  }
}
class DBLocations extends DBTable {
  constructor(){
    super(LOCATION_LIST.map(rawObj => new DBLocation(rawObj)));
  }

  setLocationProvinceRelations(){
    this.list.forEach(location => {
      location.province = DB.provinces.find(province => province.name === location.province);
      location.province.locations.push(location);
      return location;
    });
  }

  calcProperties(){
    this.list.map(location => location.calcProperties());
  }
}
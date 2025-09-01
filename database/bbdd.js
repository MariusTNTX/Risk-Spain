class BBDD {
  static communities = new DBCommunities();
  static provinces = new DBProvinces();
  static states = new DBStates();
  static locations = new DBLocations();
  static links = new DBLinks();
  static relationships = new DBRelationships();

  static init() {
    this.communities.init();
    this.provinces.init();
    this.states.init();
    this.locations.init();
    this.links.init();
    this.relationships.init();
  }
}
class DB {
  static communities = new DBCommunities();
  static provinces = new DBProvinces();
  static states = new DBStates();
  static locations = new DBLocations();
  static links = new DBLinks();
  static relationships = new DBRelationships();
  static armies = new DBArmies();

  static init() {
    this.links.setLinkLocationRelations();
    this.relationships.setRelationshipStateRelations();
    this.provinces.setProvinceCommunityRelations();
    this.provinces.setProvinceStateRelations();
    this.locations.setLocationProvinceRelations();

    this.locations.calcProperties();
    this.provinces.calcProperties();
    this.relationships.calcProperties();
    this.states.calcProperties();
  }
}
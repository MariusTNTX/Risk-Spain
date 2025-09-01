class DBCommunities extends DBTable {
  constructor(){
    super(COMMUNITY_LIST.map(rawObj => new DBCommunity(rawObj)));
  }

  init(){
    this.list.forEach(community => {
      community.provinces = community.provinces.map(provinceName => {
        return BBDD.provinces.find(province => province.name === provinceName);
      });
      return community;
    });
  }
}
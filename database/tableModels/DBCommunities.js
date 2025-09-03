class DBCommunities extends DBTable {
  constructor(){
    super(COMMUNITY_LIST.map(rawObj => new DBCommunity(rawObj)));
  }
}
class DBProvinces extends DBTable {
  constructor(){
    super(PROVINCE_LIST.map(rawObj => new DBProvince(rawObj)));
  }

  setProvinceCommunityRelations(){
    this.list.forEach(province => {
      province.community = DB.communities.find(community => community.name === province.community);
      province.community.addDBProvince(province);
      return province;
    });
  }

  setProvinceStateRelations(){
    this.list.forEach(province => {
      province.state = DB.states.find(state => state.provinces.includes(province.name));
      province.state.addDBProvince(province);
      return province;
    });
  }

  calcProperties(){
    this.list.map(province => province.calcProperties());
  }
}
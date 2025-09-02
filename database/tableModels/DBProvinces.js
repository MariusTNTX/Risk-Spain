class DBProvinces extends DBTable {
  constructor(){
    super(PROVINCE_LIST.map(rawObj => new DBProvince(rawObj)));
  }

  init(){
    this.list.forEach(province => {
      province.initCommunityFromDB();
      return province;
    });
  }
}
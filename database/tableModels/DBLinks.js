class DBLinks extends DBTable {
  constructor(){
    super(LINK_LIST.map(rawObj => new DBLink(rawObj)));
  }

  init() { }

  getRawData(){
    return this.list.map(link => {
      let result = { ...link };
      result.locations = result.locations.map(l => l.id);
      delete result.line;
      return result;
    });
  }
}
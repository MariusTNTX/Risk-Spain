class DBLinks extends DBTable {
  constructor(){
    super(LINK_LIST.map(rawObj => new DBLink(rawObj)));
  }

  setLinkLocationRelations() {
    this.list.forEach(link => {
      [0, 1].map(index => {
        link.locations[index] = DB.locations.find(l => l.id === link.locations[index]);
        link.locations[index].links.push(link);
      });
      return link;
    });
  }

  getRawData(){
    return this.list.map(link => {
      let result = { ...link };
      result.locations = result.locations.map(l => l.id);
      delete result.line;
      return result;
    });
  }
}
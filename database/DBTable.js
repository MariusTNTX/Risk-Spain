class DBTable {
  list = [];
  
  constructor(list) {
    this.list = list;
  }

  getAll(){
    return this.list;
  }

  /* ARRAY METHODS */
  map(callback){
    return this.list.map(callback);
  }
  forEach(callback){
    return this.list.forEach(callback);
  }
  find(callback){
    return this.list.find(callback);
  }
  some(callback){
    return this.list.some(callback);
  }
  filter(callback){
    return this.list.filter(callback);
  }
  reduce(...data){
    return this.list.reduce(...data);
  }
  splice(...data){
    return this.list.splice(...data);
  }
  indexOf(callback){
    return this.list.indexOf(callback);
  }
  push(...data){
    return this.list.push(...data);
  }
}
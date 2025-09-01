class DBLink {
  distance;
  isMaritim;
  locations;

  line = null;
  
  constructor(rawObj) {
    this.distance = typeof(rawObj?.distance) === 'number' ? rawObj.distance : null;
    this.isMaritim = typeof(rawObj?.isMaritim) === 'boolean' ? rawObj.isMaritim : null;
    this.locations = Array.isArray(rawObj?.locations) ? rawObj.locations : [];
  }
}
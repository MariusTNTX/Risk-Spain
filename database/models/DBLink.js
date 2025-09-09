class DBLink {
  distance;
  degrees;
  isMaritim;

  /* Many to Many */ locations;

  line = null;
  
  constructor(rawObj) {
    this.distance = typeof(rawObj?.distance) === 'number' ? rawObj.distance : null;
    this.degrees = typeof(rawObj?.degrees) === 'number' ? rawObj.degrees : null;
    this.isMaritim = typeof(rawObj?.isMaritim) === 'boolean' ? rawObj.isMaritim : null;
    this.locations = Array.isArray(rawObj?.locations) ? rawObj.locations : [];
  }
}
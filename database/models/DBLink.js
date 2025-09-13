class DBLink {
  distance;
  degrees;
  isMaritim;

  /* Many to Many */ locations;

  line = null;
  currentArmies = [];
  underAttack = false;
  
  constructor(rawObj) {
    this.distance = typeof(rawObj?.distance) === 'number' ? rawObj.distance : null;
    this.degrees = typeof(rawObj?.degrees) === 'number' ? rawObj.degrees : null;
    this.isMaritim = typeof(rawObj?.isMaritim) === 'boolean' ? rawObj.isMaritim : null;
    this.locations = Array.isArray(rawObj?.locations) ? rawObj.locations : [];
  }

  initAttack(){
    this.currentArmies.map(a => {
      if(!a.inBattle){
        a.inBattle = true;
        renderArmySquare(a);
      }
      return a;
    });
    if(!this.underAttack){
      this.underAttack = true;
      addEvent(ENV.ticsPerBattleTurn, this.initBattleTurn);
    }
  }

  initBattleTurn = () => {
    console.log('initBattleTurn in', this);
  }
}
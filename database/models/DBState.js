class DBState {
  color;
  name;

  /* One to Many */ provinces;
  
  /* Many to Many */ relationships = [];
  
  /* CALC */ locations = [];

  maxTroops = 0;
  totalDefaultTroops = 0;
  totalPopulation = 0;
  armyCount = 0;
  inWar = false;
  currentTargetLocations = [];
  currentLocationAreas = [];
  currentPolygons = [];
  currentArmies = [];
  
  constructor(rawObj) {
    this.color = typeof(rawObj?.color) === 'string' ? rawObj.color : null;
    this.name = typeof(rawObj?.name) === 'string' ? rawObj.name : null;
    this.provinces = Array.isArray(rawObj?.provinces) ? rawObj.provinces : [];
  }

  /* INITIAL METHODS */

  addDBProvince(province){
    let index = this.provinces.findIndex(p => p === province.name);
    if(index >= 0){
      this.provinces[index] = province;
    }
  }

  calcProperties(){
    this.locations = this.provinces.reduce((result, province) => {
      result.push(...province.locations);
      return result;
    }, []);
    this.locations.map(location => {
      this.maxTroops += location.maxTroops;
      this.totalDefaultTroops += location.defaultTroops;
      this.totalPopulation += location.population;
    });
    this.updateCurrentAreas();
  }

  updateCurrentAreas(){
    this.currentLocationAreas = getLocationAreas(this.locations, { ignoreMaritimLinks: true });
    let polygonAreas = getLocationAreas(this.locations, { ignoreMaritimLinks: false });
    if(this.currentPolygons.length){
      this.currentPolygons.map(area => area.geoJSON.clearLayers());
    }
    this.currentPolygons = polygonAreas.map(locationList => getLocationsGeoJSON(locationList)).filter(p => !!p);
    this.currentPolygons = this.currentPolygons.map(polygon => ({ polygon, geoJSON: null }));
    renderStatePolygons(this);
  }

  conquerLocation(location){
    console.log(`${this.name} conquista ${location.name} a ${location.currentState.name}`);
    location.currentState = this;
    this.maxTroops += location.maxTroops;
    this.totalDefaultTroops += location.defaultTroops;
    this.totalPopulation += location.population;
    this.locations.push(location);
    this.updateCurrentAreas();
    renderStatePolygons(this);
    DB.states.updateTargetLocations();
  }
  
  loseLocation(location, newState){
    console.log(`${this.name} pierde ${location.name} a manos de ${newState.name}`);
    location.currentState = newState;
    this.maxTroops -= location.maxTroops;
    this.totalDefaultTroops -= location.defaultTroops;
    this.totalPopulation -= location.population;
    let index = this.locations.findIndex(l => l.id === location.id);
    if(index >= 0){
      this.locations.splice(index, 1);
    }
    this.updateCurrentAreas();
    renderStatePolygons(this);
  }

  /* GETS */

  getCurrentTroops(){
    return this.locations.reduce((total, location) => {
      total += location.currentTroops;
      return total;
    }, 0);
  }

  getRegenerationRate(){
    let troopsPerDeployment = this.totalDefaultTroops * ENV.defaultTroopPercentPerTroopDeployment;
    return troopsPerDeployment / ENV.ticsPerTroopDeployment;
  }

  getRandomArmyTroops(maxRecruitableTroops = null, maxStackableTroops = null){
    let currentTroops = this.getCurrentTroops();
    let percent = Math.random() * (ENV.maxStateTroopPercentPerArmy - ENV.minStateTroopPercentPerArmy) + ENV.minStateTroopPercentPerArmy;
    let randomTroops = Math.ceil(currentTroops * percent);
    if(maxRecruitableTroops && maxStackableTroops){
      let maxPermitedTroops = maxStackableTroops < maxRecruitableTroops ? maxStackableTroops : maxRecruitableTroops;
      return (randomTroops > maxPermitedTroops) ? maxPermitedTroops : randomTroops;
    }
    return randomTroops;
  }

  getRandomRecruitingTicsByArmyTroops(armyTroops){
    let regenerationRate = this.getRegenerationRate();
    let totalTicsRequired = armyTroops / regenerationRate;
    let maxRecruitingTics = totalTicsRequired * ENV.minRecruitingTicPercentPerArmy;
    let minRecruitingTics = totalTicsRequired * ENV.maxRecruitingTicPercentPerArmy;
    return Math.floor(Math.random() * (maxRecruitingTics - minRecruitingTics) + minRecruitingTics);
  }

  getRandomTargetLocation(){
    let relationshipsInWar = this.relationships.filter(r => r.inWar);
    let enemyStates = relationshipsInWar.map(r => r.states.find(s => s !== this));
    let targetLocations = this.currentTargetLocations.filter(l => enemyStates.includes(l.currentState));
    return targetLocations[Math.floor(Math.random() * targetLocations.length)];
  }

  /* WAR METHODS */

  checkConflictSituation(){
    let inWarNow = this.relationships.some(r => r.inWar);
    if(this.inWar !== inWarNow){
      this.inWar = inWarNow;
      this.inWar ? this.initArmyRecruiting() : this.endArmyRecruiting();
    }
  }

  initArmyRecruiting(){
    let armyTroops = this.getRandomArmyTroops();
    let finalRecruitingTics = this.getRandomRecruitingTicsByArmyTroops(armyTroops);
    /* console.log(`${this.name} enviará un nuevo ejército en ${finalRecruitingTics} tics`); */
    addEvent(finalRecruitingTics, this.setNewArmy);
  }

  endArmyRecruiting(){}

  recruitArmy(recruitableLocations, armyTroops){
    let newTroops = [];
    let recruitDefaultTroops = recruitableLocations.reduce((n, l) => {
      n += l.defaultTroops;
      return n;
    }, 0);
    for(let i = 0; i < armyTroops; i++){
      newTroops.push(Math.floor(Math.random() * recruitDefaultTroops) + 1);
    }
    let currentTroopsAccumulated = 0;
    recruitableLocations.map(location => {
      currentTroopsAccumulated += location.currentTroops;
      let originalNewTroopLength = newTroops.length;
      newTroops = newTroops.filter(troopNumber => troopNumber > currentTroopsAccumulated);
      let recruitTroopNumber = originalNewTroopLength - newTroops.length;
      if(originalNewTroopLength !== newTroops.length){
        location.currentTroops = (location.currentTroops - recruitTroopNumber > 0)
          ? location.currentTroops - recruitTroopNumber
          : 0;
        renderLocationCircle(location);
      }
      return location;
    });
  }

  createNewArmy(departureLocation, targetLocation, troops, fullRoute){
    const newArmy = new DBArmy({
      state: this,
      departureLocation,
      targetLocation,
      troops,
      fullRoute
    });
    DB.armies.push(newArmy);
    this.currentArmies.push(newArmy);
    newArmy.moveArmy();
  }
  
  setNewArmy = () => {
    if(this.inWar){
      const targetLocation = this.getRandomTargetLocation();
      const neigbourTargetLocationIds = targetLocation.adjacentLocations.filter(l => l.currentState.name === this.name).map(l => l.id);
      const currentAreaLocations = this.currentLocationAreas.filter(a => a.some(l => neigbourTargetLocationIds.includes(l.id)))[0]
      const recruitableLocations = currentAreaLocations.filter(l => !l.underAttack && l.currentTroops >= l.maxTroops * ENV.minRecruitableTroopPercent);
      const maxRecruitableTroops = recruitableLocations.reduce((troops, location) => {
        troops += location.currentTroops - Math.ceil(location.maxTroops * ENV.minRecruitableTroopPercent);
        return troops;
      }, 0);
      const maxStackableTroops = [...recruitableLocations].sort((a, b) => b.defaultTroops - a.defaultTroops)?.[0]?.defaultTroops || null;
      const armyTroops = this.getRandomArmyTroops(maxRecruitableTroops, maxStackableTroops);
      const departurableLocations = recruitableLocations.filter(l => l.defaultTroops >= armyTroops);
      const departureLocation = [...departurableLocations].sort((a, b) => {
        let aDistance = STORAGE.map.distance([ targetLocation.latitude, targetLocation.longitude ], [ a.latitude, a.longitude ]);
        let bDistance = STORAGE.map.distance([ targetLocation.latitude, targetLocation.longitude ], [ b.latitude, b.longitude ]);
        return aDistance - bDistance;
      })?.[0] || null;
      /* console.log(`Obteniendo ruta de ejército desde un territorio anfitrión hacia ${targetLocation.name} (${targetLocation.currentState.name})`); */
      const routeLocations = getArmyRoute(targetLocation, currentAreaLocations, (l) => l.defaultTroops >= armyTroops);
      const fullRoute = routeLocations.reduce((route, location, i) => {
        route.push(location);
        if(i + 1 < routeLocations.length){
          route.push(location.links.find(link => link.locations.includes(location) && link.locations.includes(routeLocations[i+1])));
        }
        return route;
      }, []);
      this.recruitArmy(recruitableLocations, armyTroops);
      this.createNewArmy(departureLocation, targetLocation, armyTroops, fullRoute);
      this.initArmyRecruiting();
    }
  }
}
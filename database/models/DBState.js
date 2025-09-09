class DBState {
  color;
  name;

  /* One to Many */ provinces;
  
  /* Many to Many */ relationships = [];
  
  /* CALC */ locations = [];

  maxTroops = 0;
  totalDefaultTroops = 0;
  totalPopulation = 0;
  inWar = false;
  currentTargetLocations = [];
  currentLocationAreas = [];
  currentPolygons = [];
  
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
    this.updateLocationLists();
  }
  
  updateLocationLists(){
    DB.links.map(link => {
      let index = link.locations.findIndex(l => l.currentState.name === this.name);
      if(index >= 0 && link.locations[0].currentState.name !== link.locations[1].currentState.name){
        if(!link.locations[0].currentState.currentTargetLocations.includes(link.locations[1])){
          link.locations[0].currentState.currentTargetLocations.push(link.locations[1]);
        }
        if(!link.locations[1].currentState.currentTargetLocations.includes(link.locations[0])){
          link.locations[1].currentState.currentTargetLocations.push(link.locations[0]);
        }
      }
    });
    this.currentLocationAreas = getLocationAreas(this.locations, { ignoreMaritimLinks: true });
    let polygonAreas = getLocationAreas(this.locations, { ignoreMaritimLinks: false });
    this.currentPolygons = polygonAreas.map(locationList => getLocationsGeoJSON(locationList)).filter(p => !!p);
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
    return targetLocations[Math.floor(Math.random() * (targetLocations.length + 1))];
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
    console.log('finalRecruitingTics', finalRecruitingTics);
    addEvent(finalRecruitingTics, this.setNewArmy);
  }

  endArmyRecruiting(){}

  setNewArmy = () => {
    try {
      if(this.inWar){
        const targetLocation = this.getRandomTargetLocation();
        console.log(this.name, 'setNewArmy against', targetLocation.currentState.name);
        const neigbourTargetLocationIds = targetLocation.adjacentLocations.filter(l => l.currentState.name === this.name).map(l => l.id);
        const recruitableLocations = this.currentLocationAreas
        .filter(a => a.some(l => neigbourTargetLocationIds.includes(l.id)))[0]
        .filter(l => !l.underAttack && l.currentTroops >= l.maxTroops * ENV.minRecruitableTroopPercent);
        const maxRecruitableTroops = recruitableLocations.reduce((troops, location) => {
          troops += location.currentTroops - Math.ceil(location.maxTroops * ENV.minRecruitableTroopPercent);
          return troops;
        }, 0);
        const maxStackableTroops = [...recruitableLocations].sort((a, b) => b.defaultTroops - a.defaultTroops)?.[0]?.defaultTroops || null;
        const armyTroops = this.getRandomArmyTroops(maxRecruitableTroops, maxStackableTroops);
        console.log('armyTroops', armyTroops);
        const departurableLocations = recruitableLocations.filter(l => l.defaultTroops >= armyTroops);
        const departureLocation = [...departurableLocations].sort((a, b) => {
          let aDistance = STORAGE.map.distance([ targetLocation.latitude, targetLocation.longitude ], [ a.latitude, a.longitude ]);
          let bDistance = STORAGE.map.distance([ targetLocation.latitude, targetLocation.longitude ], [ b.latitude, b.longitude ]);
          return aDistance - bDistance;
        })?.[0] || null;
        console.log('departureLocation', departureLocation);
        console.log('targetLocation', targetLocation);
        const routeLinks = getRouteBetween(departureLocation, targetLocation, this.locations);
        console.log('routeLinks', routeLinks);
        /* TODO Formar Ejército vacío en origin */
        /* TODO Trasladar tropas al ejército */
        /* TODO Eventos para recorrer la ruta */
        /* TODO Eventos de ataque */
        /* TODO Eventos de próximos ataques */
        this.initArmyRecruiting();
      }
    } catch (error) {
      console.error(error);
    }
  }
}
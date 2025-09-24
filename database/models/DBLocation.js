class DBLocation {
  height;
  id;
  latitude;
  longitude;
  name;
  population;

  /* Many to One */ province;
  
  /* Many to Many */ links = [];
  
  /* CALC */ currentState = null;
  
  circle = null;
  currentTroops = 0;
  defaultTroops = 0;
  maxTroops = 0;
  underAttack = false;
  adjacentLocations = [];
  currentArmies = [];
  
  constructor(rawObj) {
    this.height = typeof(rawObj?.height) === 'number' ? rawObj.height : null;
    this.id = typeof(rawObj?.id) === 'string' ? rawObj.id : null;
    this.latitude = typeof(rawObj?.latitude) === 'number' ? rawObj.latitude : null;
    this.longitude = typeof(rawObj?.longitude) === 'number' ? rawObj.longitude : null;
    this.name = typeof(rawObj?.name) === 'string' ? rawObj.name : null;
    this.population = typeof(rawObj?.population) === 'number' ? rawObj.population : null;
    this.province = typeof(rawObj?.province) === 'string' ? rawObj.province : null;

    let defaultTroops = Math.round(this.population * ENV.troopsPerInhabitant);
    this.defaultTroops = defaultTroops > ENV.minDefaultTroopsByLocation ? defaultTroops : ENV.minDefaultTroopsByLocation;
    this.currentTroops = this.defaultTroops;
    this.maxTroops = this.defaultTroops * ENV.maxTroopsPerDefaultTroop;
  }

  calcProperties(){
    this.currentState = this.province.state;
    this.adjacentLocations = this.links.reduce((locations, link) => {
      locations.push(link.locations.find(l => l !== this));
      return locations;
    }, []);
  }

  initAttack(){
    console.log(`Se inicia un nuevo ataque en ${this.name} (${this.currentState.name})`);
    this.currentArmies.map(a => {
      if(!a.inBattle){
        a.inBattle = true;
        renderArmySquare(a);
        console.log(`Entra en batalla el ejército ${a.number} de ${a.state.name}`);
      }
      return a;
    });
    if(!this.underAttack){
      this.underAttack = true;
      addEvent(ENV.ticsPerBattleTurn, this.initBattleTurn);
      console.log(`${this.name} (${this.currentState.name}) se encuentra bajo ataque`);
    }
  }

  initBattleTurn = () => {
    console.log('-------------------------------------------------------------');
    console.log(`Turno de batalla en ${this.name} (${this.currentState.name}):`);
    const battles = this.getBattles();
    !!battles?.length 
      ? console.log(`Lista de enfrentamientos: `, battles)
      : console.error(`Sin enfrentamientos: `, battles);
    let finalWinner = null;

    for(let battleArmies of battles) {
      const battleWinner = this.confrontArmies(battleArmies[0], battleArmies[1]);
      console.log(`- battleWinner`, battleWinner);
      this.currentArmies = this.currentArmies.filter(a => {
        if(a.currentTroops) renderArmySquare(a);
        else a.die();
        return !!a.currentTroops;
      });
      console.log(`- currentArmies`, this.currentArmies);
      if(!finalWinner && !!battleWinner){
        const winnerIsTerritory = battleWinner === this;
        const winnerIsEnemy = winnerIsTerritory ? false : battleWinner.state !== this.currentState;
        const enemiesLeft = this.currentArmies.some(army => army.state !== this.currentState);
        console.log(`Vencedor del enfrentamiento: ${winnerIsTerritory ? 'el territorio' : `el ejército ${battleWinner.number} de ${battleWinner.state.name}`}`);
        console.log(`- winnerIsTerritory`, winnerIsTerritory);
        console.log(`- this.currentTroops`, this.currentTroops);
        console.log(`- winnerIsEnemy`, winnerIsEnemy);
        console.log(`- enemiesLeft`, enemiesLeft);
        if(winnerIsTerritory && this.currentTroops && !enemiesLeft){
          finalWinner = battleWinner;
          console.log(`Vencedor final: El territorio`);
          break;
        } else if(!winnerIsTerritory && winnerIsEnemy && !this.currentTroops && enemiesLeft){
          finalWinner = battleWinner;
          console.log(`Vencedor final: El ejército invasor ${finalWinner.number} de ${finalWinner.state.name}`);
          break;
        } else if(!winnerIsTerritory && !winnerIsEnemy && !enemiesLeft){
          finalWinner = battleWinner;
          console.log(`Vencedor final: El ejército defensor ${finalWinner.number} de ${finalWinner.state.name}`);
          break;
        }
      }
    }

    if(finalWinner){
      const winnerIsTerritory = finalWinner === this;
      const winnerIsEnemy = winnerIsTerritory ? false : finalWinner.state !== this.currentState;
      console.log(`Terminan los turnos. Termina el ataque sobre ${this.name} (${this.currentState.name}). El vencedor es ${winnerIsTerritory ? 'el territorio' : `el ejército ${finalWinner.number} de ${finalWinner.state.name}`}`);
      this.underAttack = false;
      if(!this.currentTroops && winnerIsEnemy){
        this.resetState(finalWinner);
      }
      this.currentArmies.forEach(a => {
        a.inBattle = false;
        a.sendMoveArmyEvent();
        return a;
      });
    } else {
      console.log(`Continúan los turnos`);
      addEvent(ENV.ticsPerBattleTurn, this.initBattleTurn);
    }

    console.log('-------------------------------------------------------------');
    renderLocationCircle(this);
  }

  getBattles(){
    if(this.currentArmies.some(a => a.state === this.currentState)){
      console.log(`Las batallas se realizarán entre ejércitos`);
      return this.currentArmies.reduce((battles, army) => {
        this.currentArmies.map(a => {
          if(a !== army && army.enemyState === a.state && !battles.some(b => b.includes(a) && b.includes(army))){
            battles.push([army, a]);
          }
        })
        return battles;
      }, []);
    } else {
      console.log(`Las batallas se realizarán contra el territorio`);
      return this.currentArmies.reduce((battles, army) => {
        if(army.enemyState === this.currentState){
          battles.push([army, this]);
        }
        return battles;
      }, []);
    }
  }

  confrontArmies(army1, army2){
    if(!army1.currentTroops || !army2.currentTroops){
      console.error('Iniciando un enfrentamiento con algún contrincante sin tropas: ', army1, army2);
    }
    if(!army1.currentTroops && army2.currentTroops) return army2;
    if(army1.currentTroops && !army2.currentTroops) return army1;

    const troopsToConfront = ENV.minDeadTroopsPerTic * ENV.ticsPerBattleTurn;
    let troops1 = army1.currentTroops >= troopsToConfront ? troopsToConfront : army1.currentTroops;
    army1.currentTroops -= troops1;
    let troops2 = army2.currentTroops >= troopsToConfront ? troopsToConfront : army2.currentTroops;
    army2.currentTroops -= troops2;
    console.log(`Inicio del Enfrentamiento: 
      ${army1 === this 
        ? `Territorio de ${army1.name} (${army1.currentState.name}): ${army1.currentTroops + troops1} tropas` 
        : `Ejército ${army1.number} de ${army1.state.name}: ${army1.currentTroops + troops1} tropas`
      }
      ${army2 === this 
        ? `Territorio de ${army2.name} (${army2.currentState.name}): ${army2.currentTroops + troops2} tropas` 
        : `Ejército ${army2.number} de ${army2.state.name}: ${army2.currentTroops + troops2} tropas`
      }`);
    while(troops1 && troops2){
      if(Math.round(Math.random())){
        troops1--;
      } else {
        troops2--;
      }
    }
    army1.currentTroops += troops1;
    army2.currentTroops += troops2;
    console.log(`Final del Enfrentamiento:
      ${army1 === this 
        ? `Territorio de ${army1.name} (${army1.currentState.name}): ${army1.currentTroops} tropas` 
        : `Ejército ${army1.number} de ${army1.state.name}: ${army1.currentTroops} tropas`
      }
      ${army2 === this 
        ? `Territorio de ${army2.name} (${army2.currentState.name}): ${army2.currentTroops} tropas` 
        : `Ejército ${army2.number} de ${army2.state.name}: ${army2.currentTroops} tropas`
      }`);
    if(army1.currentTroops <= 0) return army2;
    if(army2.currentTroops <= 0) return army1;
    return null;
  }

  resetState(winnerArmy){
    this.currentState.loseLocation(this, winnerArmy.state);
    winnerArmy.state.conquerLocation(this);
    console.log(`El territorio ${this.name} (${this.currentState.name}) ahora pertenece a ${winnerArmy.state.name}`);
    
    const locationTroops = winnerArmy.currentTroops >= this.defaultTroops ? this.defaultTroops : winnerArmy.currentTroops;
    this.currentTroops = locationTroops;
    winnerArmy.currentTroops -= locationTroops;
    console.log(`El territorio ${this.name} (${this.currentState.name}) aumenta sus tropas en ${locationTroops} (de ${this.defaultTroops} tropas)`, this);
    console.log(`El ejército donante ${winnerArmy.number} de ${winnerArmy.state.name} reduce sus tropas a ${winnerArmy.currentTroops} (de ${winnerArmy.originalTroops} tropas)`, winnerArmy);
    
    if(!winnerArmy.currentTroops){
      this.currentArmies = this.currentArmies.filter(army => army.currentTroops);
      winnerArmy.die();
    }
  }
}
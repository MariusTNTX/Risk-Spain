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
    console.log(`Lista de enfrentamientos: `, battles);

    let finalWinner = null;
    battles.map(battleArmies => {
      let winner = this.confrontArmies(battleArmies[0], battleArmies[1]);
      if(!finalWinner && !!winner){
        finalWinner = winner;
      }
      return battleArmies;
    });

    this.currentArmies = this.currentArmies.filter(a => {
      if(a.currentTroops) renderArmySquare(a);
      else a.die();
      return !!a.currentTroops;
    });

    /* console.log(`Ejércitos restantes:`, this.currentArmies); */
    if(!this.currentArmies.length && !finalWinner){
      finalWinner = this;
    }

    if(finalWinner){
      console.log(`Terminan los turnos. Termina el ataque sobre ${this.name} (${this.currentState.name}). El vencedor es ${finalWinner === this ? 'el territorio' : `el ejército ${finalWinner.number} de ${finalWinner.state.name}`}`);
      this.underAttack = false;
      this.currentArmies.forEach(a => {
        a.inBattle = false;
        return a;
      });
      !this.currentTroops && finalWinner === this && console.warn('Gana el territorio con !currentTroops = false. currentTroops:', this.currentTroops);
      if(!this.currentTroops && finalWinner !== this){
        const defeatedState = this.currentState;
        this.resetState(finalWinner);
        this.currentArmies.filter(a => a.state !== defeatedState).map(a => a.sendMoveArmyEvent());
      }
    } else {
      console.log(`Continúan los turnos`);
      addEvent(ENV.ticsPerBattleTurn, this.initBattleTurn);
    }

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
    if(!army1.currentTroops || !army2.currentTroops) return;
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
    console.log(`El territorio aumenta sus tropas en ${locationTroops} (de ${this.defaultTroops} tropas`);
    console.log(`El ejército donante reduce sus tropas a ${winnerArmy.currentTroops} (de ${winnerArmy.originalTroops} tropas`);
    
    if(!winnerArmy.currentTroops){
      winnerArmy.die();
    }
  }
}
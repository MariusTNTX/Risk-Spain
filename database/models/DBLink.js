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
    console.log(`Se inicia un nuevo ataque en el enlace ${this.locations[0].name} (${this.locations[0].currentState.name}) - ${this.locations[1].name} (${this.locations[1].currentState.name})`);
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
      console.log(`Enlace ${this.locations[0].name} (${this.locations[0].currentState.name}) - ${this.locations[1].name} (${this.locations[1].currentState.name}) se encuentra bajo ataque`);
    }
  }

  initBattleTurn = () => {
    console.log('-------------------------------------------------------------');
    console.log(`Turno de batalla en enlace ${this.locations[0].name} (${this.locations[0].currentState.name}) - ${this.locations[1].name} (${this.locations[1].currentState.name}):`);
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
        const enemiesLeft = this.currentArmies.some(army => army.state !== this.currentArmies[0].state);
        console.log(`Vencedor del enfrentamiento: el ejército ${battleWinner.number} de ${battleWinner.state.name}`);
        console.log(`- enemiesLeft`, enemiesLeft);
        if(!enemiesLeft){
          finalWinner = battleWinner;
          console.log(`Vencedor final: El ejército ${finalWinner.number} de ${finalWinner.state.name}`);
          break;
        }
      }
    }

    if(finalWinner){
      console.log(`Terminan los turnos. Termina el ataque sobre enlace ${this.locations[0].name} (${this.locations[0].currentState.name}) - ${this.locations[1].name} (${this.locations[1].currentState.name}). El vencedor es el ejército ${finalWinner.number} de ${finalWinner.state.name}`);
      this.underAttack = false;
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
  }

  getBattles(){
    return this.currentArmies.reduce((battles, army) => {
      this.currentArmies.map(a => {
        if(a !== army && army.enemyState === a.state && !battles.some(b => b.includes(a) && b.includes(army))){
          battles.push([army, a]);
        }
      })
      return battles;
    }, []);
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
      ${`Ejército ${army1.number} de ${army1.state.name}: ${army1.currentTroops + troops1} tropas`}
      ${`Ejército ${army2.number} de ${army2.state.name}: ${army2.currentTroops + troops2} tropas`}
    `);
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
      ${`Ejército ${army1.number} de ${army1.state.name}: ${army1.currentTroops} tropas`}
      ${`Ejército ${army2.number} de ${army2.state.name}: ${army2.currentTroops} tropas`}
    `);
    if(army1.currentTroops <= 0) return army2;
    if(army2.currentTroops <= 0) return army1;
    return null;
  }
}
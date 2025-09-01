function addEvent(extraTics, functionToExecute) {
  let eventFunctions = STORAGE.eventList['e' + (STORAGE.currentTic + extraTics)];
  if(Array.isArray(eventFunctions)) {
    STORAGE.eventList['e' + (STORAGE.currentTic + extraTics)].push(functionToExecute);
  } else {
    STORAGE.eventList['e' + (STORAGE.currentTic + extraTics)] = [functionToExecute];
  }
}

var createNewTroopDeployment = () => {
  let totalTroops = BBDD.locations.reduce((total, location) => total += location.currentTroops, 0);
  let newTroops = [];
  for(let i = 0; i < totalTroops * ENV.newTroopsPerTroop; i++){
    newTroops.push(Math.floor(Math.random() * totalTroops) + 1);
  }
  console.log(`${totalTroops} + ${newTroops.length} = ${totalTroops + newTroops.length}`);
  let currentTroopsAccumulated = 0;
  BBDD.locations.map(location => {
    currentTroopsAccumulated += location.currentTroops;
    let originalNewTroopLength = newTroops.length;
    newTroops = newTroops.filter(troopNumber => troopNumber > currentTroopsAccumulated);
    if(location.currentTroops < location.maxTroops && originalNewTroopLength !== newTroops.length){
      location.currentTroops += originalNewTroopLength - newTroops.length;
      renderLocationCircle(location);
    }
    return location;
  });
  addEvent(ENV.ticsPerTroopDeployment, createNewTroopDeployment);
};

var updateRelationships = () => {
  BBDD.relationships.forEach(relationship => {
    let originalScore = relationship.score;
    if(!!Math.round(Math.random()) && originalScore < 100) {
      relationship.score++;
    } else if(originalScore > 0) {
      relationship.score--;
    }

    if(relationship.hasCommonFrontier && relationship.score < ENV.inflexRelationshipScore && originalScore >= ENV.inflexRelationshipScore) {
      relationship.score = ENV.averageWarRelationshipScore;
      relationship.inWar = true;
      console.log(`A war has been declared between ${relationship.states[0].name} and ${relationship.states[1].name}:`, relationship);
    } else if(relationship.hasCommonFrontier && relationship.score >= ENV.inflexRelationshipScore && originalScore < ENV.inflexRelationshipScore) {
      relationship.score = ENV.averagePeaceRelationshipScore;
      relationship.inWar = false;
      console.log(`Peace has been declared between ${relationship.states[0].name} and ${relationship.states[1].name}:`, relationship);
    }
    return relationship;
  });
  addEvent(ENV.ticsPerRelationshipUpdate, updateRelationships);
};

addEvent(ENV.ticsPerTroopDeployment, createNewTroopDeployment);
addEvent(ENV.ticsPerRelationshipUpdate, updateRelationships);